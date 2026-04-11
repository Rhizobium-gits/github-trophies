// 🐱 Language short labels and colors for SVG rendering
// Each language gets a 1-3 letter abbreviation rendered in its brand color

export interface LangInfo {
  short: string;  // 1-3 char abbreviation
  color: string;  // brand color
}

const LANGS: Record<string, LangInfo> = {
  Python:            { short: "Py", color: "#3572A5" },
  JavaScript:        { short: "JS", color: "#f1e05a" },
  TypeScript:        { short: "TS", color: "#3178c6" },
  HTML:              { short: "H",  color: "#e34c26" },
  CSS:               { short: "C",  color: "#563d7c" },
  Shell:             { short: "Sh", color: "#89e051" },
  R:                 { short: "R",  color: "#198CE7" },
  "Jupyter Notebook":{ short: "Jy", color: "#DA5B0B" },
  Go:                { short: "Go", color: "#00ADD8" },
  Rust:              { short: "Rs", color: "#dea584" },
  Java:              { short: "Jv", color: "#b07219" },
  C:                 { short: "C",  color: "#555555" },
  "C++":             { short: "++", color: "#f34b7d" },
  "C#":              { short: "C#", color: "#178600" },
  Ruby:              { short: "Rb", color: "#701516" },
  PHP:               { short: "Ph", color: "#4F5D95" },
  Swift:             { short: "Sw", color: "#F05138" },
  Kotlin:            { short: "Kt", color: "#A97BFF" },
  Dart:              { short: "Da", color: "#00B4AB" },
  Lua:               { short: "Lu", color: "#000080" },
  Vim:               { short: "Vi", color: "#199f4b" },
  "Vim Script":      { short: "Vi", color: "#199f4b" },
  "Common Lisp":     { short: "CL", color: "#3fb68b" },
  "Emacs Lisp":      { short: "EL", color: "#c065db" },
  Makefile:          { short: "Mk", color: "#427819" },
  Dockerfile:        { short: "Dk", color: "#384d54" },
  Nix:               { short: "Nx", color: "#7e7eff" },
  TeX:               { short: "Tx", color: "#3D6117" },
  Vue:               { short: "Vu", color: "#41B883" },
  Scala:             { short: "Sc", color: "#c22d40" },
  Haskell:           { short: "Hs", color: "#5e5086" },
  Perl:              { short: "Pl", color: "#0298c3" },
  SCSS:              { short: "Ss", color: "#c6538c" },
  Svelte:            { short: "Sv", color: "#ff3e00" },
  Elixir:            { short: "Ex", color: "#6e4a7e" },
  Clojure:           { short: "Cj", color: "#db5855" },
  Zig:               { short: "Zg", color: "#ec915c" },
  OCaml:             { short: "ML", color: "#3be133" },
  Julia:             { short: "Jl", color: "#a270ba" },
  "Objective-C":     { short: "OC", color: "#438eff" },
  HCL:               { short: "HC", color: "#844FBA" },
  Groovy:            { short: "Gr", color: "#4298b8" },
  PowerShell:        { short: "Ps", color: "#012456" },
  "F#":              { short: "F#", color: "#b845fc" },
  Erlang:            { short: "Er", color: "#B83998" },
  Fortran:           { short: "Fn", color: "#4d41b1" },
  Assembly:          { short: "As", color: "#6E4C13" },
  MATLAB:            { short: "Mt", color: "#e16737" },
  Solidity:          { short: "So", color: "#AA6746" },
  YAML:              { short: "Ym", color: "#cb171e" },
  TOML:              { short: "Tm", color: "#9c4221" },
  Markdown:          { short: "Md", color: "#083fa1" },
  JSON:              { short: "Js", color: "#292929" },
};

export function getLangInfo(lang: string): LangInfo {
  return LANGS[lang] || { short: lang.slice(0, 2), color: "#555" };
}

// 🐱 Render a language icon: colored rounded rect with abbreviation
export function langIcon(x: number, y: number, lang: string, size: number = 18): string {
  const info = getLangInfo(lang);
  const textColor = isLightColor(info.color) ? "#000" : "#fff";
  const fontSize = info.short.length > 2 ? 7 : 8;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${info.color}"/><text x="${x + size / 2}" y="${y + size / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="700" fill="${textColor}" font-family="ui-monospace, SFMono-Regular, monospace">${info.short}</text>`;
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
