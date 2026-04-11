// 🐱 GitHub API fetch & caching

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

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const hit = cache.get(username);
  if (hit && Date.now() - hit.ts < TTL) return hit.stats;

  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  // 🐱 User
  const uRes = await fetch(`https://api.github.com/users/${username}`, { headers: h });
  if (uRes.status === 404) throw new Error("User not found");
  if (!uRes.ok) throw new Error(`GitHub API ${uRes.status}`);
  const user: GitHubUser = await uRes.json();

  // 🐱 Repos (paginated)
  const repos: GitHubRepo[] = [];
  for (let p = 1; ; p++) {
    const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${p}&type=owner`, { headers: h });
    if (!r.ok) break;
    const batch: GitHubRepo[] = await r.json();
    if (!batch.length) break;
    repos.push(...batch);
  }

  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const languages: Record<string, number> = {};
  for (const r of repos) {
    if (r.language && !r.fork) languages[r.language] = (languages[r.language] || 0) + 1;
  }

  // 🐱 Commits
  let commits = 0;
  try {
    const r = await fetch(`https://api.github.com/search/commits?q=author:${username}`, {
      headers: { ...h, Accept: "application/vnd.github.cloak-preview+json" },
    });
    if (r.ok) commits = (await r.json()).total_count || 0;
  } catch {}

  // 🐱 PRs
  let pullRequests = 0;
  try {
    const r = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, { headers: h });
    if (r.ok) pullRequests = (await r.json()).total_count || 0;
  } catch {}

  // 🐱 Issues
  let issues = 0;
  try {
    const r = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, { headers: h });
    if (r.ok) issues = (await r.json()).total_count || 0;
  } catch {}

  const experience = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  const stats: GitHubStats = { user, commits, pullRequests, issues, repositories: user.public_repos, stars, followers: user.followers, languages, experience };

  // 🐱 Cache with eviction
  if (cache.size >= MAX_ENTRIES) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(username, { stats, ts: Date.now() });

  return stats;
}
