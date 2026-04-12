import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { langIcon, getLangColor, prefetchIcons, getAllDefs } from "@/lib/lang-icons";

// 🐱 Theme system - VSCode-style named themes
interface Theme {
  bgGrad1: string; bgGrad2: string; stroke: string;
  title: string; subtitle: string; label: string; value: string;
  sectionLabel: string; dot: string; divider: string; dashLine: string;
  bar: string; rankCircleBg: string; rankCircleTrack: string;
  rankCircleArc: string; rankText: string; avatarStroke: string;
  legendText: string; legendSub: string; donutCenter: string;
}

function T(bg1:string,bg2:string,stk:string,ttl:string,sub:string,lbl:string,val:string,sec:string,dot:string,dv:string,dl:string,bar:string,rcBg:string,rcTk:string,rcArc:string,rcTx:string,avS:string,lgT:string,lgS:string,dnC:string): Theme {
  return {bgGrad1:bg1,bgGrad2:bg2,stroke:stk,title:ttl,subtitle:sub,label:lbl,value:val,sectionLabel:sec,dot,divider:dv,dashLine:dl,bar,rankCircleBg:rcBg,rankCircleTrack:rcTk,rankCircleArc:rcArc,rankText:rcTx,avatarStroke:avS,legendText:lgT,legendSub:lgS,donutCenter:dnC};
}

