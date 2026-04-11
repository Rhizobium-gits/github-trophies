import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { langIcon, getLangColor, prefetchIcons } from "@/lib/lang-icons";
import { renderNyanCat } from "@/lib/nyancat";

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

  // 🐱 Light themes
  light:      T("#fff","#f8f8f8","#e0e0e0","#111","#888","#666","#111","#999","#bbb","#eee","#eee","#333","#f0f0f0","#ddd","#111","#111","#ddd","#444","#999","#111"),
  "github-light": T("#fff","#f6f8fa","#d0d7de","#1f2328","#656d76","#656d76","#1f2328","#8c959f","#8c959f","#d8dee4","#d8dee4","#0969da","#f6f8fa","#d0d7de","#0969da","#1f2328","#d0d7de","#1f2328","#656d76","#1f2328"),
  "solarized-light": T("#fdf6e3","#f5efdc","#eee8d5","#657b83","#93a1a1","#839496","#586e75","#93a1a1","#93a1a1","#eee8d5","#eee8d5","#268bd2","#eee8d5","#d6cdb8","#b58900","#586e75","#d6cdb8","#586e75","#93a1a1","#586e75"),
  "gruvbox-light": T("#fbf1c7","#f2e6be","#d5c4a1","#3c3836","#928374","#7c6f64","#3c3836","#a89984","#a89984","#d5c4a1","#d5c4a1","#b57614","#ebdbb2","#d5c4a1","#b57614","#3c3836","#d5c4a1","#504945","#928374","#3c3836"),
  "catppuccin-latte": T("#eff1f5","#e6e9ef","#ccd0da","#4c4f69","#8c8fa1","#7c7f93","#4c4f69","#9ca0b0","#9ca0b0","#ccd0da","#ccd0da","#8839ef","#e6e9ef","#bcc0cc","#8839ef","#4c4f69","#bcc0cc","#5c5f77","#8c8fa1","#4c4f69"),

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

// 🐱 Activity data with dates
interface ActivityBucket { count: number; label: string }

async function fetchRecentActivity(username: string): Promise<ActivityBucket[]> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers: h });
    if (!res.ok) return [];
    const events: { type: string; created_at: string }[] = await res.json();
    const now = Date.now();
    const counts = new Array(12).fill(0);
    for (const ev of events) {
      const weekIdx = Math.floor((now - new Date(ev.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weekIdx < 12) counts[11 - weekIdx]++;
    }
    return counts.map((count, i) => {
      const d = new Date(now - (11 - i) * 7 * 24 * 60 * 60 * 1000);
      return { count, label: `${d.getMonth() + 1}/${d.getDate()}` };
    });
  } catch { return []; }
}

// 🐱 Rank
function calcRank(commits: number, prs: number, stars: number, followers: number): { rank: string; score: number } {
  const score = Math.min(Math.log10(commits+1)*10 + Math.log10(prs+1)*8 + Math.log10(stars+1)*6 + Math.log10(followers+1)*4, 100);
  for (const t of [
    { min: 50, rank: "S" }, { min: 40, rank: "A+" }, { min: 30, rank: "A" },
    { min: 20, rank: "B+" }, { min: 10, rank: "B" }, { min: 0, rank: "C" },
  ]) { if (score >= t.min) return { rank: t.rank, score: Math.round(score) }; }
  return { rank: "C", score: 0 };
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
    const [s, activity] = await Promise.all([fetchGitHubStats(username), fetchRecentActivity(username)]);
    const { rank, score } = calcRank(s.commits, s.pullRequests, s.stars, s.followers);

    const W = 480, pad = 28, contentW = W - pad * 2;

    // 🐱 ALL languages
    const langSorted = Object.entries(s.languages).sort((a, b) => b[1] - a[1]);
    const langTotal = langSorted.reduce((sum, [, c]) => sum + c, 0);

    // 🐱 Prefetch devicon SVGs as base64
    await prefetchIcons(langSorted.map(([l]) => l));

    // 🐱 Height
    const headerH = 64, div = 20, statsH = 132;
    const hasAct = activity.length > 0;
    const actLabelH = 20, actNumH = hasAct ? 14 : 0, actBarH = hasAct ? 44 : 0, actDateH = hasAct ? 16 : 0;
    const actDiv = hasAct ? 20 : 0;
    // 🐱 Languages: icon(18) + name + pct per row, 2 cols, 24px per row
    const langRows = Math.ceil(langSorted.length / 2);
    const donutH = langSorted.length > 0 ? 80 : 0;
    const langLegH = langRows * 24;
    const langSectionH = langSorted.length > 0 ? 24 + Math.max(donutH, langLegH) : 0;

    const H = pad + headerH + div + statsH + div + actLabelH + actNumH + actBarH + actDateH + actDiv + langSectionH + pad;

    const stats = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.pullRequests.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Stars Earned", value: s.stars.toLocaleString() },
      { label: "Repositories", value: s.repositories.toLocaleString() },
      { label: "Experience", value: `${s.experience} yr` },
    ];

    let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bgGrad1}"/><stop offset="100%" stop-color="${t.bgGrad2}"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="${t.stroke}" stroke-width="1"/>
