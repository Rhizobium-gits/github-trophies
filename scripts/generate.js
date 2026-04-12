// 🐱 Standalone SVG generator for GitHub Actions
// Reads config.json, fetches stats, writes stats.svg

const fs = require("fs");
const path = require("path");

// 🐱 Language icon mappings (devicon name, simple-icons slug)
const LANG_ICON_MAP = {
  Python:["python","python"],JavaScript:["javascript","javascript"],TypeScript:["typescript","typescript"],
  HTML:["html5","html5"],CSS:["css3","css3"],Shell:["bash","gnubash"],R:["r","r"],
  "Jupyter Notebook":["jupyter","jupyter"],Go:["go","go"],Rust:["rust","rust"],
  Java:["java","openjdk"],C:["c","c"],"C++":["cplusplus","cplusplus"],"C#":["csharp","csharp"],
  Ruby:["ruby","ruby"],PHP:["php","php"],Swift:["swift","swift"],Kotlin:["kotlin","kotlin"],
  Dart:["dart","dart"],Lua:["lua","lua"],Vue:["vuejs","vuedotjs"],Scala:["scala","scala"],
  Haskell:["haskell","haskell"],Perl:["perl","perl"],Elixir:["elixir","elixir"],
  Clojure:["clojure","clojure"],OCaml:["ocaml","ocaml"],Julia:["julia","julia"],
  Dockerfile:["docker","docker"],TeX:["latex","latex"],Svelte:["svelte","svelte"],
  Zig:["zig","zig"],"Emacs Lisp":["emacs","gnuemacs"],Vim:["vim","vim"],
  SCSS:["sass","sass"],PowerShell:["powershell",null],Groovy:["groovy","apachegroovy"],
  Erlang:["erlang","erlang"],Nix:["nixos","nixos"],Fortran:["fortran","fortran"],
  MATLAB:["matlab",null],Elm:["elm",null],"F#":["fsharp",null],
  CoffeeScript:["coffeescript","coffeescript"],Nim:["nim","nim"],Racket:["racket","racket"],
  "Common Lisp":[null,"commonlisp"],TOML:[null,"toml"],HCL:[null,"hcl"],
  Ada:[null,"ada"],D:[null,"d"],WebAssembly:[null,"webassembly"],
  Markdown:["markdown","markdown"],JSON:["json","json"],XML:["xml","xml"],YAML:["yaml","yaml"],
};

// 🐱 Language icon cache and fetch
const iconCache = new Map();
let iconIdCounter = 0;

function uniquifyIds(text, prefix) {
  const ids = new Set();
  let m;
  const re = /id="([^"]*)"/g;
  while ((m = re.exec(text)) !== null) ids.add(m[1]);
  let result = text;
  ids.forEach(id => {
    const uid = `${prefix}_${id}`;
    result = result.replace(new RegExp(`id="${id}"`, 'g'), `id="${uid}"`);
    result = result.replace(new RegExp(`url\\(#${id}\\)`, 'g'), `url(#${uid})`);
    result = result.replace(new RegExp(`href="#${id}"`, 'g'), `href="#${uid}"`);
    result = result.replace(new RegExp(`xlink:href="#${id}"`, 'g'), `xlink:href="#${uid}"`);
  });
  return result;
}

function processSvg(text) {
  const prefix = `li${iconIdCounter++}`;
  text = uniquifyIds(text, prefix);
  const vbMatch = text.match(/viewBox="([^"]*)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";
  const innerMatch = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  let inner = innerMatch ? innerMatch[1] : "";
  inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
  inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");
  let defs = "";
  inner = inner.replace(/<defs>([\s\S]*?)<\/defs>/gi, (_, d) => { defs += d; return ""; });
  inner = inner.replace(/(<(?:linearGradient|radialGradient|clipPath)[^>]*>[\s\S]*?<\/(?:linearGradient|radialGradient|clipPath)>)/gi, (m2) => { defs += m2; return ""; });
  return { defs, body: inner.trim(), viewBox };
}

