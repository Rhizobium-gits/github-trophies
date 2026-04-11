// 🐱 Language icons - fetch devicon SVGs and embed as inline SVG (no <image> tag)
// GitHub README strips <image> and base64 data URIs from SVGs for security.
// Instead we fetch the SVG source, extract its content, and inline it directly.

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
  Nix: "#7EBAE4", "Common Lisp": "#3fb68b", "F#": "#b845fc", Fortran: "#4d41b1",
  Assembly: "#6E4C13", MATLAB: "#e16737",
};

// 🐱 Cache: stores the inner SVG content (everything between <svg> and </svg>)
const svgCache = new Map<string, string | null>();

async function fetchSvgContent(lang: string): Promise<string | null> {
  if (svgCache.has(lang)) return svgCache.get(lang) || null;

  const url = DEVICON_URLS[lang];
  if (!url) { svgCache.set(lang, null); return null; }

  try {
    const res = await fetch(url);
    if (!res.ok) { svgCache.set(lang, null); return null; }
    const text = await res.text();

    // 🐱 Extract viewBox and inner content
    const viewBoxMatch = text.match(/viewBox="([^"]*)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 128 128";

    // 🐱 Extract everything between <svg...> and </svg>
    const innerMatch = text.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    const inner = innerMatch ? innerMatch[1] : "";

    // 🐱 Remove any nested <svg>, <script>, <style> tags for safety
    const cleaned = inner
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");

    const result = `viewBox="${viewBox}">${cleaned}`;
    svgCache.set(lang, result);
    return result;
  } catch {
    svgCache.set(lang, null);
    return null;
  }
}

export async function prefetchIcons(langs: string[]): Promise<void> {
  await Promise.all(langs.map(l => fetchSvgContent(l)));
}

// 🐱 Render: uses nested <svg> with the devicon paths directly inlined
export function langIcon(x: number, y: number, lang: string, size: number = 18): string {
  const cached = svgCache.get(lang);

  if (cached) {
    // 🐱 Inline SVG - no <image> tag, GitHub-safe
    return `<svg x="${x}" y="${y}" width="${size}" height="${size}" ${cached}</svg>`;
  }

  // 🐱 Fallback: colored circle
  const color = LANG_COLORS[lang] || "#555";
  return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}"/>`;
}

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang] || "#555";
}
