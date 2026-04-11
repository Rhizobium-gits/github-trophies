// 🐱 Party Cat GIF: fetch, adjust speed, return as base64 data URI

const CATS: Record<string, string> = {
  cat: "https://cultofthepartyparrot.com/guests/catparrot.gif",
  blob: "https://cultofthepartyparrot.com/guests/hd/partyblobcat.gif",
  vibe: "https://cultofthepartyparrot.com/guests/hd/vibepartycat.gif",
};

// 🐱 GIF raw buffer cache
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

// 🐱 Modify GIF frame delays in-place (raw binary)
function adjustGifSpeed(buffer: Buffer, delayHundredths: number): Buffer {
  const out = Buffer.from(buffer);
  let i = 0;
  while (i < out.length - 6) {
    if (out[i] === 0x21 && out[i + 1] === 0xF9 && out[i + 2] === 0x04) {
      out[i + 4] = delayHundredths & 0xFF;
      out[i + 5] = (delayHundredths >> 8) & 0xFF;
      i += 7;
    } else {
      i++;
    }
  }
  return out;
}

// 🐱 Get speed-adjusted GIF as raw buffer
export async function getPartyCatBuffer(catType: string, score: number): Promise<Buffer> {
  const url = CATS[catType] || CATS.cat;
  const original = await fetchGif(url);
  const delay = Math.round(Math.max(1, 12 - (score / 100) * 11));
  return adjustGifSpeed(original, delay);
}

// 🐱 Get speed-adjusted GIF as base64 data URI (for SVG embedding)
export async function getPartyCatBase64(catType: string, score: number): Promise<string> {
  const buf = await getPartyCatBuffer(catType, score);
  return `data:image/gif;base64,${buf.toString("base64")}`;
}

export { CATS };
