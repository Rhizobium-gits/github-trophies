import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, isValidUsername } from "@/lib/github";

// 🐱 Available cat GIFs
const CATS: Record<string, string> = {
  cat: "https://cultofthepartyparrot.com/guests/catparrot.gif",
  blob: "https://cultofthepartyparrot.com/guests/hd/partyblobcat.gif",
  vibe: "https://cultofthepartyparrot.com/guests/hd/vibepartycat.gif",
};

// 🐱 Rank score calculation (same as stats route)
function calcScore(commits: number, prs: number, stars: number, followers: number): number {
  return Math.min(
    Math.log10(commits + 1) * 10 +
    Math.log10(prs + 1) * 8 +
    Math.log10(stars + 1) * 6 +
    Math.log10(followers + 1) * 4,
    100
  );
}

// 🐱 Modify GIF frame delays in-place
// GIF89a Graphics Control Extension: 0x21 0xF9 0x04 [packed] [delay_lo] [delay_hi] [transparent] 0x00
function adjustGifSpeed(buffer: Buffer, delayHundredths: number): Buffer {
  const out = Buffer.from(buffer);
  let i = 0;
  while (i < out.length - 6) {
    if (out[i] === 0x21 && out[i + 1] === 0xF9 && out[i + 2] === 0x04) {
      // 🐱 Found Graphics Control Extension — overwrite delay (bytes 4-5, little-endian)
      out[i + 3] = out[i + 3]; // keep packed byte
      out[i + 4] = delayHundredths & 0xFF;         // delay low byte
      out[i + 5] = (delayHundredths >> 8) & 0xFF;  // delay high byte
      i += 7; // skip past this block
    } else {
      i++;
    }
  }
  return out;
}

// 🐱 GIF cache
const gifCache = new Map<string, Buffer>();

async function fetchGif(url: string): Promise<Buffer> {
  const cached = gifCache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch GIF: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  gifCache.set(url, buf);
  return buf;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const username = sp.get("username");
  const catType = sp.get("cat") || "cat";

  if (!username) {
    return new NextResponse("Missing ?username= parameter", { status: 400 });
  }
  if (!isValidUsername(username)) {
    return new NextResponse("Invalid GitHub username", { status: 400 });
  }

  const gifUrl = CATS[catType] || CATS.cat;

  try {
    const [stats, originalGif] = await Promise.all([
      fetchGitHubStats(username),
      fetchGif(gifUrl),
    ]);

    const score = calcScore(stats.commits, stats.pullRequests, stats.stars, stats.followers);

    // 🐱 Map score to frame delay:
    //   Score 0  (C rank)  → 12 hundredths (120ms) = slow
    //   Score 50 (S rank)  → 2 hundredths  (20ms)  = super fast
    //   Score 100          → 1 hundredth   (10ms)  = blazing
    const delay = Math.round(Math.max(1, 12 - (score / 100) * 11));

    const modifiedGif = adjustGifSpeed(originalGif, delay);

    return new NextResponse(new Uint8Array(modifiedGif), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new NextResponse(`Error: ${msg}`, { status: 500 });
  }
}
