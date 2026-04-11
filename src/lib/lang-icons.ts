// 🐱 Language icons from devicons — comprehensive mapping
// GitHub language name → devicon icon name

const LANG_TO_DEVICON: Record<string, string> = {
  // 🐱 Major languages
  Python: "python", JavaScript: "javascript", TypeScript: "typescript",
  HTML: "html5", CSS: "css3", Shell: "bash", R: "r",
  "Jupyter Notebook": "jupyter", Go: "go", Rust: "rust",
  Java: "java", C: "c", "C++": "cplusplus", "C#": "csharp",
  Ruby: "ruby", PHP: "php", Swift: "swift", Kotlin: "kotlin",
  Dart: "dart", Lua: "lua", Vue: "vuejs", Scala: "scala",
  Haskell: "haskell", Perl: "perl", Elixir: "elixir",
  Clojure: "clojure", OCaml: "ocaml", Julia: "julia",
  Dockerfile: "docker", TeX: "latex", Svelte: "svelte",
  Zig: "zig", "Emacs Lisp": "emacs", Vim: "vim",
  "Vim Script": "vim", SCSS: "sass", PowerShell: "powershell",
  Groovy: "groovy", Erlang: "erlang", Nix: "nixos",
  // 🐱 Extended — only exact devicon matches (no mismatched logos)
  "Objective-C": "objectivec", "Objective-C++": "objectivec",
  Fortran: "fortran", MATLAB: "matlab",
  COBOL: "cobol", Crystal: "crystal", Elm: "elm",
  "F#": "fsharp", CoffeeScript: "coffeescript", Solidity: "solidity",
  Prolog: "prolog", PureScript: "purescript",
  Nim: "nim", Racket: "racket", Vala: "vala",
  ClojureScript: "clojurescript",
  // 🐱 Markup & data — only exact matches
  Markdown: "markdown", JSON: "json", XML: "xml", YAML: "yaml",
  CMake: "cmake",
  // 🐱 Web/template
  Astro: "astro", Handlebars: "handlebars", Pug: "pug",
  Less: "less", Stylus: "stylus", PostCSS: "postcss",
  // 🐱 Shell variants
  Bash: "bash", Zsh: "bash", Fish: "bash",
  "Shell Script": "bash", ShellSession: "bash",
  // 🐱 Exact devicon matches only
  Pascal: "delphi", GDScript: "godot", Processing: "processing",
  Arduino: "arduino", AWK: "awk",
  Gradle: "gradle", Bazel: "bazel",
  Ceylon: "ceylon", Rexx: "rexx", APL: "apl",
  Delphi: "delphi", "Visual Basic": "visualbasic",
  Ballerina: "ballerina",
};

// 🐱 Language brand colors (GitHub linguist)
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
  Cuda: "#3A4E3A", Wasm: "#654FF0", Starlark: "#76d275", Cython: "#fedf5b",
  CMake: "#DA3434", Reason: "#ff5847", ReScript: "#E6484F", ClojureScript: "#db5855",
  D: "#BA595E", Ada: "#02f88c", Pascal: "#E3F171", Scheme: "#1e4aec",
  Tcl: "#e4cc98", Raku: "#0000fb", PureScript: "#1D222D", Hack: "#878787",
  Apex: "#1797c0", Prolog: "#74283c", COBOL: "#234", HCL: "#844FBA",
};

// 🐱 Cache for fetched SVG data
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

async function fetchAndProcess(lang: string): Promise<SvgData | null> {
  if (svgCache.has(lang)) return svgCache.get(lang) || null;

  const iconName = LANG_TO_DEVICON[lang];
  if (!iconName) { svgCache.set(lang, null); return null; }

  // 🐱 Try -original.svg first, then -plain.svg as fallback
  const urls = [
    `https://raw.githubusercontent.com/devicons/devicon/master/icons/${iconName}/${iconName}-original.svg`,
    `https://raw.githubusercontent.com/devicons/devicon/master/icons/${iconName}/${iconName}-plain.svg`,
  ];
  let text: string | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) { text = await res.text(); break; }
    } catch {}
  }
  if (!text) { svgCache.set(lang, null); return null; }

  try {

    const prefix = `li${idCounter++}`;
    text = uniquifyIds(text, prefix);

    const vbMatch = text.match(/viewBox="([^"]*)"/);
    const viewBox = vbMatch ? vbMatch[1] : "0 0 128 128";

    const innerMatch = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    let inner = innerMatch ? innerMatch[1] : "";
    inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
    inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");

    let defs = "";
    inner = inner.replace(/<defs>([\s\S]*?)<\/defs>/gi, (_, d) => { defs += d; return ""; });
    inner = inner.replace(/(<(?:linearGradient|radialGradient|clipPath)[^>]*>[\s\S]*?<\/(?:linearGradient|radialGradient|clipPath)>)/gi, (m) => { defs += m; return ""; });

    const data: SvgData = { defs, body: inner.trim(), viewBox };
    svgCache.set(lang, data);
    return data;
  } catch {
    svgCache.set(lang, null);
    return null;
  }
}

