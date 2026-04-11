import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";
import { CATEGORIES, getRank, getProgress, rankStyles, trophyCard, errorSvg } from "@/lib/svg";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const username = sp.get("username");

  if (!username) {
    return new NextResponse(errorSvg("Missing ?username= parameter"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  }
  if (!isValidUsername(username)) {
    return new NextResponse(errorSvg("Invalid GitHub username"), { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  }

  try {
    const stats = await fetchGitHubStats(username);
    const cols = Math.min(Math.max(parseInt(sp.get("cols") || "4"), 1), 8);
    const theme = sp.get("theme") || "default";
    const rs = rankStyles(theme);

    const cw = 120, ch = 120, gap = 12, pad = 16;
    const rows = Math.ceil(CATEGORIES.length / cols);
    const svgW = pad * 2 + cols * cw + (cols - 1) * gap;
    const svgH = pad * 2 + rows * ch + (rows - 1) * gap;
    const bg = theme === "dark" ? "#0D1117" : "#FFFFFF";

    let cards = "";
    CATEGORIES.forEach((cat, i) => {
      const x = pad + (i % cols) * (cw + gap);
      const y = pad + Math.floor(i / cols) * (ch + gap);
      const val = cat.key === "languages" ? Object.keys(stats.languages).length : (stats[cat.key as keyof typeof stats] as number);
      const rank = getRank(val, cat.th);
      cards += trophyCard(x, y, cat.title, cat.icon, val, rank, getProgress(val, cat.th), rs);
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
<rect width="${svgW}" height="${svgH}" rx="12" fill="${bg}"/>
${cards}
</svg>`;

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
