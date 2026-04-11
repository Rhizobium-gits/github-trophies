// 🐱 Standalone SVG generator for GitHub Actions
// Reads config.json, fetches stats, writes stats.svg

const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf8"));
const username = config.username;
const theme = config.theme || "noir";

if (!username) {
  console.error("Error: username not set in config.json");
  process.exit(1);
}

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("Error: GITHUB_TOKEN not set. Add GH_TOKEN secret to your repo.");
  process.exit(1);
}

const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${TOKEN}` };

async function fetchJSON(url, h = headers) {
  const res = await fetch(url, { headers: h });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

async function fetchAllPages(url) {
  const results = [];
  for (let p = 1; ; p++) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${sep}per_page=100&page=${p}`, { headers });
    if (!res.ok) break;
    const batch = await res.json();
    if (!batch.length) break;
    results.push(...batch);
  }
  return results;
}

// 🐱 Same rank calculation as the API route
function expCdf(x, median) { return 1 - Math.exp(-Math.LN2 / median * x); }
function logNormCdf(x, median) {
  if (x <= 0) return 0;
  const z = (Math.log(x) - Math.log(median)) / 1.0;
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const poly = t * (a[0] + t * (a[1] + t * (a[2] + t * (a[3] + t * a[4]))));
  const cdf = 1 - poly * Math.exp(-z * z / 2);
  return z >= 0 ? cdf : 1 - cdf;
}

function calcRank(commits, prs, issues, stars, followers) {
  const W = { c: 3, p: 3, i: 2, s: 1, f: 1 }, TW = 10;
  const M = { c: 250, p: 40, i: 20, s: 50, f: 10 };
  const pct = (1 - (expCdf(commits, M.c) * W.c + expCdf(prs, M.p) * W.p + expCdf(issues, M.i) * W.i + logNormCdf(stars, M.s) * W.s + logNormCdf(followers, M.f) * W.f) / TW) * 100;
  const tiers = [[1, "S"], [12.5, "A+"], [25, "A"], [37.5, "A-"], [50, "B+"], [62.5, "B"], [75, "B-"], [87.5, "C+"], [100, "C"]];
  for (const [max, rank] of tiers) { if (pct <= max) return { rank, score: Math.round(100 - pct) }; }
  return { rank: "C", score: 0 };
}