async function fetchLangIcon(lang) {
  if (iconCache.has(lang)) return iconCache.get(lang);
  const mapping = LANG_ICON_MAP[lang];
  if (!mapping) { iconCache.set(lang, null); return null; }
  const [devicon, simple] = mapping;
  // Try devicon
  if (devicon) {
    for (const variant of ["-original.svg", "-plain.svg"]) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/devicons/devicon/master/icons/${devicon}/${devicon}${variant}`);
        if (res.ok) { const data = processSvg(await res.text()); if (data.body) { iconCache.set(lang, data); return data; } }
      } catch {}
    }
  }
  // Try Simple Icons
  if (simple) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${simple}.svg`);
      if (res.ok) {
        let text = await res.text();
        const color = LANG_COLORS[lang] || "#888";
        text = text.replace(/<svg/, `<svg fill="${color}"`);
        const data = processSvg(text);
        if (data.body) { iconCache.set(lang, data); return data; }
      }
    } catch {}
  }
  iconCache.set(lang, null);
  return null;
}

async function prefetchAllIcons(langs) {
  await Promise.all(langs.map(l => fetchLangIcon(l)));
}

function getAllIconDefs() {
  let defs = "";
  iconCache.forEach(data => { if (data) defs += data.defs; });
  return defs;
}

