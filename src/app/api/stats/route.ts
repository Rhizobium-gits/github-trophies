import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { LANG_COLORS } from "@/lib/svg";

// 🐱 Fetch avatar as base64 for embedding in SVG
async function fetchAvatarBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}&s=80`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const ct = res.headers.get("content-type") || "image/png";
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}

// 🐱 Fetch recent events for activity graph
interface GitHubEvent {
  type: string;
  created_at: string;
}

async function fetchRecentActivity(username: string): Promise<number[]> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers: h });
    if (!res.ok) return [];
    const events: GitHubEvent[] = await res.json();

    // 🐱 Group into 12 weekly buckets (last ~3 months)
    const now = Date.now();
    const buckets = new Array(12).fill(0);
    for (const ev of events) {
      const age = now - new Date(ev.created_at).getTime();
      const weekIdx = Math.floor(age / (7 * 24 * 60 * 60 * 1000));
      if (weekIdx < 12) buckets[11 - weekIdx]++;
    }
    return buckets;
  } catch {
    return [];
  }
}

// 🐱 Rank calculation
function calcOverallRank(commits: number, prs: number, stars: number, followers: number): { rank: string; score: number } {
  const score = Math.min(
    Math.log10(commits + 1) * 10 +
    Math.log10(prs + 1) * 8 +
    Math.log10(stars + 1) * 6 +
    Math.log10(followers + 1) * 4,
    100
  );
  const ranks = [
    { min: 50, rank: "S" }, { min: 40, rank: "A+" }, { min: 30, rank: "A" },
    { min: 20, rank: "B+" }, { min: 10, rank: "B" }, { min: 0, rank: "C" },
  ];
  for (const t of ranks) {
    if (score >= t.min) return { rank: t.rank, score: Math.round(score) };
  }
  return { rank: "C", score: 0 };
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const FONT = "system-ui, -apple-system, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, monospace";

function errorSvg(msg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="60"><rect width="480" height="60" rx="8" fill="#111" stroke="#333"/><text x="240" y="35" text-anchor="middle" font-size="12" fill="#f87171" font-family="${FONT}">${escapeXml(msg)}</text></svg>`;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const username = sp.get("username");

  if (!username) return new NextResponse(errorSvg("Missing ?username= parameter"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  if (!isValidUsername(username)) return new NextResponse(errorSvg("Invalid GitHub username"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });

  try {
    const [s, activity] = await Promise.all([
      fetchGitHubStats(username),
      fetchRecentActivity(username),
    ]);
    const avatar = await fetchAvatarBase64(s.user.avatar_url);
    const { rank, score } = calcOverallRank(s.commits, s.pullRequests, s.stars, s.followers);

    // 🐱 Layout constants
    const W = 480;
    const pad = 28;
    const contentW = W - pad * 2;

    // 🐱 Languages
    const langSorted = Object.entries(s.languages).sort((a, b) => b[1] - a[1]);
    const langTotal = langSorted.reduce((sum, [, c]) => sum + c, 0);
    const topLangs = langSorted.slice(0, 6);

    // 🐱 Dynamic height calculation
    const headerH = 64;
    const divider1 = 20;
    const statsH = 132;
    const divider2 = 20;
    const activityLabelH = 20;
    const activityH = activity.length > 0 ? 60 : 0;
    const divider3 = activity.length > 0 ? 20 : 0;
    const langSectionH = topLangs.length > 0 ? 24 + 80 + 24 + Math.ceil(topLangs.length / 3) * 22 : 0;
    const H = pad + headerH + divider1 + statsH + divider2 + activityLabelH + activityH + divider3 + langSectionH + pad;

    // 🐱 Stats
    const statsItems = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.pullRequests.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Stars Earned", value: s.stars.toLocaleString() },
      { label: "Repositories", value: s.repositories.toLocaleString() },
      { label: "Experience", value: `${s.experience} yr` },
    ];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#111"/>
    <stop offset="100%" stop-color="#0a0a0a"/>
  </linearGradient>
  <clipPath id="avatarClip"><circle cx="${pad + 24}" cy="${pad + 24}" r="24"/></clipPath>
</defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="#2a2a2a" stroke-width="1"/>
`;

    let y = pad;

    // ==================== HEADER ====================
    // 🐱 Avatar
    if (avatar) {
      svg += `<image x="${pad}" y="${y}" width="48" height="48" href="${avatar}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`;
      svg += `<circle cx="${pad + 24}" cy="${y + 24}" r="24" fill="none" stroke="#333" stroke-width="1.5"/>`;
    }

    // 🐱 Name + handle
    const textX = avatar ? pad + 60 : pad;
    svg += `<text x="${textX}" y="${y + 20}" font-size="17" font-weight="700" fill="#fff" font-family="${FONT}">${escapeXml(s.user.name || s.user.login)}</text>`;
    svg += `<text x="${textX}" y="${y + 38}" font-size="11" fill="#555" font-family="${FONT}">@${escapeXml(s.user.login)}</text>`;
    if (s.user.bio) {
      const bio = s.user.bio.length > 50 ? s.user.bio.slice(0, 47) + "..." : s.user.bio;
      svg += `<text x="${textX}" y="${y + 54}" font-size="10" fill="#444" font-family="${FONT}">${escapeXml(bio)}</text>`;
    }

    // 🐱 Rank circle
    const cx = W - pad - 28;
    const cy = y + 24;
    const r = 24;
    const circ = 2 * Math.PI * r;
    const dashOff = circ - (score / 100) * circ;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#151515" stroke="#222" stroke-width="2"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dashOff.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})" opacity="0.9"/>`;
    svg += `<text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="#fff" font-family="${FONT}">${rank}</text>`;

    y += headerH;

    // 🐱 Divider
    svg += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="#1e1e1e" stroke-width="1"/>`;
    y += divider1;

    // ==================== STATS ====================
    statsItems.forEach((item, i) => {
      const iy = y + i * 22;
      svg += `<circle cx="${pad + 4}" cy="${iy + 5}" r="2" fill="#444"/>`;
      svg += `<text x="${pad + 14}" y="${iy + 9}" font-size="12" fill="#888" font-family="${FONT}">${item.label}</text>`;
      svg += `<line x1="${pad + 130}" y1="${iy + 6}" x2="${W - pad - 70}" y2="${iy + 6}" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="2,4"/>`;
      svg += `<text x="${W - pad}" y="${iy + 9}" text-anchor="end" font-size="13" font-weight="600" fill="#eee" font-family="${MONO}">${item.value}</text>`;
    });

    y += statsH;

    // 🐱 Divider
    svg += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="#1e1e1e" stroke-width="1"/>`;
    y += divider2;

    // ==================== ACTIVITY GRAPH ====================
    if (activity.length > 0) {
      svg += `<text x="${pad}" y="${y + 12}" font-size="10" font-weight="600" fill="#555" font-family="${FONT}" letter-spacing="1">ACTIVITY (LAST 12 WEEKS)</text>`;
      y += activityLabelH;

      const barAreaW = contentW;
      const barCount = activity.length;
      const gap = 4;
      const barW = (barAreaW - (barCount - 1) * gap) / barCount;
      const maxVal = Math.max(...activity, 1);
      const barMaxH = 44;

      activity.forEach((val, i) => {
        const bx = pad + i * (barW + gap);
        const bh = Math.max((val / maxVal) * barMaxH, 2);
        const by = y + barMaxH - bh;
        const opacity = val === 0 ? 0.15 : 0.3 + (val / maxVal) * 0.7;
        svg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="#fff" opacity="${opacity.toFixed(2)}"/>`;
      });

      y += activityH;

      // 🐱 Divider
      svg += `<line x1="${pad}" y1="${y + 10}" x2="${W - pad}" y2="${y + 10}" stroke="#1e1e1e" stroke-width="1"/>`;
      y += divider3;
    }

    // ==================== LANGUAGES ====================
    if (topLangs.length > 0) {
      svg += `<text x="${pad}" y="${y + 14}" font-size="10" font-weight="600" fill="#555" font-family="${FONT}" letter-spacing="1">MOST USED LANGUAGES</text>`;
      y += 24;

      // 🐱 Donut chart
      const donutCx = pad + 40;
      const donutCy = y + 40;
      const donutR = 32;
      const donutInnerR = 20;

      let startAngle = -90;
      topLangs.forEach(([lang, count]) => {
        const pct = count / langTotal;
        const angle = pct * 360;
        const endAngle = startAngle + angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = donutCx + donutR * Math.cos(startRad);
        const y1 = donutCy + donutR * Math.sin(startRad);
        const x2 = donutCx + donutR * Math.cos(endRad);
        const y2 = donutCy + donutR * Math.sin(endRad);
        const ix1 = donutCx + donutInnerR * Math.cos(endRad);
        const iy1 = donutCy + donutInnerR * Math.sin(endRad);
        const ix2 = donutCx + donutInnerR * Math.cos(startRad);
        const iy2 = donutCy + donutInnerR * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        svg += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${donutR},${donutR} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${donutInnerR},${donutInnerR} 0 ${largeArc},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${LANG_COLORS[lang] || "#555"}"/>`;

        startAngle = endAngle;
      });

      // 🐱 Center count
      svg += `<text x="${donutCx}" y="${donutCy + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="#fff" font-family="${MONO}">${Object.keys(s.languages).length}</text>`;

      // 🐱 Legend (right of donut)
      const legX = pad + 100;
      const legW = contentW - 100;
      const cols = 2;
      topLangs.forEach(([lang, count], i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const lx = legX + col * (legW / cols);
        const ly = y + 8 + row * 22;
        const pct = ((count / langTotal) * 100).toFixed(1);

        svg += `<circle cx="${lx + 5}" cy="${ly + 6}" r="4" fill="${LANG_COLORS[lang] || "#555"}"/>`;
        svg += `<text x="${lx + 16}" y="${ly + 10}" font-size="11" fill="#bbb" font-family="${FONT}">${escapeXml(lang)}</text>`;
        svg += `<text x="${lx + (legW / cols) - 4}" y="${ly + 10}" text-anchor="end" font-size="10" fill="#555" font-family="${MONO}">${pct}%</text>`;
      });
    }

    svg += `</svg>`;

    return new NextResponse(svg, {
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
