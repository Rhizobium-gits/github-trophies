// 🐱 Language icons from devicons
// Fetched SVGs have their IDs uniquified to avoid conflicts when inlined

const DEVICON_URLS: Record<string, string> = {
  Python: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
  JavaScript: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
  TypeScript: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
  HTML: "https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg",
  CSS: "https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg",
  Shell: "https://raw.githubusercontent.com/devicons/devicon/master/icons/bash/bash-original.svg",
  R: "https://raw.githubusercontent.com/devicons/devicon/master/icons/r/r-original.svg",
  "Jupyter Notebook": "https://raw.githubusercontent.com/devicons/devicon/master/icons/jupyter/jupyter-original.svg",
  Go: "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg",
  Rust: "https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg",
  Java: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg",
  C: "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg",
  "C++": "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
  "C#": "https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg",
  Ruby: "https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg",
  PHP: "https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg",
  Swift: "https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg",
  Kotlin: "https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg",
  Dart: "https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg",
  Lua: "https://raw.githubusercontent.com/devicons/devicon/master/icons/lua/lua-original.svg",
  Vue: "https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original.svg",
  Scala: "https://raw.githubusercontent.com/devicons/devicon/master/icons/scala/scala-original.svg",
  Haskell: "https://raw.githubusercontent.com/devicons/devicon/master/icons/haskell/haskell-original.svg",
  Perl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/perl/perl-original.svg",
  Elixir: "https://raw.githubusercontent.com/devicons/devicon/master/icons/elixir/elixir-original.svg",
  Clojure: "https://raw.githubusercontent.com/devicons/devicon/master/icons/clojure/clojure-original.svg",
  OCaml: "https://raw.githubusercontent.com/devicons/devicon/master/icons/ocaml/ocaml-original.svg",
  Julia: "https://raw.githubusercontent.com/devicons/devicon/master/icons/julia/julia-original.svg",
  Dockerfile: "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg",
  TeX: "https://raw.githubusercontent.com/devicons/devicon/master/icons/latex/latex-original.svg",
  Svelte: "https://raw.githubusercontent.com/devicons/devicon/master/icons/svelte/svelte-original.svg",
  Zig: "https://raw.githubusercontent.com/devicons/devicon/master/icons/zig/zig-original.svg",
  "Emacs Lisp": "https://raw.githubusercontent.com/devicons/devicon/master/icons/emacs/emacs-original.svg",
  Vim: "https://raw.githubusercontent.com/devicons/devicon/master/icons/vim/vim-original.svg",
  "Vim Script": "https://raw.githubusercontent.com/devicons/devicon/master/icons/vim/vim-original.svg",
  SCSS: "https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg",
  PowerShell: "https://raw.githubusercontent.com/devicons/devicon/master/icons/powershell/powershell-original.svg",
  Groovy: "https://raw.githubusercontent.com/devicons/devicon/master/icons/groovy/groovy-original.svg",
  Erlang: "https://raw.githubusercontent.com/devicons/devicon/master/icons/erlang/erlang-original.svg",
  Nix: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nixos/nixos-original.svg",
};

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
  Nix: "#7EBAE4", "Common Lisp": "#3fb68b", "F#": "#b845fc",
};

// 🐱 Cache: stores processed SVG content with uniquified IDs
interface SvgData {
  defs: string;   // <defs> content to put in parent SVG
  body: string;   // paths/shapes to render
  viewBox: string;
}

const svgCache = new Map<string, SvgData | null>();
let idCounter = 0;

function uniquifyIds(svgText: string, prefix: string): string {
  // 🐱 Replace all id="..." and url(#...) and href="#..." references with unique prefixed versions
  const ids = new Set<string>();
  const idPattern = /id="([^"]*)"/g;
  let match;
  while ((match = idPattern.exec(svgText)) !== null) {
    ids.add(match[1]);
  }
  let result = svgText;
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

  const url = DEVICON_URLS[lang];
  if (!url) { svgCache.set(lang, null); return null; }

  try {
    const res = await fetch(url);
    if (!res.ok) { svgCache.set(lang, null); return null; }
    let text = await res.text();

    // 🐱 Uniquify IDs
    const prefix = `li${idCounter++}`;
    text = uniquifyIds(text, prefix);

    // 🐱 Extract viewBox
    const vbMatch = text.match(/viewBox="([^"]*)"/);
    const viewBox = vbMatch ? vbMatch[1] : "0 0 128 128";

    // 🐱 Extract inner content
    const innerMatch = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    let inner = innerMatch ? innerMatch[1] : "";

    // 🐱 Remove <style> and <script>
    inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
    inner = inner.replace(/<style[\s\S]*?<\/style>/gi, "");

    // 🐱 Separate <defs>...</defs> (gradients etc) from body
    let defs = "";
    inner = inner.replace(/<defs>([\s\S]*?)<\/defs>/gi, (_, d) => { defs += d; return ""; });
    // 🐱 Also extract standalone gradient/clipPath elements outside <defs>
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

// 🐱 Get defs for all prefetched icons (to be placed in parent <defs>)
export function getAllDefs(): string {
  let defs = "";
  svgCache.forEach(data => { if (data) defs += data.defs; });
  return defs;
}

// 🐱 Render icon using <g transform> (no nested <svg>, no <image>)
export function langIcon(x: number, y: number, lang: string, size: number = 18): string {
  const data = svgCache.get(lang);

  if (data && data.body) {
    // 🐱 Calculate scale from viewBox to target size
    const vbParts = data.viewBox.split(/\s+/).map(Number);
    const vbW = vbParts[2] || 128;
    const vbH = vbParts[3] || 128;
    const scale = size / Math.max(vbW, vbH);
    return `<g transform="translate(${x},${y}) scale(${scale.toFixed(4)})">${data.body}</g>`;
  }

  // 🐱 Fallback: colored circle
  const color = LANG_COLORS[lang] || "#555";
  return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}"/>`;
}

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || "#555";
}
