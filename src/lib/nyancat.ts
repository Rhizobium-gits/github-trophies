// 🐱 Nyan Cat pixel art with CSS animation
// GitHub README supports <style> with @keyframes inside SVGs

const P = 2; // pixel size

const CAT_PIXELS = [
  [0,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,3,3,3,0,0,0,3,3,3,0,0,0,0,0,0],
  [0,0,0,0,0,3,3,3,3,2,2,2,2,2,3,3,0,0,0,0,0],
  [0,0,0,0,3,3,2,2,2,2,2,2,2,2,2,3,3,0,0,0,0],
  [0,0,0,3,3,2,2,1,1,2,1,1,2,1,2,2,3,3,0,0,0],
  [0,0,0,3,2,2,1,1,1,1,1,1,1,1,1,2,2,3,0,0,0],
  [0,0,3,3,2,1,1,1,1,1,1,1,1,1,1,1,2,3,3,0,0],
  [0,0,3,2,2,1,1,1,1,1,1,1,1,1,1,1,2,2,3,0,0],
  [0,0,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,0,0],
  [0,7,3,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3,5,0],
  [7,7,3,2,2,1,1,1,1,1,1,1,1,1,1,1,2,2,3,5,5],
  [0,7,3,3,2,2,1,1,1,1,1,1,1,1,1,2,2,3,4,3,5],
  [0,0,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,3,4,3,0],
  [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,3,0,0],
  [0,0,0,0,0,3,0,0,3,0,0,3,0,0,3,0,0,0,0,0,0],
];

const COLORS: Record<number, string> = {
  1: "#ffaaaa", 2: "#ff6699", 3: "#999999", 4: "#ff9999", 5: "#333333", 6: "#ff6666", 7: "#888888",
};

const RAINBOW = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];

// 🐱 Returns { style, body } — style goes in parent <style>, body goes in SVG
export function renderNyanCat(x: number, y: number, score: number): { style: string; body: string } {
  const catH = CAT_PIXELS.length * P;
  const trailW = 20;
  const dur = Math.max(0.8, 5 - (score / 100) * 4.2);

  let style = `
@keyframes nyan-bounce {
  0%, 100% { transform: translate(${x}px, ${y}px); }
  50% { transform: translate(${x + 6}px, ${y - 3}px); }
}
@keyframes nyan-trail {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
@keyframes nyan-star {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.1; }
}
.nyan-cat { animation: nyan-bounce ${dur.toFixed(2)}s ease-in-out infinite; }
.nyan-trail { animation: nyan-trail ${(dur * 0.4).toFixed(2)}s ease-in-out infinite; }
.nyan-s1 { animation: nyan-star ${(dur * 0.6).toFixed(2)}s ease-in-out infinite; }
.nyan-s2 { animation: nyan-star ${(dur * 0.6).toFixed(2)}s ease-in-out 0.2s infinite; }
.nyan-s3 { animation: nyan-star ${(dur * 0.6).toFixed(2)}s ease-in-out 0.4s infinite; }
`;

  let body = `<g class="nyan-cat">`;

  // 🐱 Rainbow trail
  const stripH = Math.floor(catH / RAINBOW.length);
  const rainbowY = 3 * P;
  RAINBOW.forEach((color, i) => {
    body += `<rect class="nyan-trail" x="0" y="${rainbowY + i * stripH}" width="${trailW}" height="${stripH}" fill="${color}"/>`;
  });

  // 🐱 Cat body
  const catOffX = trailW + 2;
  CAT_PIXELS.forEach((row, ry) => {
    row.forEach((pixel, rx) => {
      if (pixel === 0) return;
      body += `<rect x="${catOffX + rx * P}" y="${ry * P}" width="${P}" height="${P}" fill="${COLORS[pixel]}"/>`;
    });
  });

  // 🐱 Sparkles
  body += `<text class="nyan-s1" x="${catOffX - 12}" y="8" font-size="7" fill="#ffee88">✦</text>`;
  body += `<text class="nyan-s2" x="${catOffX + 46}" y="4" font-size="5" fill="#ffee88">✦</text>`;
  body += `<text class="nyan-s3" x="${catOffX + 44}" y="26" font-size="6" fill="#ffee88">✦</text>`;

  body += `</g>`;

  return { style, body };
}
