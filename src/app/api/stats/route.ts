import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { LANG_COLORS } from "@/lib/svg";

// 🐱 Rank calculation
const RANK_THRESHOLDS = [
  { min: 50, rank: "S", commits: 2000, prs: 100, stars: 200, followers: 200 },
  { min: 40, rank: "A+", commits: 1000, prs: 50, stars: 100, followers: 100 },
  { min: 30, rank: "A", commits: 500, prs: 20, stars: 50, followers: 50 },
  { min: 20, rank: "B+", commits: 200, prs: 10, stars: 20, followers: 20 },
  { min: 10, rank: "B", commits: 100, prs: 5, stars: 10, followers: 10 },
  { min: 0, rank: "C", commits: 0, prs: 0, stars: 0, followers: 0 },
];

function calcOverallRank(commits: number, prs: number, stars: number, followers: number): { rank: string; score: number } {
  const score = Math.min(
    Math.log10(commits + 1) * 10 +
    Math.log10(prs + 1) * 8 +
    Math.log10(stars + 1) * 6 +
    Math.log10(followers + 1) * 4,
    100
  );
  for (const t of RANK_THRESHOLDS) {
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
    const s = await fetchGitHubStats(username);
    const { rank, score } = calcOverallRank(s.commits, s.pullRequests, s.stars, s.followers);

    // 🐱 Layout
    const W = 460;
    const pad = 24;
    const contentW = W - pad * 2;

    // 🐱 Languages
    const langSorted = Object.entries(s.languages).sort((a, b) => b[1] - a[1]);
    const langTotal = langSorted.reduce((sum, [, c]) => sum + c, 0);
    const topLangs = langSorted.slice(0, 8);

    // 🐱 Dynamic height
    const headerH = 40;
    const statsH = 140;
    const langBarH = topLangs.length > 0 ? 16 : 0;
    const langLegendRows = Math.ceil(topLangs.length / 2);
    const langLegendH = topLangs.length > 0 ? 24 + langLegendRows * 20 : 0;
    const H = pad + headerH + statsH + langBarH + langLegendH + pad;

    // 🐱 Stats items
    const statsItems = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.pullRequests.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Stars Earned", value: s.stars.toLocaleString() },
      { label: "Repositories", value: s.repositories.toLocaleString() },
      { label: "Contributed to", value: `${s.experience}yr` },
    ];

    // 🐱 Build SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0a0a0a"/>
    <stop offset="100%" stop-color="#1a1a1a"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" rx="12" fill="url(#bg)" stroke="#333" stroke-width="1"/>
`;

    let y = pad;

    // 🐱 Header: username + rank
    svg += `<text x="${pad}" y="${y + 16}" font-size="16" font-weight="600" fill="#fff" font-family="${FONT}">${escapeXml(s.user.name || s.user.login)}</text>`;
    svg += `<text x="${pad}" y="${y + 32}" font-size="11" fill="#666" font-family="${FONT}">@${escapeXml(s.user.login)}</text>`;

    // 🐱 Rank circle (right side)
    const circleX = W - pad - 30;
    const circleY = y + 18;
    const circumference = 2 * Math.PI * 22;
    const dashOffset = circumference - (score / 100) * circumference;
    svg += `<circle cx="${circleX}" cy="${circleY}" r="22" fill="none" stroke="#222" stroke-width="3"/>`;
    svg += `<circle cx="${circleX}" cy="${circleY}" r="22" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90 ${circleX} ${circleY})"/>`;
    svg += `<text x="${circleX}" y="${circleY + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="${FONT}">${rank}</text>`;

    y += headerH + 12;

    // 🐱 Divider
    svg += `<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="#222" stroke-width="1"/>`;
    y += 16;

    // 🐱 Stats list
    statsItems.forEach((item, i) => {
      const iy = y + i * 20;

      // 🐱 Dot
      svg += `<circle cx="${pad + 4}" cy="${iy + 5}" r="2.5" fill="#555"/>`;

      // 🐱 Label
      svg += `<text x="${pad + 16}" y="${iy + 9}" font-size="12" fill="#999" font-family="${FONT}">${item.label}</text>`;

      // 🐱 Value (right-aligned)
      svg += `<text x="${W - pad}" y="${iy + 9}" text-anchor="end" font-size="13" font-weight="600" fill="#fff" font-family="${MONO}">${item.value}</text>`;

      // 🐱 Dotted line between label and value
      svg += `<line x1="${pad + 140}" y1="${iy + 6}" x2="${W - pad - 60}" y2="${iy + 6}" stroke="#222" stroke-width="1" stroke-dasharray="2,4"/>`;
    });

    y += statsH;

    // 🐱 Languages section
    if (topLangs.length > 0) {
      // 🐱 Language bar
      const barW = contentW;
      let ox = 0;
      svg += `<clipPath id="lbc"><rect x="${pad}" y="${y}" width="${barW}" height="8" rx="4"/></clipPath><g clip-path="url(#lbc)">`;
      for (const [lang, count] of topLangs) {
        const w = (count / langTotal) * barW;
        svg += `<rect x="${pad + ox}" y="${y}" width="${Math.max(w, 2)}" height="8" fill="${LANG_COLORS[lang] || "#555"}"/>`;
        ox += w;
      }
      svg += `</g>`;

      y += langBarH + 12;

      // 🐱 Legend
      topLangs.forEach(([lang, count], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const lx = pad + col * (contentW / 2);
        const ly = y + row * 20;
        const pct = ((count / langTotal) * 100).toFixed(1);

        svg += `<circle cx="${lx + 5}" cy="${ly + 5}" r="4" fill="${LANG_COLORS[lang] || "#555"}"/>`;
        svg += `<text x="${lx + 16}" y="${ly + 9}" font-size="11" fill="#ccc" font-family="${FONT}">${escapeXml(lang)}</text>`;
        svg += `<text x="${lx + (contentW / 2) - 8}" y="${ly + 9}" text-anchor="end" font-size="10" fill="#666" font-family="${MONO}">${pct}%</text>`;
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