function renderLangIcon(x, y, lang, size) {
  const data = iconCache.get(lang);
  if (data && data.body) {
    const vb = data.viewBox.split(/\s+/).map(Number);
    const scale = size / Math.max(vb[2] || 128, vb[3] || 128);
    return `<g transform="translate(${x},${y}) scale(${scale.toFixed(4)})">${data.body}</g>`;
  }
  // Fallback: colored circle
  return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${LANG_COLORS[lang] || "#555"}"/>`;
}

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf8"));
const username = config.username;
const layout = config.layout || [
  { type: "header", width: "full" },
  { type: "stats", width: "full" },
  { type: "contributions", width: "full" },
  { type: "languages", width: "full" },
];

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
  const W = { c: 2, p: 3, i: 1, s: 4, f: 1 }, TW = 11;
  const M = { c: 250, p: 50, i: 25, s: 50, f: 10 };
  const pct = (1 - (expCdf(commits, M.c) * W.c + expCdf(prs, M.p) * W.p + expCdf(issues, M.i) * W.i + logNormCdf(stars, M.s) * W.s + logNormCdf(followers, M.f) * W.f) / TW) * 100;
  const tiers = [[0.5, "S+"], [1, "S"], [12.5, "A+"], [25, "A"], [37.5, "A-"], [50, "B+"], [62.5, "B"], [75, "B-"], [87.5, "C+"], [100, "C"]];
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
    const days = cal.weeks.flatMap(w => w.contributionDays.map(d => ({ count: d.contributionCount, date: d.date })));
    return { days, totalContributions: cal.totalContributions };
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
  monokai:T("#272822","#1e1f1c","#49483e","#f8f8f2","#75715e","#a6e22e","#f8f8f2","#75715e","#49483e","#49483e","#49483e","#f92672","#2d2e27","#49483e","#f92672","#f8f8f2","#49483e","#e6db74","#75715e","#f8f8f2"),
  "tokyo-night":T("#1a1b26","#16161e","#292e42","#c0caf5","#565f89","#7aa2f7","#c0caf5","#565f89","#3b4261","#292e42","#292e42","#7aa2f7","#1e1f2e","#292e42","#bb9af7","#c0caf5","#292e42","#a9b1d6","#565f89","#c0caf5"),
  nord:T("#2e3440","#282e3a","#3b4252","#eceff4","#7b88a0","#8a95aa","#d8dee9","#6a7585","#5a6577","#3b4252","#3b4252","#88c0d0","#333a48","#434c5e","#88c0d0","#d8dee9","#434c5e","#b0bcc8","#6a7585","#d8dee9"),
  "github-dark":T("#0d1117","#010409","#30363d","#e6edf3","#7d8590","#7d8590","#e6edf3","#484f58","#484f58","#21262d","#21262d","#58a6ff","#161b22","#30363d","#58a6ff","#e6edf3","#30363d","#c9d1d9","#484f58","#e6edf3"),
  catppuccin:T("#1e1e2e","#181825","#313244","#cdd6f4","#6c7086","#a6adc8","#cdd6f4","#585b70","#45475a","#313244","#313244","#cba6f7","#24243a","#313244","#cba6f7","#cdd6f4","#313244","#bac2de","#585b70","#cdd6f4"),
  "gruvbox-dark":T("#282828","#1d2021","#3c3836","#ebdbb2","#928374","#a89984","#ebdbb2","#7c6f64","#665c54","#3c3836","#3c3836","#b8bb26","#32302f","#3c3836","#fabd2f","#ebdbb2","#3c3836","#d5c4a1","#7c6f64","#ebdbb2"),
  "solarized-dark":T("#002b36","#001e26","#073642","#839496","#586e75","#657b83","#93a1a1","#586e75","#586e75","#073642","#073642","#268bd2","#003440","#073642","#b58900","#93a1a1","#073642","#839496","#586e75","#93a1a1"),
  synthwave:T("#1a1028","#150d22","#2d1f4e","#f0e0ff","#8a6aaa","#c8a0e8","#f0d0ff","#7a5a9a","#5a3d7a","#2d1f4e","#2d1f4e","#ff6eee","#201430","#2d1f4e","#ff6eee","#f0d0ff","#2d1f4e","#d0b0e8","#8a6aaa","#f0d0ff"),
  cobalt:T("#193549","#132d3f","#1f4662","#e1efff","#4a7da8","#6a9ec8","#fff","#4a7da8","#2d5a80","#1f4662","#1f4662","#ffc600","#1a3a50","#1f4662","#ffc600","#fff","#1f4662","#c8e4ff","#4a7da8","#fff"),
  ayu:T("#0b0e14","#0a0d12","#11151c","#bfbdb6","#565b66","#6c7380","#e6e1cf","#565b66","#3d424d","#11151c","#11151c","#e6b450","#0d1018","#11151c","#e6b450","#e6e1cf","#11151c","#acb6bf","#565b66","#e6e1cf"),
  "material-ocean":T("#0f111a","#0b0d14","#1f2233","#a6accd","#4e5579","#717cb4","#a6accd","#4e5579","#3b3f5c","#1f2233","#1f2233","#c792ea","#131520","#1f2233","#c792ea","#a6accd","#1f2233","#a6accd","#4e5579","#a6accd"),
  rose:T("#1e0a14","#180810","#4a1a30","#ffe0ee","#aa4a70","#cc6a90","#ffc8dd","#aa4a70","#8a3a5a","#3a1228","#3a1228","#f472b6","#240e18","#4a1a30","#f472b6","#ffc8dd","#4a1a30","#e090b8","#aa4a70","#ffc8dd"),
  "night-owl":T("#011627","#010e1a","#1d3b53","#d6deeb","#5f7e97","#7fdbca","#d6deeb","#5f7e97","#456075","#1d3b53","#1d3b53","#82aaff","#0b2942","#1d3b53","#c792ea","#d6deeb","#1d3b53","#d6deeb","#5f7e97","#d6deeb"),
  palenight:T("#292d3e","#242837","#3a3f58","#a6accd","#676e95","#c3e88d","#a6accd","#676e95","#4e5579","#3a3f58","#3a3f58","#c792ea","#2f3347","#3a3f58","#82aaff","#a6accd","#3a3f58","#a6accd","#676e95","#a6accd"),
  "shades-of-purple":T("#2d2b55","#261f4e","#4d21fc","#fad000","#a599e9","#fad000","#fff","#a599e9","#6943ff","#4d21fc","#4d21fc","#ff7200","#332f62","#4d21fc","#ff7200","#fff","#4d21fc","#fad000","#a599e9","#fff"),
  panda:T("#292a2b","#252627","#3e4042","#e6e6e6","#757575","#b4b4b4","#e6e6e6","#757575","#535455","#3e4042","#3e4042","#19f9d8","#2e3032","#3e4042","#ff75b5","#e6e6e6","#3e4042","#e6e6e6","#757575","#e6e6e6"),
  horizon:T("#1c1e26","#181a21","#2e303e","#d5d8da","#6c6f93","#e95678","#d5d8da","#6c6f93","#4e5166","#2e303e","#2e303e","#e95678","#232530","#2e303e","#fab795","#d5d8da","#2e303e","#d5d8da","#6c6f93","#d5d8da"),
  vitesse:T("#121212","#0e0e0e","#282828","#dbd7ca","#555","#4d9375","#dbd7ca","#555","#393939","#282828","#282828","#80a665","#1a1a1a","#282828","#80a665","#dbd7ca","#282828","#dbd7ca","#555","#dbd7ca"),
  everforest:T("#2d353b","#272e33","#3d484d","#d3c6aa","#859289","#a7c080","#d3c6aa","#859289","#4f5b58","#3d484d","#3d484d","#a7c080","#323c41","#3d484d","#dbbc7f","#d3c6aa","#3d484d","#d3c6aa","#859289","#d3c6aa"),
  kanagawa:T("#1f1f28","#1a1a22","#2a2a37","#dcd7ba","#727169","#7e9cd8","#dcd7ba","#727169","#54546d","#2a2a37","#2a2a37","#7fb4ca","#252535","#2a2a37","#e6c384","#dcd7ba","#2a2a37","#dcd7ba","#727169","#dcd7ba"),
  fleet:T("#181818","#141414","#2a2a2a","#c4c4c4","#666","#87c3ff","#c4c4c4","#666","#444","#2a2a2a","#2a2a2a","#87c3ff","#1e1e1e","#2a2a2a","#87c3ff","#c4c4c4","#2a2a2a","#c4c4c4","#666","#c4c4c4"),
  light:T("#fff","#f8f8f8","#e0e0e0","#111","#888","#666","#111","#999","#bbb","#eee","#eee","#333","#f0f0f0","#ddd","#111","#111","#ddd","#444","#999","#111"),
  "github-light":T("#fff","#f6f8fa","#d0d7de","#1f2328","#656d76","#656d76","#1f2328","#8c959f","#8c959f","#d8dee4","#d8dee4","#0969da","#f6f8fa","#d0d7de","#0969da","#1f2328","#d0d7de","#1f2328","#656d76","#1f2328"),
  "solarized-light":T("#fdf6e3","#f5efdc","#eee8d5","#657b83","#93a1a1","#839496","#586e75","#93a1a1","#93a1a1","#eee8d5","#eee8d5","#268bd2","#eee8d5","#d6cdb8","#b58900","#586e75","#d6cdb8","#586e75","#93a1a1","#586e75"),
  "gruvbox-light":T("#fbf1c7","#f2e6be","#d5c4a1","#3c3836","#928374","#7c6f64","#3c3836","#a89984","#a89984","#d5c4a1","#d5c4a1","#b57614","#ebdbb2","#d5c4a1","#b57614","#3c3836","#d5c4a1","#504945","#928374","#3c3836"),
  "catppuccin-latte":T("#eff1f5","#e6e9ef","#ccd0da","#4c4f69","#8c8fa1","#7c7f93","#4c4f69","#9ca0b0","#9ca0b0","#ccd0da","#ccd0da","#8839ef","#e6e9ef","#bcc0cc","#8839ef","#4c4f69","#bcc0cc","#5c5f77","#8c8fa1","#4c4f69"),
  "light-owl":T("#fbfbfb","#f5f5f5","#e0e0e0","#403f53","#90a4ae","#2aa298","#403f53","#90a4ae","#b0bec5","#e0e0e0","#e0e0e0","#4876d6","#f0f0f0","#d6d6d6","#bc5454","#403f53","#d6d6d6","#403f53","#90a4ae","#403f53"),
  "everforest-light":T("#fdf6e3","#f4eed7","#e0dcc7","#5c6a72","#939f91","#8da101","#5c6a72","#a6b0a0","#a6b0a0","#e0dcc7","#e0dcc7","#8da101","#eee8d5","#d5cfba","#dfa000","#5c6a72","#d5cfba","#5c6a72","#939f91","#5c6a72"),
  "vitesse-light":T("#ffffff","#f7f7f7","#e5e5e5","#393a34","#999","#1e754f","#393a34","#999","#bbb","#e5e5e5","#e5e5e5","#1e754f","#f5f5f5","#ddd","#1e754f","#393a34","#ddd","#393a34","#999","#393a34"),
};

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
  console.log(`Generating stats for @${username} (all themes)...`);

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

  // Reviews + Contributed To via GraphQL
  let reviews = 0, contributedTo = 0;
  try {
    const query = `query{user(login:"${username}"){contributionsCollection{totalPullRequestReviewContributions} repositoriesContributedTo(first:0){totalCount}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST", headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (res.ok) {
      const d = await res.json();
      reviews = d?.data?.user?.contributionsCollection?.totalPullRequestReviewContributions || 0;
      contributedTo = d?.data?.user?.repositoriesContributedTo?.totalCount || 0;
    }
  } catch {}

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

  // 🐱 Prefetch language icons
  await prefetchAllIcons(langSorted.map(([l]) => l));

  // 🐱 Generate ALL themes
  const allThemeNames = Object.keys(THEMES);
  const outDir = path.join(__dirname, "..", "svg");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const theme of allThemeNames) {
  const t = THEMES[theme];
  const W = 480, pad = 28, contentW = W - pad * 2;

  const allStats = {
    "stat-commits": { label: "Total Commits", value: commits.toLocaleString() },
    "stat-prs": { label: "Pull Requests", value: pullRequests.toLocaleString() },
    "stat-reviews": { label: "Code Reviews", value: reviews.toLocaleString() },
    "stat-issues": { label: "Issues", value: issues.toLocaleString() },
    "stat-stars": { label: "Stars Earned", value: stars.toLocaleString() },
    "stat-repos": { label: "Repositories", value: user.public_repos.toLocaleString() },
    "stat-contributed": { label: "Contributed To", value: contributedTo.toLocaleString() },
    "stat-followers": { label: "Followers", value: user.followers.toLocaleString() },
    "stat-following": { label: "Following", value: user.following.toLocaleString() },
    "stat-experience": { label: "Experience", value: `${experience} yr` },
  };

  // 🐱 Widget renderers — each returns { svg, height }
  const widgets = {
    header(x, w) {
      let s = "";
      if (avatar) {
        s += `<clipPath id="avclip"><circle cx="${x + 24}" cy="${24}" r="24"/></clipPath>`;
        s += `<image x="${x}" y="0" width="48" height="48" href="${avatar}" clip-path="url(#avclip)"/>`;
        s += `<circle cx="${x + 24}" cy="24" r="24" fill="none" stroke="${t.avatarStroke}" stroke-width="1.5"/>`;
      }
      const tx2 = avatar ? x + 60 : x;
      s += `<text x="${tx2}" y="20" font-size="17" font-weight="700" fill="${t.title}" font-family="${F}">${esc(user.name || user.login)}</text>`;
      // 🐱 Rank circle at right end
      const rcx2 = w - 22, rcy2 = 20, cr3 = 22;
      const circ3 = 2 * Math.PI * cr3, dOff3 = circ3 - (score / 100) * circ3;
      s += `<circle cx="${rcx2}" cy="${rcy2}" r="${cr3}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="1.5"/>`;
      s += `<circle cx="${rcx2}" cy="${rcy2}" r="${cr3}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${circ3.toFixed(1)}" stroke-dashoffset="${dOff3.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${rcx2} ${rcy2})" opacity="0.9"/>`;
      s += `<text x="${rcx2}" y="${rcy2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;
      s += `<text x="${tx2}" y="38" font-size="11" fill="${t.subtitle}" font-family="${F}">@${esc(user.login)}</text>`;
      if (user.bio) {
        const bio = user.bio.length > 44 ? user.bio.slice(0, 41) + "..." : user.bio;
        s += `<text x="${tx2}" y="54" font-size="10" fill="${t.subtitle}" font-family="${F}" opacity="0.7">${esc(bio)}</text>`;
      }
      return { svg: s, height: 58 };
    },
    rank(x, w) {
      // Rank is now inline in header, this renders just the circle for standalone use
      const rcx = x + w / 2, rcy = 24, cr2 = 24;
      const circ2 = 2 * Math.PI * cr2, dOff2 = circ2 - (score / 100) * circ2;
      let s = `<circle cx="${rcx}" cy="${rcy}" r="${cr2}" fill="${t.rankCircleBg}" stroke="${t.rankCircleTrack}" stroke-width="2"/>`;
      s += `<circle cx="${rcx}" cy="${rcy}" r="${cr2}" fill="none" stroke="${t.rankCircleArc}" stroke-width="2.5" stroke-dasharray="${circ2.toFixed(1)}" stroke-dashoffset="${dOff2.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${rcx} ${rcy})" opacity="0.9"/>`;
      s += `<text x="${rcx}" y="${rcy + 1}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="${t.rankText}" font-family="${F}">${rank}</text>`;
      return { svg: s, height: 52 };
    },
    stats(x, w) {
      const items = Object.values(allStats);
      let s = "";
      items.forEach((item, i) => {
        const iy = i * 22;
        s += `<circle cx="${4}" cy="${iy + 5}" r="2" fill="${t.dot}"/>`;
        s += `<text x="14" y="${iy + 9}" font-size="12" fill="${t.label}" font-family="${F}">${item.label}</text>`;
        s += `<line x1="130" y1="${iy + 6}" x2="${w - 70}" y2="${iy + 6}" stroke="${t.dashLine}" stroke-width="1" stroke-dasharray="2,4"/>`;
        s += `<text x="${w}" y="${iy + 9}" text-anchor="end" font-size="13" font-weight="600" fill="${t.value}" font-family="${M2}">${item.value}</text>`;
      });
      return { svg: s, height: items.length * 22 };
    },
    contributions(x, w) {
      if (!activity) return { svg: "", height: 0 };
      let s = `<text x="0" y="12" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">CONTRIBUTIONS</text>`;
      s += `<text x="${w}" y="12" text-anchor="end" font-size="9" fill="${t.sectionLabel}" font-family="${M2}">${activity.totalContributions.toLocaleString()} in the last year</text>`;
      const rawDays2 = activity.days;
      const pts2 = [];
      for (let i = 0; i < rawDays2.length; i += 3) {
        let sum2 = 0;
        for (let j = i; j < i + 3 && j < rawDays2.length; j++) sum2 += rawDays2[j].count;
        pts2.push({ total: sum2, date: rawDays2[i].date });
      }
      const graphH = 40, yOff = 20;
      const maxPt2 = Math.max(...pts2.map(p2 => p2.total), 1);
      const stepX = w / (pts2.length - 1);
      const points = pts2.map((p2, i) => `${(i * stepX).toFixed(1)},${(yOff + graphH - (p2.total / maxPt2) * graphH).toFixed(1)}`);
      const areaPoints = [`0,${yOff + graphH}`, ...points, `${w},${yOff + graphH}`].join(" ");
      s += `<polygon points="${areaPoints}" fill="${t.rankCircleArc}" opacity="0.06"/>`;
      s += `<polyline points="${points.join(" ")}" fill="none" stroke="${t.rankCircleArc}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" opacity="0.7"/>`;
      let lastMonth2 = "", my = yOff + graphH + 2;
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      pts2.forEach((p2, i) => {
        if (!p2.date) return;
        const mStr = monthNames[new Date(p2.date).getMonth()];
        if (mStr !== lastMonth2) {
          s += `<text x="${(i * stepX).toFixed(1)}" y="${my + 9}" font-size="7" fill="${t.sectionLabel}" font-family="${M2}">${mStr}</text>`;
          lastMonth2 = mStr;
        }
      });
      return { svg: s, height: my + 12 };
    },
    "languages-donut"(x, w) {
      if (!langSorted.length) return { svg: "", height: 0 };
      const dCx = 40, dCy = 40, dR = 32, dIR = 20;
      let s = "", sa2 = -90;
      langSorted.forEach(([lang2, count2]) => {
        const color2 = LANG_COLORS[lang2] || "#555";
        const pct2 = count2 / langTotal, angle2 = pct2 * 360, ea2 = sa2 + angle2;
        const sr2 = (sa2 * Math.PI) / 180, er2 = (ea2 * Math.PI) / 180;
        const x1 = dCx + dR * Math.cos(sr2), y1 = dCy + dR * Math.sin(sr2);
        const x2 = dCx + dR * Math.cos(er2), y2 = dCy + dR * Math.sin(er2);
        const ix1 = dCx + dIR * Math.cos(er2), iy1 = dCy + dIR * Math.sin(er2);
        const ix2 = dCx + dIR * Math.cos(sr2), iy2 = dCy + dIR * Math.sin(sr2);
        s += `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${dR},${dR} 0 ${angle2 > 180 ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${dIR},${dIR} 0 ${angle2 > 180 ? 1 : 0},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${color2}"/>`;
        sa2 = ea2;
      });
      s += `<text x="${dCx}" y="${dCy + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="${t.donutCenter}" font-family="${M2}">${langSorted.length}</text>`;
      return { svg: s, height: 80 };
    },
    "languages-list"(x, w) {
      if (!langSorted.length) return { svg: "", height: 0 };
      let s = "";
      langSorted.forEach(([lang2, count2], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const lx = col * (w / 2), ly = row * 24;
        const pct2 = ((count2 / langTotal) * 100).toFixed(1);
        s += renderLangIcon(lx, ly + 1, lang2, 18);
        s += `<text x="${lx + 24}" y="${ly + 13}" font-size="11" fill="${t.legendText}" font-family="${F}">${esc(lang2)}</text>`;
        s += `<text x="${lx + w / 2 - 4}" y="${ly + 13}" text-anchor="end" font-size="10" font-weight="600" fill="${t.legendSub}" font-family="${M2}">${pct2}%</text>`;
      });
      return { svg: s, height: Math.ceil(langSorted.length / 2) * 24 };
    },
    languages(x, w) {
      if (!langSorted.length) return { svg: "", height: 0 };
      let s = `<text x="0" y="14" font-size="10" font-weight="600" fill="${t.sectionLabel}" font-family="${F}" letter-spacing="1">MOST USED LANGUAGES</text>`;
      const donut = widgets["languages-donut"](0, w);
      const list = widgets["languages-list"](100, w - 100);
      s += `<g transform="translate(0,24)">${donut.svg}</g>`;
      s += `<g transform="translate(100,28)">${list.svg}</g>`;
      return { svg: s, height: 24 + Math.max(donut.height, list.height) };
    },
    divider(x, w) {
      return { svg: `<line x1="0" y1="5" x2="${w}" y2="5" stroke="${t.divider}" stroke-width="1"/>`, height: 10 };
    },
  };

  // 🐱 Individual stat widgets
  for (const [key, item] of Object.entries(allStats)) {
    widgets[key] = (x, w) => {
      let s = `<circle cx="4" cy="5" r="2" fill="${t.dot}"/>`;
      s += `<text x="14" y="9" font-size="12" fill="${t.label}" font-family="${F}">${item.label}</text>`;
      s += `<line x1="130" y1="6" x2="${w - 70}" y2="6" stroke="${t.dashLine}" stroke-width="1" stroke-dasharray="2,4"/>`;
      s += `<text x="${w}" y="9" text-anchor="end" font-size="13" font-weight="600" fill="${t.value}" font-family="${M2}">${item.value}</text>`;
      return { svg: s, height: 22 };
    };
  }

  // 🐱 Two-pass: calculate height, then render
  // Pass 1: measure heights
  let totalH = pad;
  const measured = [];
  let rowWidgets = [];

  for (const item of layout) {
    const widgetFn = widgets[item.type];
    if (!widgetFn) continue;
    const isHalf = item.width === "half";
    const w = isHalf ? Math.floor(contentW / 2) - 4 : contentW;
    const { height } = widgetFn(0, w);

    if (isHalf) {
      rowWidgets.push({ ...item, w, height });
      if (rowWidgets.length === 2) {
        totalH += Math.max(rowWidgets[0].height, rowWidgets[1].height) + 8;
        measured.push([...rowWidgets]);
        rowWidgets = [];
      }
    } else {
      if (rowWidgets.length) {
        totalH += rowWidgets[0].height + 8;
        measured.push([...rowWidgets]);
        rowWidgets = [];
      }
      measured.push([{ ...item, w, height }]);
      totalH += height + 8;
    }
  }
  if (rowWidgets.length) {
    totalH += rowWidgets[0].height + 8;
    measured.push([...rowWidgets]);
  }
  totalH += pad;

  // Pass 2: render
  let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${totalH}" viewBox="0 0 ${W} ${totalH}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bgGrad1}"/><stop offset="100%" stop-color="${t.bgGrad2}"/></linearGradient>${getAllIconDefs()}</defs>
