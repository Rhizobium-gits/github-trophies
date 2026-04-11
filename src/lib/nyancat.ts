// 🐱 Nyan Cat pixel art SVG with speed-based animation
// Speed is based on rank score (0-100): higher = faster

const P = 2; // pixel size

// 🐱 Pixel grid for the cat body (pop-tart + cat)
// Colors: 0=transparent, 1=body(pink), 2=frosting(dark pink), 3=cat(gray), 4=cheek(pink), 5=eye, 6=mouth, 7=tail(gray)
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
  1: "#ffaaaa", // pop-tart body (light pink)
  2: "#ff6699", // frosting (dark pink)
  3: "#999999", // cat body (gray)
  4: "#ff9999", // cheek
  5: "#333333", // eye
  6: "#ff6666", // mouth
  7: "#888888", // tail
};

// 🐱 Rainbow trail colors
const RAINBOW = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];

export function renderNyanCat(x: number, y: number, score: number, theme: "light" | "dark"): string {
  const catW = CAT_PIXELS[0].length * P;
  const catH = CAT_PIXELS.length * P;
  const trailW = 24;
  const totalW = catW + trailW + 4;

  // 🐱 Animation speed: score 0=6s, score 100=1s
  const duration = Math.max(1, 6 - (score / 100) * 5);

  let svg = "";

  // 🐱 Animated group - bounces horizontally
  svg += `<g>`;
  svg += `<animateTransform attributeName="transform" type="translate" values="${x},${y}; ${x + 8},${y - 2}; ${x},${y}" dur="${duration}s" repeatCount="indefinite"/>`;

  // 🐱 Rainbow trail (left of cat)
  const rainbowX = 0;
  const rainbowStartY = 3 * P;
  const stripH = Math.floor(catH / RAINBOW.length);
  RAINBOW.forEach((color, i) => {
    const ry = rainbowStartY + i * stripH;
    // 🐱 Trail with slight wave animation
    svg += `<rect x="${rainbowX}" y="${ry}" width="${trailW}" height="${stripH}" fill="${color}" opacity="0.8">`;
    svg += `<animate attributeName="width" values="${trailW};${trailW - 4};${trailW}" dur="${duration * 0.5}s" repeatCount="indefinite"/>`;
    svg += `</rect>`;
  });

  // 🐱 Cat pixels
  const catOffX = trailW + 2;
  CAT_PIXELS.forEach((row, ry) => {
    row.forEach((pixel, rx) => {
      if (pixel === 0) return;
      const color = COLORS[pixel] || "#999";
      svg += `<rect x="${catOffX + rx * P}" y="${ry * P}" width="${P}" height="${P}" fill="${color}"/>`;
    });
  });

  // 🐱 Sparkle stars around the cat
  const sparkleColor = theme === "light" ? "#ffcc00" : "#ffee88";
  const sparkles = [
    { sx: -8, sy: 4, delay: 0 },
    { sx: totalW + 2, sy: 8, delay: 0.3 },
    { sx: totalW - 4, sy: -4, delay: 0.6 },
    { sx: -4, sy: catH - 4, delay: 0.9 },
  ];
  sparkles.forEach(({ sx, sy, delay }) => {
    svg += `<text x="${sx}" y="${sy + 6}" font-size="6" fill="${sparkleColor}" opacity="0.8">`;
    svg += `*`;
    svg += `<animate attributeName="opacity" values="0.8;0.2;0.8" dur="${duration * 0.7}s" begin="${delay}s" repeatCount="indefinite"/>`;
    svg += `</text>`;
  });

  svg += `</g>`;

  return svg;
}