const THEMES: Record<string, Theme> = {
  // 🐱 Dark themes
  noir:       T("#111","#0a0a0a","#2a2a2a","#fff","#555","#888","#eee","#555","#444","#1e1e1e","#1a1a1a","#fff","#151515","#222","#fff","#fff","#333","#bbb","#555","#fff"),
  dracula:    T("#282a36","#21222c","#44475a","#f8f8f2","#6272a4","#bd93f9","#f8f8f2","#6272a4","#44475a","#44475a","#44475a","#bd93f9","#2c2e3a","#44475a","#ff79c6","#f8f8f2","#44475a","#f8f8f2","#6272a4","#f8f8f2"),
  "one-dark": T("#282c34","#21252b","#3e4451","#abb2bf","#5c6370","#828997","#e5c07b","#5c6370","#4b5263","#3e4451","#3e4451","#61afef","#2c313a","#3e4451","#61afef","#abb2bf","#3e4451","#abb2bf","#5c6370","#abb2bf"),
  monokai:    T("#272822","#1e1f1c","#49483e","#f8f8f2","#75715e","#a6e22e","#f8f8f2","#75715e","#49483e","#49483e","#49483e","#f92672","#2d2e27","#49483e","#f92672","#f8f8f2","#49483e","#e6db74","#75715e","#f8f8f2"),
  "tokyo-night": T("#1a1b26","#16161e","#292e42","#c0caf5","#565f89","#7aa2f7","#c0caf5","#565f89","#3b4261","#292e42","#292e42","#7aa2f7","#1e1f2e","#292e42","#bb9af7","#c0caf5","#292e42","#a9b1d6","#565f89","#c0caf5"),
  nord:       T("#2e3440","#282e3a","#3b4252","#eceff4","#7b88a0","#8a95aa","#d8dee9","#6a7585","#5a6577","#3b4252","#3b4252","#88c0d0","#333a48","#434c5e","#88c0d0","#d8dee9","#434c5e","#b0bcc8","#6a7585","#d8dee9"),
  "github-dark": T("#0d1117","#010409","#30363d","#e6edf3","#7d8590","#7d8590","#e6edf3","#484f58","#484f58","#21262d","#21262d","#58a6ff","#161b22","#30363d","#58a6ff","#e6edf3","#30363d","#c9d1d9","#484f58","#e6edf3"),
  catppuccin: T("#1e1e2e","#181825","#313244","#cdd6f4","#6c7086","#a6adc8","#cdd6f4","#585b70","#45475a","#313244","#313244","#cba6f7","#24243a","#313244","#cba6f7","#cdd6f4","#313244","#bac2de","#585b70","#cdd6f4"),
  "gruvbox-dark": T("#282828","#1d2021","#3c3836","#ebdbb2","#928374","#a89984","#ebdbb2","#7c6f64","#665c54","#3c3836","#3c3836","#b8bb26","#32302f","#3c3836","#fabd2f","#ebdbb2","#3c3836","#d5c4a1","#7c6f64","#ebdbb2"),
  "solarized-dark": T("#002b36","#001e26","#073642","#839496","#586e75","#657b83","#93a1a1","#586e75","#586e75","#073642","#073642","#268bd2","#003440","#073642","#b58900","#93a1a1","#073642","#839496","#586e75","#93a1a1"),
  synthwave:  T("#1a1028","#150d22","#2d1f4e","#f0e0ff","#8a6aaa","#c8a0e8","#f0d0ff","#7a5a9a","#5a3d7a","#2d1f4e","#2d1f4e","#ff6eee","#201430","#2d1f4e","#ff6eee","#f0d0ff","#2d1f4e","#d0b0e8","#8a6aaa","#f0d0ff"),
  cobalt:     T("#193549","#132d3f","#1f4662","#e1efff","#4a7da8","#6a9ec8","#fff","#4a7da8","#2d5a80","#1f4662","#1f4662","#ffc600","#1a3a50","#1f4662","#ffc600","#fff","#1f4662","#c8e4ff","#4a7da8","#fff"),
  ayu:        T("#0b0e14","#0a0d12","#11151c","#bfbdb6","#565b66","#6c7380","#e6e1cf","#565b66","#3d424d","#11151c","#11151c","#e6b450","#0d1018","#11151c","#e6b450","#e6e1cf","#11151c","#acb6bf","#565b66","#e6e1cf"),
  "material-ocean": T("#0f111a","#0b0d14","#1f2233","#a6accd","#4e5579","#717cb4","#a6accd","#4e5579","#3b3f5c","#1f2233","#1f2233","#c792ea","#131520","#1f2233","#c792ea","#a6accd","#1f2233","#a6accd","#4e5579","#a6accd"),
  rose:       T("#1e0a14","#180810","#4a1a30","#ffe0ee","#aa4a70","#cc6a90","#ffc8dd","#aa4a70","#8a3a5a","#3a1228","#3a1228","#f472b6","#240e18","#4a1a30","#f472b6","#ffc8dd","#4a1a30","#e090b8","#aa4a70","#ffc8dd"),
  "night-owl": T("#011627","#010e1a","#1d3b53","#d6deeb","#5f7e97","#7fdbca","#d6deeb","#5f7e97","#456075","#1d3b53","#1d3b53","#82aaff","#0b2942","#1d3b53","#c792ea","#d6deeb","#1d3b53","#d6deeb","#5f7e97","#d6deeb"),
  "palenight": T("#292d3e","#242837","#3a3f58","#a6accd","#676e95","#c3e88d","#a6accd","#676e95","#4e5579","#3a3f58","#3a3f58","#c792ea","#2f3347","#3a3f58","#82aaff","#a6accd","#3a3f58","#a6accd","#676e95","#a6accd"),
  "shades-of-purple": T("#2d2b55","#261f4e","#4d21fc","#fad000","#a599e9","#fad000","#fff","#a599e9","#6943ff","#4d21fc","#4d21fc","#ff7200","#332f62","#4d21fc","#ff7200","#fff","#4d21fc","#fad000","#a599e9","#fff"),
  "panda": T("#292a2b","#252627","#3e4042","#e6e6e6","#757575","#b4b4b4","#e6e6e6","#757575","#535455","#3e4042","#3e4042","#19f9d8","#2e3032","#3e4042","#ff75b5","#e6e6e6","#3e4042","#e6e6e6","#757575","#e6e6e6"),
  "horizon": T("#1c1e26","#181a21","#2e303e","#d5d8da","#6c6f93","#e95678","#d5d8da","#6c6f93","#4e5166","#2e303e","#2e303e","#e95678","#232530","#2e303e","#fab795","#d5d8da","#2e303e","#d5d8da","#6c6f93","#d5d8da"),
  "vitesse": T("#121212","#0e0e0e","#282828","#dbd7ca","#555","#4d9375","#dbd7ca","#555","#393939","#282828","#282828","#80a665","#1a1a1a","#282828","#80a665","#dbd7ca","#282828","#dbd7ca","#555","#dbd7ca"),
  "everforest": T("#2d353b","#272e33","#3d484d","#d3c6aa","#859289","#a7c080","#d3c6aa","#859289","#4f5b58","#3d484d","#3d484d","#a7c080","#323c41","#3d484d","#dbbc7f","#d3c6aa","#3d484d","#d3c6aa","#859289","#d3c6aa"),
  "kanagawa": T("#1f1f28","#1a1a22","#2a2a37","#dcd7ba","#727169","#7e9cd8","#dcd7ba","#727169","#54546d","#2a2a37","#2a2a37","#7fb4ca","#252535","#2a2a37","#e6c384","#dcd7ba","#2a2a37","#dcd7ba","#727169","#dcd7ba"),
  "fleet": T("#181818","#141414","#2a2a2a","#c4c4c4","#666","#87c3ff","#c4c4c4","#666","#444","#2a2a2a","#2a2a2a","#87c3ff","#1e1e1e","#2a2a2a","#87c3ff","#c4c4c4","#2a2a2a","#c4c4c4","#666","#c4c4c4"),

  // 🐱 Light themes
  light:      T("#fff","#f8f8f8","#e0e0e0","#111","#888","#666","#111","#999","#bbb","#eee","#eee","#333","#f0f0f0","#ddd","#111","#111","#ddd","#444","#999","#111"),
  "github-light": T("#fff","#f6f8fa","#d0d7de","#1f2328","#656d76","#656d76","#1f2328","#8c959f","#8c959f","#d8dee4","#d8dee4","#0969da","#f6f8fa","#d0d7de","#0969da","#1f2328","#d0d7de","#1f2328","#656d76","#1f2328"),
  "solarized-light": T("#fdf6e3","#f5efdc","#eee8d5","#657b83","#93a1a1","#839496","#586e75","#93a1a1","#93a1a1","#eee8d5","#eee8d5","#268bd2","#eee8d5","#d6cdb8","#b58900","#586e75","#d6cdb8","#586e75","#93a1a1","#586e75"),
  "gruvbox-light": T("#fbf1c7","#f2e6be","#d5c4a1","#3c3836","#928374","#7c6f64","#3c3836","#a89984","#a89984","#d5c4a1","#d5c4a1","#b57614","#ebdbb2","#d5c4a1","#b57614","#3c3836","#d5c4a1","#504945","#928374","#3c3836"),
  "catppuccin-latte": T("#eff1f5","#e6e9ef","#ccd0da","#4c4f69","#8c8fa1","#7c7f93","#4c4f69","#9ca0b0","#9ca0b0","#ccd0da","#ccd0da","#8839ef","#e6e9ef","#bcc0cc","#8839ef","#4c4f69","#bcc0cc","#5c5f77","#8c8fa1","#4c4f69"),
  "light-owl": T("#fbfbfb","#f5f5f5","#e0e0e0","#403f53","#90a4ae","#2aa298","#403f53","#90a4ae","#b0bec5","#e0e0e0","#e0e0e0","#4876d6","#f0f0f0","#d6d6d6","#bc5454","#403f53","#d6d6d6","#403f53","#90a4ae","#403f53"),
  "everforest-light": T("#fdf6e3","#f4eed7","#e0dcc7","#5c6a72","#939f91","#8da101","#5c6a72","#a6b0a0","#a6b0a0","#e0dcc7","#e0dcc7","#8da101","#eee8d5","#d5cfba","#dfa000","#5c6a72","#d5cfba","#5c6a72","#939f91","#5c6a72"),
  "vitesse-light": T("#ffffff","#f7f7f7","#e5e5e5","#393a34","#999","#1e754f","#393a34","#999","#bbb","#e5e5e5","#e5e5e5","#1e754f","#f5f5f5","#ddd","#1e754f","#393a34","#ddd","#393a34","#999","#393a34"),

  // 🐱 Aliases for v1-v8 backwards compat
  v1: undefined as unknown as Theme, v2: undefined as unknown as Theme,
  v3: undefined as unknown as Theme, v4: undefined as unknown as Theme,
  v5: undefined as unknown as Theme, v6: undefined as unknown as Theme,
  v7: undefined as unknown as Theme, v8: undefined as unknown as Theme,
};
THEMES.v1 = THEMES.noir;
THEMES.v2 = THEMES["github-dark"];
THEMES.v3 = THEMES.dracula;
THEMES.v4 = THEMES["tokyo-night"];
THEMES.v5 = THEMES.monokai;
THEMES.v6 = THEMES.nord;
THEMES.v7 = THEMES.light;
THEMES.v8 = THEMES.catppuccin;

