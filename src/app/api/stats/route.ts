import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { LANG_COLORS } from "@/lib/svg";

// 🐱 Theme color system
interface Theme {
  bgGrad1: string; bgGrad2: string; stroke: string;
  title: string; subtitle: string; label: string; value: string;
  sectionLabel: string; dot: string; divider: string; dashLine: string;
  bar: string; rankCircleBg: string; rankCircleTrack: string;
  rankCircleArc: string; rankText: string; avatarStroke: string;
  legendText: string; legendSub: string; donutCenter: string;
}

const THEMES: Record<string, Theme> = {
  v1: { bgGrad1:"#111",bgGrad2:"#0a0a0a",stroke:"#2a2a2a",title:"#fff",subtitle:"#555",label:"#888",value:"#eee",sectionLabel:"#555",dot:"#444",divider:"#1e1e1e",dashLine:"#1a1a1a",bar:"#fff",rankCircleBg:"#151515",rankCircleTrack:"#222",rankCircleArc:"#fff",rankText:"#fff",avatarStroke:"#333",legendText:"#bbb",legendSub:"#555",donutCenter:"#fff" },
  v2: { bgGrad1:"#0b1628",bgGrad2:"#0a1220",stroke:"#1e3a5f",title:"#e0f0ff",subtitle:"#4a7da8",label:"#6a9ec8",value:"#c8e4ff",sectionLabel:"#4a7da8",dot:"#2d6a9f",divider:"#152d4a",dashLine:"#152d4a",bar:"#3b9eff",rankCircleBg:"#0d1f38",rankCircleTrack:"#1a3355",rankCircleArc:"#3b9eff",rankText:"#c8e4ff",avatarStroke:"#1e3a5f",legendText:"#8ec5ff",legendSub:"#4a7da8",donutCenter:"#c8e4ff" },
  v3: { bgGrad1:"#0a1a14",bgGrad2:"#071210",stroke:"#1a3d2e",title:"#d0f5e0",subtitle:"#3d8a60",label:"#5aad7a",value:"#b8ecd0",sectionLabel:"#3d8a60",dot:"#2d7a50",divider:"#143028",dashLine:"#143028",bar:"#34d399",rankCircleBg:"#0d2018",rankCircleTrack:"#1a3d2e",rankCircleArc:"#34d399",rankText:"#b8ecd0",avatarStroke:"#1a3d2e",legendText:"#80d4a8",legendSub:"#3d8a60",donutCenter:"#b8ecd0" },
  v4: { bgGrad1:"#150e24",bgGrad2:"#100a1e",stroke:"#2d1f4e",title:"#e8d8ff",subtitle:"#7a5aad",label:"#9a7acc",value:"#d4c0f0",sectionLabel:"#7a5aad",dot:"#5a3d8a",divider:"#221640",dashLine:"#221640",bar:"#a78bfa",rankCircleBg:"#1a1030",rankCircleTrack:"#2d1f4e",rankCircleArc:"#a78bfa",rankText:"#d4c0f0",avatarStroke:"#2d1f4e",legendText:"#b8a0e0",legendSub:"#7a5aad",donutCenter:"#d4c0f0" },
  v5: { bgGrad1:"#1e1008",bgGrad2:"#180c06",stroke:"#4a2a10",title:"#ffe8cc",subtitle:"#aa7040",label:"#cc9060",value:"#ffd8b0",sectionLabel:"#aa7040",dot:"#8a5a30",divider:"#3a2010",dashLine:"#3a2010",bar:"#fb923c",rankCircleBg:"#241408",rankCircleTrack:"#4a2a10",rankCircleArc:"#fb923c",rankText:"#ffd8b0",avatarStroke:"#4a2a10",legendText:"#e0a870",legendSub:"#aa7040",donutCenter:"#ffd8b0" },
  v6: { bgGrad1:"#1e0a14",bgGrad2:"#180810",stroke:"#4a1a30",title:"#ffe0ee",subtitle:"#aa4a70",label:"#cc6a90",value:"#ffc8dd",sectionLabel:"#aa4a70",dot:"#8a3a5a",divider:"#3a1228",dashLine:"#3a1228",bar:"#f472b6",rankCircleBg:"#240e18",rankCircleTrack:"#4a1a30",rankCircleArc:"#f472b6",rankText:"#ffc8dd",avatarStroke:"#4a1a30",legendText:"#e090b8",legendSub:"#aa4a70",donutCenter:"#ffc8dd" },
  v7: { bgGrad1:"#ffffff",bgGrad2:"#f8f8f8",stroke:"#e0e0e0",title:"#111",subtitle:"#888",label:"#666",value:"#111",sectionLabel:"#999",dot:"#bbb",divider:"#eee",dashLine:"#eee",bar:"#333",rankCircleBg:"#f0f0f0",rankCircleTrack:"#ddd",rankCircleArc:"#111",rankText:"#111",avatarStroke:"#ddd",legendText:"#444",legendSub:"#999",donutCenter:"#111" },
  v8: { bgGrad1:"#2e3440",bgGrad2:"#282e3a",stroke:"#3b4252",title:"#eceff4",subtitle:"#7b88a0",label:"#8a95aa",value:"#d8dee9",sectionLabel:"#6a7585",dot:"#5a6577",divider:"#3b4252",dashLine:"#3b4252",bar:"#88c0d0",rankCircleBg:"#333a48",rankCircleTrack:"#434c5e",rankCircleArc:"#88c0d0",rankText:"#d8dee9",avatarStroke:"#434c5e",legendText:"#b0bcc8",legendSub:"#6a7585",donutCenter:"#d8dee9" },
};