// 🐱 Fetch avatar as base64
async function fetchAvatar(url) {
  try {
    const res = await fetch(`${url}&s=96`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${res.headers.get("content-type") || "image/png"};base64,${buf.toString("base64")}`;
  } catch { return null; }
}

// 🐱 Fetch contributions via GraphQL
async function fetchContributions(username) {
  try {
    const query = `query{user(login:"${username}"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST", headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;
    const weeks = cal.weeks.map(w => {
      const total = w.contributionDays.reduce((s, d) => s + d.contributionCount, 0);
      const m = w.contributionDays[0]?.date ? new Date(w.contributionDays[0].date).getMonth() + 1 : 0;
      return { total, month: `${m}` };
    });
    return { weeks, totalContributions: cal.totalContributions };
  } catch { return null; }
}

// 🐱 Theme definitions (same as API route)
function T(bg1,bg2,stk,ttl,sub,lbl,val,sec,dot,dv,dl,bar,rcBg,rcTk,rcArc,rcTx,avS,lgT,lgS,dnC) {
  return {bgGrad1:bg1,bgGrad2:bg2,stroke:stk,title:ttl,subtitle:sub,label:lbl,value:val,sectionLabel:sec,dot,divider:dv,dashLine:dl,bar,rankCircleBg:rcBg,rankCircleTrack:rcTk,rankCircleArc:rcArc,rankText:rcTx,avatarStroke:avS,legendText:lgT,legendSub:lgS,donutCenter:dnC};
}
const THEMES = {
  noir:T("#111","#0a0a0a","#2a2a2a","#fff","#555","#888","#eee","#555","#444","#1e1e1e","#1a1a1a","#fff","#151515","#222","#fff","#fff","#333","#bbb","#555","#fff"),
  dracula:T("#282a36","#21222c","#44475a","#f8f8f2","#6272a4","#bd93f9","#f8f8f2","#6272a4","#44475a","#44475a","#44475a","#bd93f9","#2c2e3a","#44475a","#ff79c6","#f8f8f2","#44475a","#f8f8f2","#6272a4","#f8f8f2"),
  "one-dark":T("#282c34","#21252b","#3e4451","#abb2bf","#5c6370","#828997","#e5c07b","#5c6370","#4b5263","#3e4451","#3e4451","#61afef","#2c313a","#3e4451","#61afef","#abb2bf","#3e4451","#abb2bf","#5c6370","#abb2bf"),
  "tokyo-night":T("#1a1b26","#16161e","#292e42","#c0caf5","#565f89","#7aa2f7","#c0caf5","#565f89","#3b4261","#292e42","#292e42","#7aa2f7","#1e1f2e","#292e42","#bb9af7","#c0caf5","#292e42","#a9b1d6","#565f89","#c0caf5"),
  nord:T("#2e3440","#282e3a","#3b4252","#eceff4","#7b88a0","#8a95aa","#d8dee9","#6a7585","#5a6577","#3b4252","#3b4252","#88c0d0","#333a48","#434c5e","#88c0d0","#d8dee9","#434c5e","#b0bcc8","#6a7585","#d8dee9"),
  "github-dark":T("#0d1117","#010409","#30363d","#e6edf3","#7d8590","#7d8590","#e6edf3","#484f58","#484f58","#21262d","#21262d","#58a6ff","#161b22","#30363d","#58a6ff","#e6edf3","#30363d","#c9d1d9","#484f58","#e6edf3"),
  light:T("#fff","#f8f8f8","#e0e0e0","#111","#888","#666","#111","#999","#bbb","#eee","#eee","#333","#f0f0f0","#ddd","#111","#111","#ddd","#444","#999","#111"),
  "github-light":T("#fff","#f6f8fa","#d0d7de","#1f2328","#656d76","#656d76","#1f2328","#8c959f","#8c959f","#d8dee4","#d8dee4","#0969da","#f6f8fa","#d0d7de","#0969da","#1f2328","#d0d7de","#1f2328","#656d76","#1f2328"),
};
// Add more themes as aliases
const more = { monokai:"noir",catppuccin:"dracula","gruvbox-dark":"nord","solarized-dark":"nord",synthwave:"dracula",cobalt:"github-dark",ayu:"noir","material-ocean":"dracula",rose:"dracula","night-owl":"github-dark",palenight:"dracula","shades-of-purple":"dracula",panda:"noir",horizon:"dracula",vitesse:"noir",everforest:"nord",kanagawa:"tokyo-night",fleet:"noir","solarized-light":"light","gruvbox-light":"light","catppuccin-latte":"github-light","light-owl":"light","everforest-light":"light","vitesse-light":"light" };
for (const [k, v] of Object.entries(more)) { if (!THEMES[k]) THEMES[k] = THEMES[v]; }

const F = "system-ui, -apple-system, sans-serif";
const M2 = "ui-monospace, SFMono-Regular, monospace";

function esc(s) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

// 🐱 Language colors
const LANG_COLORS = {
  Python:"#3572A5",JavaScript:"#f1e05a",TypeScript:"#3178c6",HTML:"#e34c26",CSS:"#1572B6",
  Shell:"#89e051",R:"#276DC3","Jupyter Notebook":"#F37626",Go:"#00ADD8",Rust:"#dea584",
  Java:"#ED8B00",C:"#A8B9CC","C++":"#00599C","C#":"#178600",Ruby:"#CC342D",PHP:"#777BB4",
  Swift:"#F05138",Kotlin:"#7F52FF",Dart:"#0175C2",Lua:"#2C2D72",TeX:"#3D6117",
  "Common Lisp":"#3fb68b",Gnuplot:"#f0c040",Batchfile:"#C1F12E",PowerShell:"#012456",
  SCSS:"#CD6799",Dockerfile:"#2496ED",Makefile:"#427819",Vim:"#199f4b",
  "Emacs Lisp":"#7F5AB6",Nix:"#7EBAE4",Svelte:"#ff3e00",
};

async function main() {
  console.log(`Generating stats for @${username} with theme "${theme}"...`);

  // Fetch user
  const user = await fetchJSON(`https://api.github.com/users/${username}`);

  // Fetch repos
  const repos = await fetchAllPages(`https://api.github.com/users/${username}/repos?type=owner`);
  const nonFork = repos.filter(r => !r.fork);

  // Stars
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  // Languages (byte count)
  const languages = {};
  await Promise.all(nonFork.map(async (repo) => {
    try {
      const data = await fetchJSON(`https://api.github.com/repos/${repo.full_name}/languages`);
      for (const [lang, bytes] of Object.entries(data)) languages[lang] = (languages[lang] || 0) + bytes;
    } catch {}
  }));

  // Commits, PRs, Issues
  let commits = 0, pullRequests = 0, issues = 0;
  try { commits = (await fetchJSON(`https://api.github.com/search/commits?q=author:${username}`, { ...headers, Accept: "application/vnd.github.cloak-preview+json" })).total_count || 0; } catch {}
  try { pullRequests = (await fetchJSON(`https://api.github.com/search/issues?q=author:${username}+type:pr`)).total_count || 0; } catch {}
  try { issues = (await fetchJSON(`https://api.github.com/search/issues?q=author:${username}+type:issue`)).total_count || 0; } catch {}

  const experience = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const { rank, score } = calcRank(commits, pullRequests, issues, stars, user.followers);

  // Avatar
  const avatar = await fetchAvatar(user.avatar_url);

  // Contributions
  const activity = await fetchContributions(username);

  // Language processing
  const langAll = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const langTotal = langAll.reduce((s, [, c]) => s + c, 0);
  const langSorted = langAll.filter(([, c]) => langTotal > 0 && (c / langTotal) >= 0.001);

  const t = THEMES[theme] || THEMES.noir;
  const W = 480, pad = 28, contentW = W - pad * 2;

  // Height
  const headerH = 64, div = 20, statsH = 132;
  const hasAct = !!activity;
  const actLabelH = hasAct ? 20 : 0, actGraphH = hasAct ? 30 : 0;
  const actTotalH = actLabelH + actGraphH, actDiv = hasAct ? 20 : 0;
  const langRows = Math.ceil(langSorted.length / 2);
  const donutH = langSorted.length > 0 ? 80 : 0;
  const langLegH = langRows * 24;
  const langSectionH = langSorted.length > 0 ? 24 + Math.max(donutH, langLegH) : 0;
  const H = pad + headerH + div + statsH + div + actTotalH + actDiv + langSectionH + pad;

  const statItems = [
    { label: "Total Commits", value: commits.toLocaleString() },
    { label: "Pull Requests", value: pullRequests.toLocaleString() },
    { label: "Issues", value: issues.toLocaleString() },
    { label: "Stars Earned", value: stars.toLocaleString() },
    { label: "Repositories", value: user.public_repos.toLocaleString() },
    { label: "Experience", value: `${experience} yr` },
  ];

  // Build SVG
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bgGrad1}"/><stop offset="100%" stop-color="${t.bgGrad2}"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)" stroke="${t.stroke}" stroke-width="1"/>
`;
  let y = pad;

  // Avatar
  if (avatar) {
    o += `<clipPath id="avclip"><circle cx="${pad + 24}" cy="${y + 24}" r="24"/></clipPath>`;
    o += `<image x="${pad}" y="${y}" width="48" height="48" href="${avatar}" clip-path="url(#avclip)"/>`;
    o += `<circle cx="${pad + 24}" cy="${y + 24}" r="24" fill="none" stroke="${t.avatarStroke}" stroke-width="1.5"/>`;
  }
  const tx = avatar ? pad + 60 : pad;
  o += `<text x="${tx}" y="${y+20}" font-size="17" font-weight="700" fill="${t.title}" font-family="${F}">${esc(user.name || user.login)}</text>`;
  o += `<text x="${tx}" y="${y+38}" font-size="11" fill="${t.subtitle}" font-family="${F}">@${esc(user.login)}</text>`;
  if (user.bio) {
    const bio = user.bio.length > 44 ? user.bio.slice(0, 41) + "..." : user.bio;
    o += `<text x="${tx}" y="${y+54}" font-size="10" fill="${t.subtitle}" font-family="${F}" opacity="0.7">${esc(bio)}</text>`;
  }

  // Rank
  const cx = W - pad - 28, cy2 = y + 24, cr = 24;
  const circ = 2 * Math.PI * cr, dOff = circ - (score / 100) * circ;
  o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="2"/>`;
  o += `<circle cx="${cx}" cy="${cy2}" r="${cr}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dOff.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy2})" opacity="0.9"/>`;
  o += `<text x="${cx}" y="${cy2+1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;
  y += headerH;

  o += `<line x1="${pad}" y1="${y+10}" x2="${W-pad}" y2="${y+10}" stroke="${t.divider}" stroke-width="1"/>`;
  y += div;

  // Stats
  statItems.forEach((item, i) => {
    const iy = y + i * 22;
    o += `<circle cx="${pad+4}" cy="${iy+5}" r="2" fill="${t.dot}"/>`;
    o += `<text x="${pad+14}" y="${iy+9}" font-size="12" fill="${t.label}" font-family="${F}">${item.label}</text>`;
    o += `<line x1="${pad+130}" y1="${iy+6}" x2="${W-pad-70}" y2="${iy+6}" stroke="${t.dashLine}" stroke-width="1" stroke-dasharray="2,4"/>`;
    o += `<text x="${W-pad}" y="${iy+9}" text-anchor="end" font-size="13" font-weight="600" fill="${t.value}" font-family="${M2}">${item.value}</text>`;
  });
  y += statsH;

  o += `<line x1="${pad}" y1="${y+10}" x2="${W-pad}" y2="${y+10}" stroke="${t.divider}" stroke-width="1"/>`;
  y += div;

  // Contributions
  if (hasAct && activity) {
    o += `<text x="${pad}" y="${y+12}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">CONTRIBUTIONS</text>`;
    o += `<text x="${W-pad}" y="${y+12}" text-anchor="end" font-size="9" fill="${t.sectionLabel}" font-family="${M2}">${activity.totalContributions.toLocaleString()} in the last year</text>`;
    y += actLabelH;
    const wks = activity.weeks, gap = 1;
    const barW = (contentW - (wks.length - 1) * gap) / wks.length;
    const maxWk = Math.max(...wks.map(w => w.total), 1), barMaxH = 16;
    wks.forEach((wk, i) => {
      const bx = pad + i * (barW + gap);
      const bh = wk.total === 0 ? 1 : Math.max((wk.total / maxWk) * barMaxH, 2);
      const by = y + barMaxH - bh;
      const op = wk.total === 0 ? 0.08 : 0.25 + (wk.total / maxWk) * 0.75;
      o += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${Math.max(barW,1).toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${t.bar}" opacity="${op.toFixed(2)}"/>`;
    });
    y += barMaxH + 2;
    let lastMonth = "";
    const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    wks.forEach((wk, i) => {
      if (wk.month !== lastMonth && wk.month !== "0") {
        o += `<text x="${(pad + i * (barW + gap)).toFixed(1)}" y="${y+9}" font-size="7" fill="${t.sectionLabel}" font-family="${M2}">${months[parseInt(wk.month)]||""}</text>`;
        lastMonth = wk.month;
      }
    });
    y += 12;
    o += `<line x1="${pad}" y1="${y+10}" x2="${W-pad}" y2="${y+10}" stroke="${t.divider}" stroke-width="1"/>`;
    y += actDiv;
  }

  // Languages (donut + legend, no external icon fetch for simplicity)
  if (langSorted.length > 0) {
    o += `<text x="${pad}" y="${y+14}" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">MOST USED LANGUAGES</text>`;
    y += 24;
    const dCx = pad + 40, dCy = y + 40, dR = 32, dIR = 20;
    let sa = -90;
    langSorted.forEach(([lang, count]) => {
      const color = LANG_COLORS[lang] || "#555";
      const pct = count / langTotal, angle = pct * 360, ea = sa + angle;
      const sr = (sa * Math.PI) / 180, er = (ea * Math.PI) / 180;
      const x1 = dCx + dR * Math.cos(sr), y1 = dCy + dR * Math.sin(sr);
      const x2 = dCx + dR * Math.cos(er), y2 = dCy + dR * Math.sin(er);
      const ix1 = dCx + dIR * Math.cos(er), iy1 = dCy + dIR * Math.sin(er);
      const ix2 = dCx + dIR * Math.cos(sr), iy2 = dCy + dIR * Math.sin(sr);
      const la = angle > 180 ? 1 : 0;
      o += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${dR},${dR} 0 ${la},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${dIR},${dIR} 0 ${la},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${color}"/>`;
      sa = ea;
    });
    o += `<text x="${dCx}" y="${dCy+1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${t.donutCenter}" font-family="${M2}">${langSorted.length}</text>`;
    const legX = pad + 100, legW = contentW - 100;
    langSorted.forEach(([lang, count], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const lx = legX + col * (legW / 2), ly = y + 4 + row * 24;
      const pct = ((count / langTotal) * 100).toFixed(1);
      const color = LANG_COLORS[lang] || "#555";
      o += `<circle cx="${lx+5}" cy="${ly+9}" r="5" fill="${color}"/>`;
      o += `<text x="${lx+16}" y="${ly+13}" font-size="11" fill="${t.legendText}" font-family="${F}">${esc(lang)}</text>`;
      o += `<text x="${lx+legW/2-4}" y="${ly+13}" text-anchor="end" font-size="10" font-weight="600" fill="${t.legendSub}" font-family="${M2}">${pct}%</text>`;
    });
  }

  o += `</svg>`;

  const outPath = path.join(__dirname, "..", "stats.svg");
  fs.writeFileSync(outPath, o);
  console.log(`Done! Written to stats.svg (${(o.length / 1024).toFixed(1)} KB)`);
  console.log(`Rank: ${rank} | Commits: ${commits} | PRs: ${pullRequests} | Repos: ${user.public_repos}`);
}

main().catch(e => { console.error(e); process.exit(1); });
