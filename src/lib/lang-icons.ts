// 🐱 Language icons — devicons (primary) + Simple Icons (fallback)
// GitHub language name → [devicon name, simple-icons slug]

interface IconSource { devicon?: string; simple?: string }

const LANG_ICONS: Record<string, IconSource> = {
  // 🐱 Major languages
  Python:            { devicon: "python", simple: "python" },
  JavaScript:        { devicon: "javascript", simple: "javascript" },
  TypeScript:        { devicon: "typescript", simple: "typescript" },
  HTML:              { devicon: "html5", simple: "html5" },
  CSS:               { devicon: "css3", simple: "css3" },
  Shell:             { devicon: "bash", simple: "gnubash" },
  R:                 { devicon: "r", simple: "r" },
  "Jupyter Notebook":{ devicon: "jupyter", simple: "jupyter" },
  Go:                { devicon: "go", simple: "go" },
  Rust:              { devicon: "rust", simple: "rust" },
  Java:              { devicon: "java", simple: "openjdk" },
  C:                 { devicon: "c", simple: "c" },
  "C++":             { devicon: "cplusplus", simple: "cplusplus" },
  "C#":              { devicon: "csharp", simple: "csharp" },
  Ruby:              { devicon: "ruby", simple: "ruby" },
  PHP:               { devicon: "php", simple: "php" },
  Swift:             { devicon: "swift", simple: "swift" },
  Kotlin:            { devicon: "kotlin", simple: "kotlin" },
  Dart:              { devicon: "dart", simple: "dart" },
  Lua:               { devicon: "lua", simple: "lua" },
  Vue:               { devicon: "vuejs", simple: "vuedotjs" },
  Scala:             { devicon: "scala", simple: "scala" },
  Haskell:           { devicon: "haskell", simple: "haskell" },
  Perl:              { devicon: "perl", simple: "perl" },
  Elixir:            { devicon: "elixir", simple: "elixir" },
  Clojure:           { devicon: "clojure", simple: "clojure" },
  OCaml:             { devicon: "ocaml", simple: "ocaml" },
  Julia:             { devicon: "julia", simple: "julia" },
  Dockerfile:        { devicon: "docker", simple: "docker" },
  TeX:               { devicon: "latex", simple: "latex" },
  Svelte:            { devicon: "svelte", simple: "svelte" },
  Zig:               { devicon: "zig", simple: "zig" },
  "Emacs Lisp":      { devicon: "emacs", simple: "gnuemacs" },
  Vim:               { devicon: "vim", simple: "vim" },
  "Vim Script":      { devicon: "vim", simple: "vim" },
  SCSS:              { devicon: "sass", simple: "sass" },
  PowerShell:        { devicon: "powershell", simple: "powershell" },
  Groovy:            { devicon: "groovy", simple: "apachegroovy" },
  Erlang:            { devicon: "erlang", simple: "erlang" },
  Nix:               { devicon: "nixos", simple: "nixos" },
  // 🐱 Extended (devicon)
  "Objective-C":     { devicon: "objectivec" },
  "Objective-C++":   { devicon: "objectivec" },
  Fortran:           { devicon: "fortran", simple: "fortran" },
  MATLAB:            { devicon: "matlab" },
  COBOL:             { devicon: "cobol" },
  Crystal:           { devicon: "crystal", simple: "crystal" },
  Elm:               { devicon: "elm" },
  "F#":              { devicon: "fsharp" },
  CoffeeScript:      { devicon: "coffeescript", simple: "coffeescript" },
  Solidity:          { devicon: "solidity", simple: "solidity" },
  Prolog:            { devicon: "prolog" },
  PureScript:        { devicon: "purescript" },
  Nim:               { devicon: "nim", simple: "nim" },
  Racket:            { devicon: "racket", simple: "racket" },
  Vala:              { devicon: "vala" },
  ClojureScript:     { devicon: "clojurescript" },
  // 🐱 Markup & data
  Markdown:          { devicon: "markdown", simple: "markdown" },
  JSON:              { devicon: "json", simple: "json" },
  XML:               { devicon: "xml", simple: "xml" },
  YAML:              { devicon: "yaml", simple: "yaml" },
  CMake:             { devicon: "cmake", simple: "cmake" },
  // 🐱 Web/template
  Astro:             { devicon: "astro", simple: "astro" },
  Handlebars:        { devicon: "handlebars", simple: "handlebarsdotjs" },
  Pug:               { devicon: "pug", simple: "pug" },
  Less:              { devicon: "less", simple: "less" },
  Stylus:            { devicon: "stylus", simple: "stylus" },
  PostCSS:           { devicon: "postcss", simple: "postcss" },
  // 🐱 Shell variants
  Bash:              { devicon: "bash", simple: "gnubash" },
  Zsh:               { simple: "gnubash" },
  Fish:              { simple: "gnubash" },
  // 🐱 Simple Icons only (no devicon)
  "Common Lisp":     { simple: "commonlisp" },
  TOML:              { simple: "toml" },
  HCL:               { simple: "hcl" },
  Terraform:         { simple: "terraform" },
  Ada:               { simple: "ada" },
  D:                 { simple: "d" },
  WebAssembly:       { simple: "webassembly" },
  Wasm:              { simple: "webassembly" },
  Makefile:          { simple: "cmake" },
  // 🐱 Devicon only
  Pascal:            { devicon: "delphi" },
  GDScript:          { devicon: "godot" },
  Processing:        { devicon: "processing" },
  Arduino:           { devicon: "arduino" },
  AWK:               { devicon: "awk" },
  Gradle:            { devicon: "gradle", simple: "gradle" },
  Bazel:             { devicon: "bazel" },
  Delphi:            { devicon: "delphi" },
  "Visual Basic":    { devicon: "visualbasic" },
  APL:               { devicon: "apl" },
  // 🐱 Languages without devicon or simple-icons (will use badge fallback)
  Batchfile:         { simple: "windowsterminal" },  // no exact match, badge fallback
  Gnuplot:           {},  // no icon anywhere, badge fallback
};

