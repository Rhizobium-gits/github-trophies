// 🐱 SVG rendering utilities shared by trophy & language routes

// 🐱 Rank visual config
export interface RankStyle {
  fill: string;
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
}

const L: Record<string, RankStyle> = {
  SSS: { fill: "#FFD700", bg: "#FFFDF0", border: "#FFD700", text: "#B8860B", badgeBg: "#FFD700", badgeText: "#000" },
  SS:  { fill: "#FFD700", bg: "#FFFEF5", border: "#FFE44D", text: "#B8860B", badgeBg: "#FFE44D", badgeText: "#000" },
  S:   { fill: "#C0C0C0", bg: "#FAFAFA", border: "#C0C0C0", text: "#666",    badgeBg: "#C0C0C0", badgeText: "#000" },
  AAA: { fill: "#CD7F32", bg: "#FDF8F3", border: "#CD7F32", text: "#8B5A2B", badgeBg: "#CD7F32", badgeText: "#000" },
  AA:  { fill: "#555",    bg: "#FCFCFC", border: "#DDD",    text: "#333",    badgeBg: "#555",    badgeText: "#FFF" },
  A:   { fill: "#777",    bg: "#FDFDFD", border: "#E5E5E5", text: "#444",    badgeBg: "#777",    badgeText: "#FFF" },
  B:   { fill: "#999",    bg: "#FEFEFE", border: "#EEE",    text: "#666",    badgeBg: "#999",    badgeText: "#FFF" },
  C:   { fill: "#BBB",    bg: "#FEFEFE", border: "#F0F0F0", text: "#888",    badgeBg: "#BBB",    badgeText: "#FFF" },
};

const D: Record<string, RankStyle> = {
  SSS: { fill: "#FFD700", bg: "#1A1500", border: "#FFD700", text: "#FFD700", badgeBg: "#FFD700", badgeText: "#000" },
  SS:  { fill: "#FFD700", bg: "#191400", border: "#FFE44D", text: "#FFE44D", badgeBg: "#FFE44D", badgeText: "#000" },
  S:   { fill: "#C0C0C0", bg: "#161616", border: "#C0C0C0", text: "#C0C0C0", badgeBg: "#C0C0C0", badgeText: "#000" },
  AAA: { fill: "#CD7F32", bg: "#1A1208", border: "#CD7F32", text: "#CD7F32", badgeBg: "#CD7F32", badgeText: "#000" },
  AA:  { fill: "#8B949E", bg: "#161B22", border: "#30363D", text: "#C9D1D9", badgeBg: "#8B949E", badgeText: "#000" },
  A:   { fill: "#6E7681", bg: "#141920", border: "#21262D", text: "#8B949E", badgeBg: "#6E7681", badgeText: "#FFF" },
  B:   { fill: "#484F58", bg: "#0D1117", border: "#1C2128", text: "#6E7681", badgeBg: "#484F58", badgeText: "#FFF" },
  C:   { fill: "#30363D", bg: "#0D1117", border: "#161B22", text: "#484F58", badgeBg: "#30363D", badgeText: "#FFF" },
};

export function rankStyles(theme: string): Record<string, RankStyle> {
  return theme === "dark" ? D : L;
}