// 🐱 Contribution calendar (1 year, weekly) via GitHub GraphQL API
interface ActivityData {
  weeks: { total: number; date: string }[];  // 53 weeks
  totalContributions: number;
}

async function fetchContributions(username: string): Promise<ActivityData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const query = `query{user(login:"${username}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    const weeks = cal.weeks.map((w: { contributionDays: { contributionCount: number; date: string }[] }) => ({
      total: w.contributionDays.reduce((s: number, d: { contributionCount: number }) => s + d.contributionCount, 0),
      date: w.contributionDays[0]?.date || "",
    }));

    return { weeks, totalContributions: cal.totalContributions };
  } catch { return null; }
}

// 🐱 Rank — based on github-readme-stats percentile method
// Uses exponential/log-normal CDF to normalize stats, then weighted average

// Exponential CDF: P(X <= x) = 1 - e^(-lambda * x)
function expCdf(x: number, median: number): number {
  const lambda = Math.LN2 / median;
  return 1 - Math.exp(-lambda * x);
}

// Log-normal CDF approximation
function logNormCdf(x: number, median: number): number {
  if (x <= 0) return 0;
  const sigma = 1.0;
  const z = (Math.log(x) - Math.log(median)) / sigma;
  // Approximation of standard normal CDF
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const poly = t * (a[0] + t * (a[1] + t * (a[2] + t * (a[3] + t * a[4]))));
  const cdf = 1 - poly * Math.exp(-z * z / 2);
  return z >= 0 ? cdf : 1 - cdf;
}

function calcRank(
  commits: number, prs: number, issues: number, stars: number, followers: number
): { rank: string; score: number } {
  // 🐱 Weights and medians (adjusted from github-readme-stats)
  // Contribution-focused: commits/PRs/issues weighted higher, stars/followers lower
  const WEIGHTS = { commits: 3, prs: 3, issues: 2, stars: 1, followers: 1 };
  const MEDIANS = { commits: 250, prs: 40, issues: 20, stars: 50, followers: 10 };
  const TOTAL_WEIGHT = WEIGHTS.commits + WEIGHTS.prs + WEIGHTS.issues + WEIGHTS.stars + WEIGHTS.followers;

  // 🐱 Normalize each stat via CDF
  const commitsCdf = expCdf(commits, MEDIANS.commits);
  const prsCdf = expCdf(prs, MEDIANS.prs);
  const issuesCdf = expCdf(issues, MEDIANS.issues);
  const starsCdf = logNormCdf(stars, MEDIANS.stars);
  const followersCdf = logNormCdf(followers, MEDIANS.followers);

  // 🐱 Weighted average → percentile (lower = better)
  const percentile = (1 - (
    commitsCdf * WEIGHTS.commits +
    prsCdf * WEIGHTS.prs +
    issuesCdf * WEIGHTS.issues +
    starsCdf * WEIGHTS.stars +
    followersCdf * WEIGHTS.followers
  ) / TOTAL_WEIGHT) * 100;

  // 🐱 Percentile → rank tier
  for (const t of [
    { max: 1,    rank: "S" },
    { max: 12.5, rank: "A+" },
    { max: 25,   rank: "A" },
    { max: 37.5, rank: "A-" },
    { max: 50,   rank: "B+" },
    { max: 62.5, rank: "B" },
    { max: 75,   rank: "B-" },
    { max: 87.5, rank: "C+" },
    { max: 100,  rank: "C" },
  ]) { if (percentile <= t.max) return { rank: t.rank, score: Math.round(100 - percentile) }; }
  return { rank: "C", score: 0 };
}

// 🐱 Fetch avatar as base64 for embedding
async function fetchAvatarBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}&s=96`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "image/png";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch { return null; }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const F = "system-ui, -apple-system, sans-serif";
const M = "ui-monospace, SFMono-Regular, monospace";