// 🐱 Language brand colors
const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26",
  CSS: "#1572B6", Shell: "#89e051", R: "#276DC3", "Jupyter Notebook": "#F37626",
  Go: "#00ADD8", Rust: "#dea584", Java: "#ED8B00", C: "#A8B9CC", "C++": "#00599C",
  "C#": "#178600", Ruby: "#CC342D", PHP: "#777BB4", Swift: "#F05138",
  Kotlin: "#7F52FF", Dart: "#0175C2", Lua: "#2C2D72", Vue: "#4FC08D",
  Scala: "#c22d40", Haskell: "#5e5086", Perl: "#0298c3", Elixir: "#6e4a7e",
  Clojure: "#db5855", OCaml: "#3be133", Julia: "#a270ba", Dockerfile: "#2496ED",
  Makefile: "#427819", TeX: "#3D6117", Svelte: "#ff3e00", Zig: "#ec915c",
  "Emacs Lisp": "#7F5AB6", Vim: "#199f4b", "Vim Script": "#199f4b",
  SCSS: "#CD6799", PowerShell: "#012456", Groovy: "#4298b8", Erlang: "#B83998",
  Nix: "#7EBAE4", "Common Lisp": "#3fb68b", "F#": "#b845fc", Fortran: "#4d41b1",
  Assembly: "#6E4C13", MATLAB: "#e16737", "Objective-C": "#438eff",
  CoffeeScript: "#244776", Elm: "#60B5CC", Crystal: "#000100", Nim: "#FFE953",
  Racket: "#3c5caa", Solidity: "#AA6746", YAML: "#cb171e", Markdown: "#083fa1",
  JSON: "#292929", XML: "#0060ac", Less: "#1d365d", Stylus: "#ff6347",
  Astro: "#ff5a03", GDScript: "#355570", Arduino: "#00979D", Processing: "#0096D8",
  Wasm: "#654FF0", WebAssembly: "#654FF0", D: "#BA595E", Ada: "#02f88c",
  Pascal: "#E3F171", Scheme: "#1e4aec", Tcl: "#e4cc98", Raku: "#0000fb",
  PureScript: "#1D222D", HCL: "#844FBA", TOML: "#9c4221", Terraform: "#7B42BC",
  ClojureScript: "#db5855", COBOL: "#234",
  Gnuplot: "#f0c040", Batchfile: "#C1F12E",
};

