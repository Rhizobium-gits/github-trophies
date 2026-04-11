import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { LANG_COLORS, errorSvg } from "@/lib/svg";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const username = sp.get("username");

  if (!username) {
    return new NextResponse(errorSvg("Missing ?username= parameter", 400), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  }
  if (!isValidUsername(username)) {
    return new NextResponse(errorSvg("Invalid GitHub username", 400), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  }

  try {
    const stats = await fetchGitHubStats(username);
    const theme = sp.get("theme") || "default";
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "8"), 1), 20);

    const sorted = Object.entries(stats.languages).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    const top = sorted.slice(0, limit);

    if (!top.length) {
      return new NextResponse(errorSvg(`@${username}: no languages detected`, 400), { status: 200, headers: { "Content-Type": "image/svg+xml" } });
    }

    const bg = theme === "dark" ? "#0D1117" : "#FFF";
    const txt = theme === "dark" ? "#C9D1D9" : "#333";
    const sub = theme === "dark" ? "#8B949E" : "#888";
    const bdr = theme === "dark" ? "#30363D" : "#E5E7EB";
    const font = "system-ui, -apple-system, sans-serif";

    const pad = 20, barY = 44, barH = 10, barW = 360;
    const legY = barY + barH + 20, legCW = 180, legRH = 20;
    const legRows = Math.ceil(top.length / 2);
    const svgW = pad * 2 + barW;
    const svgH = legY + legRows * legRH + pad;

    // 🐱 Stacked bar
    let segs = "";
    let ox = 0;
    for (const [lang, count] of top) {
      const w = (count / total) * barW;
      segs += `<rect x="${pad + ox}" y="${barY}" width="${Math.max(w, 1)}" height="${barH}" fill="${LANG_COLORS[lang] || "#888"}"/>`;
      ox += w;
    }
    const bar = `<clipPath id="bc"><rect x="${pad}" y="${barY}" width="${barW}" height="${barH}" rx="5"/></clipPath><g clip-path="url(#bc)">${segs}</g>`;

    // 🐱 Legend
    let leg = "";
    top.forEach(([lang, count], i) => {
      const lx = pad + (i % 2) * legCW;
      const ly = legY + Math.floor(i / 2) * legRH;
      const pct = ((count / total) * 100).toFixed(1);
      leg += `<g transform="translate(${lx},${ly})"><circle cx="5" cy="5" r="5" fill="${LANG_COLORS[lang] || "#888"}"/><text x="16" y="9" font-size="11" fill="${txt}" font-family="${font}">${lang}</text><text x="${legCW - 20}" y="9" font-size="10" fill="${sub}" text-anchor="end" font-family="${font}">${pct}%</text></g>`;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
<rect width="${svgW}" height="${svgH}" rx="10" fill="${bg}" stroke="${bdr}" stroke-width="1"/>
<text x="${pad}" y="28" font-size="13" font-weight="600" fill="${txt}" font-family="${font}">Most Used Languages</text>
${bar}
${leg}
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new NextResponse(errorSvg(`@${username}: ${msg}`, 400), { status: 500, headers: { "Content-Type": "image/svg+xml" } });
  }
}