export async function prefetchIcons(langs: string[]): Promise<void> {
  await Promise.all(langs.map(l => fetchAndProcess(l)));
}

export function getAllDefs(): string {
  let defs = "";
  svgCache.forEach(data => { if (data) defs += data.defs; });
  return defs;
}

// 🐱 Abbreviations for fallback badges
const LANG_SHORT: Record<string, string> = {
  "Common Lisp": "CL", Scheme: "Sc", Assembly: "As", TOML: "Tm",
  HCL: "HC", Makefile: "Mk", VHDL: "VH", SystemVerilog: "SV",
  Tcl: "Tc", Hack: "Hk", Meson: "Me", Starlark: "St",
  Cython: "Cy", Jsonnet: "Jn", Dhall: "Dh", D: "D",
  Ada: "Ad", Batchfile: "Bt", Wasm: "Wa", WebAssembly: "Wa",
  GLSL: "GL", Cuda: "Cu", Raku: "Rk", "Objective-C++": "O+",
  Terraform: "Tf", Nix: "Nx", "Emacs Lisp": "EL",
  "Vim Script": "Vi", GDScript: "GD", ReScript: "Re",
  CMake: "CM", Gradle: "Gr", Bazel: "Bz",
  PowerShell: "Ps", Groovy: "Gy", Erlang: "Er",
  Shell: "Sh", Bash: "Sh", R: "R", C: "C", Go: "Go",
  Rust: "Rs", Lua: "Lu", Zig: "Zg", Nim: "Ni",
  Dart: "Da", PHP: "Ph", Ruby: "Rb", Perl: "Pl",
  Julia: "Jl", Scala: "Sc", Elm: "El", "F#": "F#",
  "C#": "C#", "C++": "++", OCaml: "ML", APL: "AP",
  COBOL: "CO", Crystal: "Cr", Fortran: "Fn", MATLAB: "Mt",
  Solidity: "So", Prolog: "Pr", PureScript: "PS",
  Haskell: "Hs", Racket: "Rk", Vala: "Va",
  CoffeeScript: "Cf", Clojure: "Cj", Swift: "Sw",
  Kotlin: "Kt", Java: "Jv", Python: "Py",
  JavaScript: "JS", TypeScript: "TS", HTML: "HT",
  CSS: "CS", Svelte: "Sv", Vue: "Vu",
  Markdown: "Md", JSON: "Js", XML: "Xm", YAML: "Ym",
  Dockerfile: "Dk", TeX: "Tx", Astro: "As",
  Less: "Le", Stylus: "St", PostCSS: "Pc",
  SCSS: "Ss", Handlebars: "Hb", Pug: "Pu",
};

function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function langIcon(x: number, y: number, lang: string, size: number = 18): string {
  const data = svgCache.get(lang);
  if (data && data.body) {
    const vb = data.viewBox.split(/\s+/).map(Number);
    const scale = size / Math.max(vb[2] || 128, vb[3] || 128);
    return `<g transform="translate(${x},${y}) scale(${scale.toFixed(4)})">${data.body}</g>`;
  }
  // 🐱 Fallback: styled badge with language color + abbreviation
  const color = LANG_COLORS[lang] || "#555";
  const short = LANG_SHORT[lang] || lang.slice(0, 2);
  const textColor = isLightColor(color) ? "#000" : "#fff";
  const fontSize = short.length > 2 ? 7 : 8;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${color}"/><text x="${x + size / 2}" y="${y + size / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="700" fill="${textColor}" font-family="ui-monospace, SFMono-Regular, monospace">${short}</text>`;
}

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || "#555";
}
