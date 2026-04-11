// 🐱 GitHub API fetch & caching
// Includes personal repos + organization repos

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  owner: { login: string };
}

interface GitHubOrg {
  login: string;
}

export interface GitHubStats {
  user: GitHubUser;
  commits: number;
  pullRequests: number;
  issues: number;
  repositories: number;
  stars: number;
  followers: number;
  languages: Record<string, number>;
  experience: number;
}

// 🐱 Per-user in-memory cache
const cache = new Map<string, { stats: GitHubStats; ts: number }>();
const TTL = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500;

export function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(u);
}

// 🐱 Paginated fetch helper
async function fetchAllPages<T>(url: string, headers: Record<string, string>): Promise<T[]> {
  const results: T[] = [];
  for (let p = 1; ; p++) {
    const sep = url.includes("?") ? "&" : "?";
    const r = await fetch(`${url}${sep}per_page=100&page=${p}`, { headers });
    if (!r.ok) break;
    const batch: T[] = await r.json();
    if (!batch.length) break;
    results.push(...batch);
  }
  return results;
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const hit = cache.get(username);
  if (hit && Date.now() - hit.ts < TTL) return hit.stats;

  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  // 🐱 User profile
  const uRes = await fetch(`https://api.github.com/users/${username}`, { headers: h });
  if (uRes.status === 404) throw new Error("User not found");
  if (!uRes.ok) throw new Error(`GitHub API ${uRes.status}`);
  const user: GitHubUser = await uRes.json();

  // 🐱 Get user's organizations
  let orgs: GitHubOrg[] = [];
  try {
    orgs = await fetchAllPages<GitHubOrg>(`https://api.github.com/users/${username}/orgs`, h);
  } catch {}

  // 🐱 Fetch personal repos (all types: owner, collaborator, member)
  const personalRepos = await fetchAllPages<GitHubRepo>(
    `https://api.github.com/users/${username}/repos?type=all`,
    h
  );

  // 🐱 Fetch organization repos
  const orgRepoPromises = orgs.map(org =>
    fetchAllPages<GitHubRepo>(`https://api.github.com/orgs/${org.login}/repos?type=public`, h)
  );
  const orgRepoArrays = await Promise.all(orgRepoPromises);
  const orgRepos = orgRepoArrays.flat();

  // 🐱 Merge & deduplicate repos by full_name (owner/name)
  const allReposMap = new Map<string, GitHubRepo>();
  for (const r of [...personalRepos, ...orgRepos]) {
    const key = `${r.owner.login}/${r.language}/${r.stargazers_count}`;
    if (!allReposMap.has(key)) allReposMap.set(key, r);
  }
  const allRepos = [...allReposMap.values()];

  // 🐱 Stars (all repos including org)
  const stars = allRepos.reduce((s, r) => s + r.stargazers_count, 0);

  // 🐱 Languages (all repos, skip forks)
  const languages: Record<string, number> = {};
  for (const r of allRepos) {
    if (r.language && !r.fork) languages[r.language] = (languages[r.language] || 0) + 1;
  }

  // 🐱 Total repo count (personal + org)
  const repositories = allRepos.length;

  // 🐱 Commits (Search API already includes org commits)
  let commits = 0;
  try {
    const r = await fetch(`https://api.github.com/search/commits?q=author:${username}`, {
      headers: { ...h, Accept: "application/vnd.github.cloak-preview+json" },
    });
    if (r.ok) commits = (await r.json()).total_count || 0;
  } catch {}

  // 🐱 PRs (Search API already includes org PRs)
  let pullRequests = 0;
  try {
    const r = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers: h });
    if (r.ok) pullRequests = (await r.json()).total_count || 0;
  } catch {}

  // 🐱 Issues (Search API already includes org issues)
  let issues = 0;
  try {
    const r = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers: h });
    if (r.ok) issues = (await r.json()).total_count || 0;
  } catch {}

  const experience = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const stats: GitHubStats = { user, commits, pullRequests, issues, repositories, stars, followers: user.followers, languages, experience };

  // 🐱 Cache with eviction
  if (cache.size >= MAX_ENTRIES) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(username, { stats, ts: Date.now() });

  return stats;
}