// 🐱 Fetch avatar as base64
async function fetchAvatarBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}&s=80`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const ct = res.headers.get("content-type") || "image/png";
    return `data:${ct};base64,${b64}`;
  } catch { return null; }
}

// 🐱 Activity data with week start dates
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
    // 🐱 Generate date labels for each week's Monday
    const buckets: ActivityBucket[] = counts.map((count, i) => {
      const weeksAgo = 11 - i;
      const d = new Date(now - weeksAgo * 7 * 24 * 60 * 60 * 1000);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return { count, label: `${m}/${day}` };
    });
    return buckets;
  } catch { return []; }
}

// 🐱 Rank calculation
function calcOverallRank(commits: number, prs: number, stars: number, followers: number): { rank: string; score: number } {
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

  const themeKey = sp.get("theme") || "v1";
  const t = THEMES[themeKey] || THEMES.v1;

  try {
    const [s, activity] = await Promise.all([fetchGitHubStats(username), fetchRecentActivity(username)]);
    const avatar = await fetchAvatarBase64(s.user.avatar_url);
    const { rank, score } = calcOverallRank(s.commits, s.pullRequests, s.stars, s.followers);

    const W = 480, pad = 28, contentW = W - pad * 2;

    // 🐱 ALL languages (not just top 6)
    const langSorted = Object.entries(s.languages).sort((a, b) => b[1] - a[1]);
    const langTotal = langSorted.reduce((sum, [, c]) => sum + c, 0);
    const allLangs = langSorted; // 🐱 show everything

    // 🐱 Height calculation
    const headerH = 64, div = 20, statsH = 132;
    // 🐱 Activity: bars + number labels above + date labels below
    const hasActivity = activity.length > 0;
    const actLabelH = 20;
    const actNumberH = hasActivity ? 14 : 0;  // space for numbers above bars
    const actBarH = hasActivity ? 44 : 0;
    const actDateH = hasActivity ? 16 : 0;     // space for date labels below
    const actTotalH = actNumberH + actBarH + actDateH;
    const actDiv = hasActivity ? 20 : 0;

    // 🐱 Languages: donut(80px) + legend rows for ALL languages
    const langLegendRows = Math.ceil(allLangs.length / 2);
    const donutH = allLangs.length > 0 ? 80 : 0;
    const langLegendH = allLangs.length > 0 ? langLegendRows * 20 : 0;
    const langSectionH = allLangs.length > 0 ? 24 + Math.max(donutH, langLegendH) : 0;

    const H = pad + headerH + div + statsH + div + actLabelH + actTotalH + actDiv + langSectionH + pad;

    const statsItems = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.pullRequests.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Stars Earned", value: s.stars.toLocaleString() },
      { label: "Repositories", value: s.repositories.toLocaleString() },
      { label: "Experience", value: `${s.experience} yr` },
    ];

    let o = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bgGrad1}"/><stop offset="100%" stop-color="${t.bgGrad2}"/></linearGradient>
  <clipPath id="ac"><circle cx="${pad + 24}" cy="${pad + 24}" r="24"/></clipPath>
</defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="${t.stroke}" stroke-width="1"/>
`;

    let y = pad;

    // ==================== HEADER ====================
    if (avatar) {
      o += `<image x="${pad}" y="${y}" width="48" height="48" href="${avatar}" clip-path="url(#ac)" preserveAspectRatio="xMidYMid slice"/>`;
      o += `<circle cx="${pad + 24}" cy="${y + 24}" r="24" fill="none" stroke="${t.avatarStroke}" stroke-width="1.5"/>`;
    }
    const tx = avatar ? pad + 60 : pad;
    o += `<text x="${tx}" y="${y + 20}" font-size="17" font-weight="700" fill="${t.title}" font-family="${F}">${esc(s.user.name || s.user.login)}</text>`;
    o += `<text x="${tx}" y="${y + 38}" font-size="11" fill="${t.subtitle}" font-family="${F}">@${esc(s.user.login)}</text>`;
    if (s.user.bio) {
      const bio = s.user.bio.length > 50 ? s.user.bio.slice(0, 47) + "..." : s.user.bio;
      o += `<text x="${tx}" y="${y + 54}" font-size="10" fill="${t.subtitle}" font-family="${F}" opacity="0.7">${esc(bio)}</text>`;
    }

    // 🐱 Rank circle
    const cx = W - pad - 28, cy2 = y + 24, cr = 24;
    const circ = 2 * Math.PI * cr, dOff = circ - (score / 100) * circ;
    o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="2"/>`;
    o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dOff.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy2})" opacity="0.9"/>`;
    o += `<text x="${cx}" y="${cy2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;
    y += headerH;

    o += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="${t.divider}" stroke-width="1"/>`;
    y += div;

    // ==================== STATS ====================
    statsItems.forEach((item, i) => {
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
    if (hasActivity) {
      o += `<text x="${pad}" y="${y + 12}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">ACTIVITY (LAST 12 WEEKS)</text>`;
      y += actLabelH;

      const gap = 4;
      const barW = (contentW - 11 * gap) / 12;
      const maxVal = Math.max(...activity.map(a => a.count), 1);

      // 🐱 Numbers above bars
      activity.forEach((bucket, i) => {
        const bx = pad + i * (barW + gap);
        const centerX = bx + barW / 2;
        if (bucket.count > 0) {
          o += `<text x="${centerX.toFixed(1)}" y="${(y + actNumberH - 2).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="600" fill="${t.value}" font-family="${M}" opacity="0.7">${bucket.count}</text>`;
        }
      });
      y += actNumberH;

      // 🐱 Bars
      activity.forEach((bucket, i) => {
        const bx = pad + i * (barW + gap);
        const bh = Math.max((bucket.count / maxVal) * actBarH, 2);
        const by = y + actBarH - bh;
        const opacity = bucket.count === 0 ? 0.15 : 0.3 + (bucket.count / maxVal) * 0.7;
        o += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${t.bar}" opacity="${opacity.toFixed(2)}"/>`;
      });
      y += actBarH;

      // 🐱 Date labels below bars (show every other to avoid crowding)
      activity.forEach((bucket, i) => {
        if (i % 2 === 0 || i === 11) {
          const bx = pad + i * (barW + gap);
          const centerX = bx + barW / 2;
          o += `<text x="${centerX.toFixed(1)}" y="${(y + 12).toFixed(1)}" text-anchor="middle" font-size="7" fill="${t.sectionLabel}" font-family="${M}">${bucket.label}</text>`;
        }
      });
      y += actDateH;

      o += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="${t.divider}" stroke-width="1"/>`;
      y += actDiv;
    }

    // ==================== LANGUAGES (ALL) ====================
    if (allLangs.length > 0) {
      o += `<text x="${pad}" y="${y + 14}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">MOST USED LANGUAGES</text>`;
      y += 24;

      // 🐱 Donut chart with ALL languages
      const dCx = pad + 40, dCy = y + 40, dR = 32, dIR = 20;
      let sa = -90;
      allLangs.forEach(([lang, count]) => {
        const pct = count / langTotal, angle = pct * 360, ea = sa + angle;
        const sr = (sa * Math.PI) / 180, er = (ea * Math.PI) / 180;
        const x1 = dCx + dR * Math.cos(sr), y1 = dCy + dR * Math.sin(sr);
        const x2 = dCx + dR * Math.cos(er), y2 = dCy + dR * Math.sin(er);
        const ix1 = dCx + dIR * Math.cos(er), iy1 = dCy + dIR * Math.sin(er);
        const ix2 = dCx + dIR * Math.cos(sr), iy2 = dCy + dIR * Math.sin(sr);
        const la = angle > 180 ? 1 : 0;
        o += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${dR},${dR} 0 ${la},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${dIR},${dIR} 0 ${la},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${LANG_COLORS[lang] || "#555"}"/>`;
        sa = ea;
      });

      // 🐱 Center: total language count
      o += `<text x="${dCx}" y="${dCy + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${t.donutCenter}" font-family="${M}">${allLangs.length}</text>`;

      // 🐱 Legend: ALL languages with percentage
      const legX = pad + 100, legW = contentW - 100;
      allLangs.forEach(([lang, count], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const lx = legX + col * (legW / 2), ly = y + 8 + row * 20;
        const pct = ((count / langTotal) * 100).toFixed(1);
        o += `<circle cx="${lx + 5}" cy="${ly + 6}" r="4" fill="${LANG_COLORS[lang] || "#555"}"/>`;
        o += `<text x="${lx + 16}" y="${ly + 10}" font-size="11" fill="${t.legendText}" font-family="${F}">${esc(lang)}</text>`;
        o += `<text x="${lx + legW / 2 - 4}" y="${ly + 10}" text-anchor="end" font-size="10" fill="${t.legendSub}" font-family="${M}">${pct}%</text>`;
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