// 🐱 SVG path icons (no emoji - works everywhere)
// Each returns an SVG group centered at (0,0), sized ~18x18
const ICONS: Record<string, string> = {
  // Lightning bolt - Commits
  commits: `<path d="M11 1L5 10h4l-1 8 6-9h-4z" fill="currentColor"/>`,
  // Git pull request - PRs
  pullRequests: `<path d="M5 3a2 2 0 100 4 2 2 0 000-4zm0 10a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM5 7v6m8-6v6M5 7c3 0 8 0 8 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  // Circle dot - Issues
  issues: `<circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="currentColor"/>`,
  // Repo icon - Repositories
  repositories: `<path d="M3 2.5A1.5 1.5 0 014.5 1h9A1.5 1.5 0 0115 2.5v13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 15.5V13h2v2h9V3H5v2H3z" fill="currentColor"/><path d="M3 7h6M6 4.5L3 7l3 2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  // Star - Stars
  stars: `<path d="M9 1l2.47 5.01L17 6.64l-4 3.9.94 5.5L9 13.77l-4.94 2.27.94-5.5-4-3.9 5.53-.63z" fill="currentColor"/>`,
  // People - Followers
  followers: `<circle cx="6" cy="5" r="2.5" fill="currentColor"/><path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" fill="currentColor"/><circle cx="13" cy="5" r="2" fill="currentColor" opacity="0.6"/><path d="M13 9c2.21 0 4 1.79 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
  // Globe - Multilingual
  languages: `<circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="9" cy="9" rx="3.5" ry="7.5" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="1.5" y1="9" x2="16.5" y2="9" stroke="currentColor" stroke-width="1.2"/><path d="M2.5 5h13M2.5 13h13" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/>`,
  // Clock - Experience
  experience: `<circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 4.5V9l3.5 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// 🐱 Trophy categories
export const CATEGORIES = [
  { key: "commits",      title: "Commits",      th: [5000, 2000, 1000, 500, 200, 100, 50, 10] },
  { key: "pullRequests", title: "Pull Request",  th: [500, 200, 100, 50, 20, 10, 5, 1] },
  { key: "issues",       title: "Issues",        th: [500, 200, 100, 50, 20, 10, 5, 1] },
  { key: "repositories", title: "Repositories",  th: [200, 100, 50, 30, 20, 10, 5, 1] },
  { key: "stars",        title: "Stars",         th: [2000, 500, 200, 100, 50, 20, 10, 1] },
  { key: "followers",    title: "Followers",     th: [1000, 500, 200, 100, 50, 20, 10, 1] },
  { key: "languages",    title: "Multilingual",  th: [20, 15, 12, 10, 8, 5, 3, 1] },
  { key: "experience",   title: "Experience",    th: [15, 12, 10, 8, 6, 4, 2, 1] },
];

const RANK_KEYS = ["SSS", "SS", "S", "AAA", "AA", "A", "B", "C"];

export function getRank(value: number, th: number[]): string {
  for (let i = 0; i < th.length; i++) if (value >= th[i]) return RANK_KEYS[i];
  return "C";
}

export function getProgress(value: number, th: number[]): number {
  for (let i = 0; i < th.length; i++) {
    if (value >= th[i]) {
      if (i === 0) return 100;
      return ((value - th[i]) / (th[i - 1] - th[i])) * 100;
    }
  }
  return Math.min((value / th[th.length - 1]) * 100, 100);
}

const FONT = "system-ui, -apple-system, sans-serif";

export function trophyCard(x: number, y: number, key: string, title: string, value: number, rank: string, progress: number, rs: Record<string, RankStyle>): string {
  const r = rs[rank];
  const w = 120, h = 120, bw = 80;
  const fw = (progress / 100) * bw;
  const iconSvg = ICONS[key] || ICONS.commits;

  return `<g transform="translate(${x},${y})">
<rect width="${w}" height="${h}" rx="8" fill="${r.bg}" stroke="${r.border}" stroke-width="1.5"/>
<g transform="translate(${w - 8},-4)"><rect x="-16" width="24" height="16" rx="8" fill="${r.badgeBg}"/><text x="-4" y="12" text-anchor="middle" font-size="8" font-weight="bold" fill="${r.badgeText}" font-family="${FONT}">${rank}</text></g>
<g transform="translate(${w / 2 - 9},14)" color="${r.text}">${iconSvg}</g>
<text x="${w / 2}" y="52" text-anchor="middle" font-size="9" fill="${r.text}" font-weight="600" font-family="${FONT}" letter-spacing="0.5">${title.toUpperCase()}</text>
<text x="${w / 2}" y="74" text-anchor="middle" font-size="18" font-weight="bold" fill="${r.text}" font-family="${FONT}">${value.toLocaleString()}</text>
<rect x="${(w - bw) / 2}" y="88" width="${bw}" height="4" rx="2" fill="${r.border}" opacity="0.3"/>
<rect x="${(w - bw) / 2}" y="88" width="${Math.max(fw, 2)}" height="4" rx="2" fill="${r.fill}"/>
</g>`;
}

export function errorSvg(msg: string, w = 480): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="80"><rect width="${w}" height="80" rx="8" fill="#FFF5F5" stroke="#FCA5A5"/><text x="${w / 2}" y="45" text-anchor="middle" font-size="12" fill="#B91C1C" font-family="${FONT}">${msg}</text></svg>`;
}

// 🐱 GitHub linguist colors
export const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26",
  CSS: "#563d7c", Shell: "#89e051", R: "#198CE7", "Jupyter Notebook": "#DA5B0B",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", C: "#555555", "C++": "#f34b7d",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  Lua: "#000080", Vim: "#199f4b", "Common Lisp": "#3fb68b", "Emacs Lisp": "#c065db",
  Makefile: "#427819", Dockerfile: "#384d54", Nix: "#7e7eff", TeX: "#3D6117",
  Vue: "#41B883", Scala: "#c22d40", Haskell: "#5e5086", Perl: "#0298c3", SCSS: "#c6538c",
  Svelte: "#ff3e00", Elixir: "#6e4a7e", Clojure: "#db5855", Zig: "#ec915c",
  OCaml: "#3be133", Julia: "#a270ba", Objective_C: "#438eff", HCL: "#844FBA",
};