// 🐱 Abbreviations for badge fallback
const LANG_SHORT: Record<string, string> = {
  "Common Lisp": "CL", Scheme: "Sc", Assembly: "As", TOML: "Tm",
  HCL: "HC", Makefile: "Mk", VHDL: "VH", SystemVerilog: "SV",
  Tcl: "Tc", Hack: "Hk", Starlark: "St", Cython: "Cy",
  Jsonnet: "Jn", Dhall: "Dh", D: "D", Ada: "Ad",
  Batchfile: "Bt", Wasm: "Wa", WebAssembly: "Wa", GLSL: "GL",
  Cuda: "Cu", Raku: "Rk", GDScript: "GD", CMake: "CM", Gnuplot: "Gp",
  Shell: "Sh", R: "R", C: "C", Go: "Go", "C++": "++",
  "C#": "C#", "F#": "F#", OCaml: "ML",
};

function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

// 🐱 SVG cache
interface SvgData { defs: string; body: string; viewBox: string }
const svgCache = new Map<string, SvgData | null>();
let idCounter = 0;

function uniquifyIds(text: string, prefix: string): string {
  const ids = new Set<string>();
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

function processSvgText(text: string): SvgData {
  const prefix = `li${idCounter++}`;
  text = uniquifyIds(text, prefix);

  const vbMatch = text.match(/viewBox="([^"]*)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 24 24";

  const innerMatch = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  let inner = innerMatch ? innerMatch[1] : "";
  inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
  inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");

  let defs = "";
  inner = inner.replace(/<defs>([\s\S]*?)<\/defs>/gi, (_, d) => { defs += d; return ""; });
  inner = inner.replace(/(<(?:linearGradient|radialGradient|clipPath)[^>]*>[\s\S]*?<\/(?:linearGradient|radialGradient|clipPath)>)/gi, (m) => { defs += m; return ""; });

  return { defs, body: inner.trim(), viewBox };
}

async function fetchAndProcess(lang: string): Promise<SvgData | null> {
  if (svgCache.has(lang)) return svgCache.get(lang) || null;

  const src = LANG_ICONS[lang];
  if (!src) { svgCache.set(lang, null); return null; }

  // 🐱 Try devicon first (-original, then -plain)
  if (src.devicon) {
    const base = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${src.devicon}/${src.devicon}`;
    for (const variant of ["-original.svg", "-plain.svg"]) {
      try {
        const res = await fetch(base + variant);
        if (res.ok) {
          const data = processSvgText(await res.text());
          if (data.body) { svgCache.set(lang, data); return data; }
        }
      } catch {}
    }
  }

  // 🐱 Fallback to Simple Icons
  if (src.simple) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${src.simple}.svg`);
      if (res.ok) {
        let text = await res.text();
        // 🐱 Simple Icons are monochrome — colorize with language color
        const color = LANG_COLORS[lang] || "#888";
        text = text.replace(/<svg/, `<svg fill="${color}"`);
        const data = processSvgText(text);
        if (data.body) { svgCache.set(lang, data); return data; }
      }
    } catch {}
  }

  svgCache.set(lang, null);
  return null;
}

export async function prefetchIcons(langs: string[]): Promise<void> {
  await Promise.all(langs.map(l => fetchAndProcess(l)));
}

export function getAllDefs(): string {
  let defs = "";
  svgCache.forEach(data => { if (data) defs += data.defs; });
  return defs;
}

export function langIcon(x: number, y: number, lang: string, size: number = 18): string {
  const data = svgCache.get(lang);
  if (data && data.body) {
    const vb = data.viewBox.split(/\s+/).map(Number);
    const scale = size / Math.max(vb[2] || 128, vb[3] || 128);
    return `<g transform="translate(${x},${y}) scale(${scale.toFixed(4)})">${data.body}</g>`;
  }
  // 🐱 Fallback: styled badge
  const color = LANG_COLORS[lang] || "#555";
  const short = LANG_SHORT[lang] || lang.slice(0, 2);
  const textColor = isLightColor(color) ? "#000" : "#fff";
  const fontSize = short.length > 2 ? 7 : 8;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${color}"/><text x="${x + size / 2}" y="${y + size / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="700" fill="${textColor}" font-family="ui-monospace, SFMono-Regular, monospace">${short}</text>`;
}

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || "#555";
}