`;
    let y = pad;

    // ==================== HEADER (no avatar - GitHub strips <image> from SVGs) ====================
    const tx = pad;
    o += `<text x="${tx}" y="${y + 20}" font-size="17" font-weight="700" fill="${t.title}" font-family="${F}">${esc(s.user.name || s.user.login)}</text>`;
    o += `<text x="${tx}" y="${y + 38}" font-size="11" fill="${t.subtitle}" font-family="${F}">@${esc(s.user.login)}</text>`;
    if (s.user.bio) {
      const bio = s.user.bio.length > 50 ? s.user.bio.slice(0, 47) + "..." : s.user.bio;
      o += `<text x="${tx}" y="${y + 54}" font-size="10" fill="${t.subtitle}" font-family="${F}" opacity="0.7">${esc(bio)}</text>`;
    }

    const cx = W - pad - 28, cy2 = y + 24, cr = 24;
    const circ = 2 * Math.PI * cr, dOff = circ - (score / 100) * circ;
    o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="2"/>`;
    o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dOff.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy2})" opacity="0.9"/>`;
    o += `<text x="${cx}" y="${cy2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;

    // 🐱 Nyan Cat! Speed based on score
    const isLight = ["light", "github-light", "solarized-light", "gruvbox-light", "catppuccin-latte", "v7"].includes(themeKey);
    o += renderNyanCat(W - pad - 120, y + 2, score, isLight ? "light" : "dark");

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

    // ==================== ACTIVITY ====================
    if (hasAct) {
      o += `<text x="${pad}" y="${y + 12}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">ACTIVITY (LAST 12 WEEKS)</text>`;
      y += actLabelH;

      const gap = 4, barW = (contentW - 11 * gap) / 12;
      const maxVal = Math.max(...activity.map(a => a.count), 1);

      // 🐱 Numbers
      activity.forEach((b, i) => {
        if (b.count > 0) {
          const bx = pad + i * (barW + gap) + barW / 2;
          o += `<text x="${bx.toFixed(1)}" y="${(y + actNumH - 2).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="600" fill="${t.value}" font-family="${M}" opacity="0.7">${b.count}</text>`;
        }
      });
      y += actNumH;

      // 🐱 Bars
      activity.forEach((b, i) => {
        const bx = pad + i * (barW + gap);
        const bh = Math.max((b.count / maxVal) * actBarH, 2);
        const by = y + actBarH - bh;
        const op = b.count === 0 ? 0.15 : 0.3 + (b.count / maxVal) * 0.7;
        o += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${t.bar}" opacity="${op.toFixed(2)}"/>`;
      });
      y += actBarH;

      // 🐱 Dates
      activity.forEach((b, i) => {
        if (i % 2 === 0 || i === 11) {
          const bx = pad + i * (barW + gap) + barW / 2;
          o += `<text x="${bx.toFixed(1)}" y="${(y + 12).toFixed(1)}" text-anchor="middle" font-size="7" fill="${t.sectionLabel}" font-family="${M}">${b.label}</text>`;
        }
      });
      y += actDateH;

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
