// 🐱 Party Cat pixel art with CSS @keyframes animation
// Embedded directly in SVG — no <image> tags, GitHub-safe
// Cat bounces and cycles through rainbow colors based on rank score

// 🐱 Cat silhouette pixel grid (12x10, simplified party cat)
// 1 = body, 2 = ear, 3 = eye, 4 = nose
const CAT = [
  [0,0,2,0,0,0,0,0,0,2,0,0],
  [0,2,1,2,0,0,0,0,2,1,2,0],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,3,1,1,1,1,1,1,3,1,1],
  [1,1,1,1,1,4,4,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,0,1,0,0,1,0,1,0,0],
];

const RAINBOW = ["#ff0000","#ff6600","#ffcc00","#33cc33","#3399ff","#cc33ff"];

export function renderPartyCat(x: number, y: number, score: number): { style: string; body: string } {
  const px = 3; // pixel size
  const dur = Math.max(0.3, 2.5 - (score / 100) * 2.2); // S=0.3s, C=2.5s
  const bounceDur = Math.max(0.4, 3 - (score / 100) * 2.6);

  // 🐱 CSS keyframes
  const colorSteps = RAINBOW.map((c, i) => {
    const pct = Math.round((i / RAINBOW.length) * 100);
    return `${pct}% { fill: ${c}; }`;
  }).join(" ");

  const style = `
    @keyframes party-color { ${colorSteps} 100% { fill: ${RAINBOW[0]}; } }
    @keyframes party-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-${Math.round(2 + score / 20)}px); } }
    .pc-body { animation: party-color ${dur.toFixed(2)}s linear infinite, party-bounce ${bounceDur.toFixed(2)}s ease-in-out infinite; }
    .pc-ear { animation: party-color ${dur.toFixed(2)}s linear infinite; opacity: 0.8; }
    .pc-eye { fill: #fff; }
    .pc-nose { fill: #ffaaaa; animation: party-bounce ${bounceDur.toFixed(2)}s ease-in-out infinite; }
  `;

  let body = `<g transform="translate(${x},${y})">`;

  CAT.forEach((row, ry) => {
    row.forEach((cell, rx) => {
      if (cell === 0) return;
      const cx = rx * px;
      const cy = ry * px;
      let cls = "pc-body";
      if (cell === 2) cls = "pc-ear";
      if (cell === 3) cls = "pc-eye";
      if (cell === 4) cls = "pc-nose";
      body += `<rect class="${cls}" x="${cx}" y="${cy}" width="${px}" height="${px}"/>`;
    });
  });

  body += `</g>`;

  return { style, body };
}