function errorSvg(msg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="60"><rect width="480" height="60" rx="8" fill="#111" stroke="#333"/><text x="240" y="35" text-anchor="middle" font-size="12" fill="#f87171" font-family="${F}">${esc(msg)}</text></svg>`;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const username = sp.get("username");

  if (!username) return new NextResponse(errorSvg("Missing ?username= parameter"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  if (!isValidUsername(username)) return new NextResponse(errorSvg("Invalid GitHub username"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });

  const themeKey = sp.get("theme") || "noir";
  const t = THEMES[themeKey] || THEMES.noir;

  try {
    const [s, activity] = await Promise.all([fetchGitHubStats(username), fetchContributions(username)]);
    const { rank, score } = calcRank(s.commits, s.pullRequests, s.issues, s.stars, s.followers);

    const W = 480, pad = 28, contentW = W - pad * 2;

    // 🐱 ALL languages
    const langAll = Object.entries(s.languages).sort((a, b) => b[1] - a[1]);
    const langTotal = langAll.reduce((sum, [, c]) => sum + c, 0);
    // 🐱 Filter out languages with < 0.1% (too small to show)
    const langSorted = langAll.filter(([, c]) => langTotal > 0 && (c / langTotal) >= 0.001);

    // 🐱 Prefetch devicon SVGs as base64
    await prefetchIcons(langSorted.map(([l]) => l));

    // 🐱 Height
    const headerH = 64, div = 20, statsH = 220;
    const hasAct = !!activity;
    // Activity: 1-year contribution graph (53 weeks)
    const actLabelH = hasAct ? 20 : 0;
    const actGraphH = hasAct ? 54 : 0; // line graph 40px + month labels 14px
    const actTotalH = actLabelH + actGraphH;
    const actDiv = hasAct ? 20 : 0;
    // 🐱 Languages: icon(18) + name + pct per row, 2 cols, 24px per row
    const langRows = Math.ceil(langSorted.length / 2);
    const donutH = langSorted.length > 0 ? 80 : 0;
    const langLegH = langRows * 24;
    const langSectionH = langSorted.length > 0 ? 24 + Math.max(donutH, langLegH) : 0;

    const H = pad + headerH + div + statsH + div + actTotalH + actDiv + langSectionH + pad;

    const stats = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.pullRequests.toLocaleString() },
      { label: "Code Reviews", value: s.reviews.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Stars Earned", value: s.stars.toLocaleString() },
      { label: "Repositories", value: s.repositories.toLocaleString() },
      { label: "Contributed To", value: s.contributedTo.toLocaleString() },
      { label: "Followers", value: s.followers.toLocaleString() },
      { label: "Following", value: s.following.toLocaleString() },
      { label: "Experience", value: `${s.experience} yr` },
    ];

    // 🐱 Collect defs from devicon icons
    const iconDefs = getAllDefs();

    // 🐱 Avatar
    const avatarB64 = await fetchAvatarBase64(s.user.avatar_url);

    let o = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bgGrad1}"/><stop offset="100%" stop-color="${t.bgGrad2}"/></linearGradient>
  ${iconDefs}
</defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="${t.stroke}" stroke-width="1"/>
`;
    let y = pad;

    // ==================== HEADER ====================
    // 🐱 Avatar (base64 embedded)
    const avatarSize = 48;
    if (avatarB64) {
      o += `<clipPath id="avclip"><circle cx="${pad + avatarSize / 2}" cy="${y + avatarSize / 2}" r="${avatarSize / 2}"/></clipPath>`;
      o += `<image x="${pad}" y="${y}" width="${avatarSize}" height="${avatarSize}" href="${avatarB64}" clip-path="url(#avclip)"/>`;
      o += `<circle cx="${pad + avatarSize / 2}" cy="${y + avatarSize / 2}" r="${avatarSize / 2}" fill="none" stroke="${t.avatarStroke}" stroke-width="1.5"/>`;
    }

    const tx = avatarB64 ? pad + avatarSize + 12 : pad;
    o += `<text x="${tx}" y="${y + 20}" font-size="17" font-weight="700" fill="${t.title}" font-family="${F}">${esc(s.user.name || s.user.login)}</text>`;
    // 🐱 Rank circle at right end of header
    const rcx = W - pad - 22, rcy = y + 20, rcr = 22;
    const rcirc = 2 * Math.PI * rcr, rdOff = rcirc - (score / 100) * rcirc;
    o += `<circle cx="${rcx}" cy="${rcy}" r="${rcr}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="1.5"/>`;
    o += `<circle cx="${rcx}" cy="${rcy}" r="${rcr}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${rcirc.toFixed(1)}" stroke-dashoffset="${rdOff.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${rcx} ${rcy})" opacity="0.9"/>`;
    o += `<text x="${rcx}" y="${rcy + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;
    o += `<text x="${tx}" y="${y + 38}" font-size="11" fill="${t.subtitle}" font-family="${F}">@${esc(s.user.login)}</text>`;
    if (s.user.bio) {
      const bio = s.user.bio.length > 44 ? s.user.bio.slice(0, 41) + "..." : s.user.bio;
      o += `<text x="${tx}" y="${y + 54}" font-size="10" fill="${t.subtitle}" font-family="${F}" opacity="0.7">${esc(bio)}</text>`;
    }

    y += headerH;

    o += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="${t.divider}" stroke-width="1"/>`;
    y += div;

    // ==================== STATS ====================
    stats.forEach((item, i) => {
      const iy = y + i * 22;
      o += `<circle cx="${pad + 4}" cy="${iy + 5}" r="2" fill="${t.dot}"/>`;
      o += `<text x="${pad + 14}" y="${iy + 9}" font-size="12" fill="${t.label}" font-family="${F}">${item.label}</text>`;
      o += `<line x1="${pad + 130}" y1="${iy + 6}" x2="${W - pad - 70}" y2="${iy + 6}" stroke="${t.dashLine}" stroke-width="1" stroke-dasharray="2,4"/>`;
      o += `<text x="${W - pad}" y="${iy + 9}" text-anchor="end" font-size="13" font-weight="600" fill="${t.value}" font-family="${M}">${item.value}</text>`;
    });
    y += statsH;

    o += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="${t.divider}" stroke-width="1"/>`;
    y += div;

    // ==================== CONTRIBUTIONS (365 DAYS) — LINE GRAPH ====================
    if (hasAct && activity) {
      o += `<text x="${pad}" y="${y + 12}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">CONTRIBUTIONS</text>`;
      o += `<text x="${W - pad}" y="${y + 12}" text-anchor="end" font-size="9" fill="${t.sectionLabel}" font-family="${M}">${activity.totalContributions.toLocaleString()} in the last year</text>`;
      y += actLabelH;

      // 🐱 53-week line graph
      const wks = activity.weeks;
      const graphH = 40;
      const maxWk = Math.max(...wks.map(w => w.total), 1);
      const stepX = contentW / (wks.length - 1);

      const points = wks.map((wk, i) => {
        const px = pad + i * stepX;
        const py = y + graphH - (wk.total / maxWk) * graphH;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      const areaPoints = [`${pad},${y + graphH}`, ...points, `${(pad + contentW).toFixed(1)},${y + graphH}`].join(" ");
      o += `<polygon points="${areaPoints}" fill="${t.rankCircleArc}" opacity="0.06"/>`;
      o += `<polyline points="${points.join(" ")}" fill="none" stroke="${t.rankCircleArc}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.7"/>`;

      y += graphH + 2;

      let lastMonth = "";
      wks.forEach((wk, i) => {
        if (!wk.date) return;
        const mStr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date(wk.date).getMonth()];
        if (mStr !== lastMonth) {
          o += `<text x="${(pad + i * stepX).toFixed(1)}" y="${y + 9}" font-size="7" fill="${t.sectionLabel}" font-family="${M}">${mStr}</text>`;
          lastMonth = mStr;
        }
      });
      y += 12;

      o += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="${t.divider}" stroke-width="1"/>`;
      y += actDiv;
    }

    // ==================== LANGUAGES (ALL) ====================
    if (langSorted.length > 0) {
      o += `<text x="${pad}" y="${y + 14}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">MOST USED LANGUAGES</text>`;
      y += 24;

      // 🐱 Donut chart
      const dCx = pad + 40, dCy = y + 40, dR = 32, dIR = 20;
      let sa = -90;
      langSorted.forEach(([lang, count]) => {
        const lc = getLangColor(lang);
        const pct = count / langTotal, angle = pct * 360, ea = sa + angle;
        const sr = (sa * Math.PI) / 180, er = (ea * Math.PI) / 180;
        const x1 = dCx + dR * Math.cos(sr), y1 = dCy + dR * Math.sin(sr);
        const x2 = dCx + dR * Math.cos(er), y2 = dCy + dR * Math.sin(er);
        const ix1 = dCx + dIR * Math.cos(er), iy1 = dCy + dIR * Math.sin(er);
        const ix2 = dCx + dIR * Math.cos(sr), iy2 = dCy + dIR * Math.sin(sr);
        const la = angle > 180 ? 1 : 0;
        o += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${dR},${dR} 0 ${la},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${dIR},${dIR} 0 ${la},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${lc}"/>`;
        sa = ea;
      });
      o += `<text x="${dCx}" y="${dCy + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${t.donutCenter}" font-family="${M}">${langSorted.length}</text>`;

      // 🐱 Legend with language icons
      const legX = pad + 100, legW = contentW - 100;
      langSorted.forEach(([lang, count], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const lx = legX + col * (legW / 2);
        const ly = y + 4 + row * 24;
        const pct = ((count / langTotal) * 100).toFixed(1);

        // 🐱 Language color icon with abbreviation
        o += langIcon(lx, ly, lang, 18);
        // 🐱 Language name
        o += `<text x="${lx + 24}" y="${ly + 13}" font-size="11" fill="${t.legendText}" font-family="${F}">${esc(lang)}</text>`;
        // 🐱 Percentage
        o += `<text x="${lx + legW / 2 - 4}" y="${ly + 13}" text-anchor="end" font-size="10" font-weight="600" fill="${t.legendSub}" font-family="${M}">${pct}%</text>`;
      });
    }

    o += `</svg>`;

    return new NextResponse(o, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new NextResponse(errorSvg(`@${username}: ${msg}`), { status: 500, headers: { "Content-Type": "image/svg+xml" } });
  }
}