<rect width="${W}" height="${totalH}" rx="14" fill="url(#bg)" stroke="${t.stroke}" stroke-width="1"/>
`;
  let y = pad;

  for (const row of measured) {
    if (row.length === 2) {
      const h1 = widgets[row[0].type](0, row[0].w);
      const h2 = widgets[row[1].type](0, row[1].w);
      o += `<g transform="translate(${pad},${y})">${h1.svg}</g>`;
      o += `<g transform="translate(${pad + row[0].w + 8},${y})">${h2.svg}</g>`;
      y += Math.max(row[0].height, row[1].height) + 8;
    } else {
      const h1 = widgets[row[0].type](0, row[0].w);
      o += `<g transform="translate(${pad},${y})">${h1.svg}</g>`;
      y += row[0].height + 8;
    }
  }

  o += `</svg>`;

  const outPath = path.join(outDir, `stats-${theme}.svg`);
  fs.writeFileSync(outPath, o);
  console.log(`  ${theme}: ${(o.length / 1024).toFixed(1)} KB`);
  } // end theme loop

  // 🐱 Also write default stats.svg (noir)
  const defaultSrc = path.join(outDir, "stats-noir.svg");
  if (fs.existsSync(defaultSrc)) {
    fs.copyFileSync(defaultSrc, path.join(outDir, "stats.svg"));
  }

  console.log(`Done! Generated ${allThemeNames.length} themes.`);
  console.log(`Rank: ${rank} | Commits: ${commits} | PRs: ${pullRequests} | Repos: ${user.public_repos}`);
}

main().catch(e => { console.error(e); process.exit(1); });
