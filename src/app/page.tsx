"use client";

import { useState } from "react";

// 🐱 Types
interface Widget { id: string; type: string; span: 1 | 2 }

// 🐱 Widget catalog with mini preview descriptions
const CATALOG: { type: string; label: string; icon: string; span: 1 | 2 }[] = [
  { type: "header", label: "Profile", icon: "👤", span: 2 },
  { type: "rank", label: "Rank", icon: "🏆", span: 1 },
  { type: "stats", label: "Stats", icon: "📊", span: 2 },
  { type: "stat-commits", label: "Commits", icon: "⚡", span: 1 },
  { type: "stat-prs", label: "PRs", icon: "🔀", span: 1 },
  { type: "stat-issues", label: "Issues", icon: "📋", span: 1 },
  { type: "stat-stars", label: "Stars", icon: "⭐", span: 1 },
  { type: "stat-repos", label: "Repos", icon: "📦", span: 1 },
  { type: "stat-experience", label: "Exp", icon: "🕐", span: 1 },
  { type: "contributions", label: "Contributions", icon: "📈", span: 2 },
  { type: "languages-donut", label: "Lang Chart", icon: "🍩", span: 1 },
  { type: "languages-list", label: "Lang List", icon: "📝", span: 1 },
  { type: "languages", label: "Languages", icon: "🌐", span: 2 },
  { type: "divider", label: "Line", icon: "—", span: 2 },
];

const THEMES = [
  "noir","dracula","one-dark","monokai","tokyo-night","nord","github-dark","catppuccin",
  "gruvbox-dark","solarized-dark","synthwave","cobalt","ayu","material-ocean","rose",
  "night-owl","palenight","shades-of-purple","panda","horizon","vitesse","everforest",
  "kanagawa","fleet","light","github-light","solarized-light","gruvbox-light",
  "catppuccin-latte","light-owl","everforest-light","vitesse-light",
];

const TC: Record<string, { bg: string; text: string; sub: string; accent: string; border: string }> = {
  noir: { bg: "#111", text: "#fff", sub: "#888", accent: "#fff", border: "#2a2a2a" },
  dracula: { bg: "#282a36", text: "#f8f8f2", sub: "#6272a4", accent: "#bd93f9", border: "#44475a" },
  "one-dark": { bg: "#282c34", text: "#abb2bf", sub: "#5c6370", accent: "#61afef", border: "#3e4451" },
  monokai: { bg: "#272822", text: "#f8f8f2", sub: "#75715e", accent: "#f92672", border: "#49483e" },
  "tokyo-night": { bg: "#1a1b26", text: "#c0caf5", sub: "#565f89", accent: "#7aa2f7", border: "#292e42" },
  nord: { bg: "#2e3440", text: "#eceff4", sub: "#7b88a0", accent: "#88c0d0", border: "#3b4252" },
  "github-dark": { bg: "#0d1117", text: "#e6edf3", sub: "#7d8590", accent: "#58a6ff", border: "#30363d" },
  catppuccin: { bg: "#1e1e2e", text: "#cdd6f4", sub: "#6c7086", accent: "#cba6f7", border: "#313244" },
  light: { bg: "#fff", text: "#111", sub: "#888", accent: "#333", border: "#e0e0e0" },
  "github-light": { bg: "#fff", text: "#1f2328", sub: "#656d76", accent: "#0969da", border: "#d0d7de" },
};

let nid = 1;

// 🐱 Build visual rows
function toRows(ws: Widget[]): Widget[][] {
  const rows: Widget[][] = [];
  let cur: Widget[] = [], used = 0;
  for (const w of ws) {
    if (used + w.span > 2) {
      if (cur.length) rows.push(cur);
      cur = [w]; used = w.span;
    } else {
      cur.push(w); used += w.span;
    }
  }
  if (cur.length) rows.push(cur);
  return rows;
}

// 🐱 Preview components
function PHeader({ t }: { t: typeof TC.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${t.sub}33`, border: `2px solid ${t.border}` }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>Username</div>
        <div style={{ fontSize: 10, color: t.sub, marginTop: 1 }}>@username</div>
      </div>
    </div>
  );
}

function PRank({ t }: { t: typeof TC.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>A-</span>
      </div>
    </div>
  );
}

function PStat({ label, val, t }: { label: string; val: string; t: typeof TC.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "3px 10px" }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.sub, marginRight: 8, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: t.sub, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: t.text, fontFamily: "monospace" }}>{val}</span>
    </div>
  );
}

function PStats({ t }: { t: typeof TC.noir }) {
  return <div>{[["Commits", "847"], ["PRs", "33"], ["Issues", "62"], ["Stars", "4"], ["Repos", "20"], ["Exp", "0yr"]].map(([l, v]) => <PStat key={l} label={l} val={v} t={t} />)}</div>;
}

function PContrib({ t }: { t: typeof TC.noir }) {
  return (
    <div style={{ padding: "6px 10px" }}>
      <div style={{ fontSize: 8, color: t.sub, fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>CONTRIBUTIONS · 2,309</div>
      <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 14 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const v = Math.sin(i * 0.3) * 0.5 + Math.random() * 0.5;
          return <div key={i} style={{ flex: 1, height: Math.max(v * 14, 1), background: t.accent, opacity: 0.15 + v * 0.85, borderRadius: 1 }} />;
        })}
      </div>
    </div>
  );
}

function PDonut({ t }: { t: typeof TC.noir }) {
  const cs = ["#3572A5", "#3D6117", "#e34c26", "#f1e05a", "#3178c6"];
  const as2 = [0, 100, 170, 230, 280, 360];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        {cs.map((c, i) => {
          const r = 24, ir = 15, cx = 28, cy = 28;
          const s = (as2[i] - 90) * Math.PI / 180, e = (as2[i + 1] - 90) * Math.PI / 180;
          return <path key={i} d={`M${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 ${as2[i + 1] - as2[i] > 180 ? 1 : 0},1 ${cx + r * Math.cos(e)},${cy + r * Math.sin(e)} L${cx + ir * Math.cos(e)},${cy + ir * Math.sin(e)} A${ir},${ir} 0 ${as2[i + 1] - as2[i] > 180 ? 1 : 0},0 ${cx + ir * Math.cos(s)},${cy + ir * Math.sin(s)} Z`} fill={c} />;
        })}
        <text x="28" y="28" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={t.text}>9</text>
      </svg>
    </div>
  );
}

function PLangList({ t }: { t: typeof TC.noir }) {
  return (
    <div style={{ padding: "8px 10px" }}>
      {[["Python", "36.7%", "#3572A5"], ["TeX", "28.6%", "#3D6117"], ["HTML", "14.3%", "#e34c26"], ["JS", "6.3%", "#f1e05a"]].map(([n, p, c]) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
          <span style={{ fontSize: 9, color: t.text, flex: 1 }}>{n}</span>
          <span style={{ fontSize: 9, color: t.sub, fontFamily: "monospace" }}>{p}</span>
        </div>
      ))}
    </div>
  );
}

function PLangs({ t }: { t: typeof TC.noir }) {
  return (
    <div style={{ padding: "6px 10px" }}>
      <div style={{ fontSize: 8, color: t.sub, fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>LANGUAGES</div>
      <div style={{ display: "flex", gap: 6 }}>
        <PDonut t={t} />
        <PLangList t={t} />
      </div>
    </div>
  );
}

function PDivider({ t }: { t: typeof TC.noir }) {
  return <div style={{ padding: "4px 10px" }}><div style={{ borderTop: `1px solid ${t.border}` }} /></div>;
}

function Preview({ type, t }: { type: string; t: typeof TC.noir }) {
  const map: Record<string, () => React.ReactNode> = {
    header: () => <PHeader t={t} />, rank: () => <PRank t={t} />,
    stats: () => <PStats t={t} />, contributions: () => <PContrib t={t} />,
    "languages-donut": () => <PDonut t={t} />, "languages-list": () => <PLangList t={t} />,
    languages: () => <PLangs t={t} />, divider: () => <PDivider t={t} />,
    "stat-commits": () => <PStat label="Commits" val="847" t={t} />,
    "stat-prs": () => <PStat label="PRs" val="33" t={t} />,
    "stat-issues": () => <PStat label="Issues" val="62" t={t} />,
    "stat-stars": () => <PStat label="Stars" val="4" t={t} />,
    "stat-repos": () => <PStat label="Repos" val="20" t={t} />,
    "stat-experience": () => <PStat label="Experience" val="0yr" t={t} />,
  };
  return (map[type] || (() => <div />))();
}

export default function Editor() {
  const [username, setUsername] = useState("Rhizobium-gits");
  const [theme, setTheme] = useState("noir");
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: `w${nid++}`, type: "header", span: 1 },
    { id: `w${nid++}`, type: "rank", span: 1 },
    { id: `w${nid++}`, type: "stats", span: 2 },
    { id: `w${nid++}`, type: "contributions", span: 2 },
    { id: `w${nid++}`, type: "languages", span: 2 },
  ]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const t = TC[theme] || TC.noir;
  const rows = toRows(widgets);

  const add = (type: string, span: 1 | 2) => {
    setWidgets(p => [...p, { id: `w${nid++}`, type, span }]);
  };
  const remove = (id: string) => setWidgets(p => p.filter(w => w.id !== id));
  const toggleSize = (id: string) => setWidgets(p => p.map(w => w.id === id ? { ...w, span: w.span === 2 ? 1 : 2 } as Widget : w));

  // 🐱 Drag reorder
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setWidgets(p => {
      const a = [...p];
      const [item] = a.splice(dragIdx, 1);
      a.splice(idx, 0, item);
      return a;
    });
    setDragIdx(idx);
  };
  const onDragEnd = () => setDragIdx(null);

  const config = JSON.stringify({ username, theme, layout: widgets.map(w => ({ type: w.type, width: w.span === 2 ? "full" : "half" })) }, null, 2);

  // 🐱 Flat index mapping for drag
  let flatIdx = 0;
  const flatMap = new Map<string, number>();
  widgets.forEach(w => flatMap.set(w.id, flatIdx++));

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #1a1a1a" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>GitHub Trophies</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username"
            style={{ padding: "6px 10px", fontSize: 12, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff", outline: "none", width: 140 }} />
          <select value={theme} onChange={e => setTheme(e.target.value)}
            style={{ padding: "6px 10px", fontSize: 12, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff", outline: "none" }}>
            {THEMES.map(th => <option key={th} value={th}>{th}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Widget palette */}
        <div style={{ width: 100, borderRight: "1px solid #1a1a1a", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", height: "calc(100vh - 49px)" }}>
          {CATALOG.map(c => (
            <div key={c.type} className="catalog-item"
              onClick={() => add(c.type, c.span)}
              style={{ padding: "8px 6px", background: "#111", borderRadius: 8, textAlign: "center", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 18 }}>{c.icon}</div>
              <div style={{ fontSize: 8, color: "#666", marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 20px", overflowY: "auto", height: "calc(100vh - 49px)" }}>
          <div>
            {/* Card preview */}
            <div style={{
              width: 480, background: t.bg, borderRadius: 16,
              border: `1px solid ${t.border}`,
              boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
              padding: 10,
              transition: "background 0.3s, border-color 0.3s",
            }}>
              {rows.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  {row.map(w => {
                    const fi = flatMap.get(w.id) ?? 0;
                    return (
                      <div key={w.id}
                        className={`widget-block widget-enter ${dragIdx === fi ? "dragging" : ""}`}
                        draggable
                        onDragStart={() => onDragStart(fi)}
                        onDragOver={e => onDragOver(e, fi)}
                        onDragEnd={onDragEnd}
                        style={{
                          flex: w.span,
                          borderRadius: 10,
                          background: `${t.bg}`,
                          border: `1px solid ${t.border}`,
                          position: "relative",
                          overflow: "visible",
                        }}>
                        {/* iOS-style delete badge */}
                        <div className="delete-badge" onClick={() => remove(w.id)}>−</div>

                        {/* Size toggle badge */}
                        <div className="size-badge"
                          onClick={() => toggleSize(w.id)}
                          style={{ background: t.accent, color: t.bg }}>
                          {w.span === 2 ? "½" : "▣"}
                        </div>

                        <Preview type={w.type} t={t} />
                      </div>
                    );
                  })}
                </div>
              ))}

              {widgets.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: t.sub, fontSize: 12 }}>
                  Tap a widget to add
                </div>
              )}
            </div>

            {/* Config output */}
            <div style={{ marginTop: 16, width: 480 }}>
              <button onClick={() => setShowConfig(!showConfig)}
                style={{ width: "100%", padding: "10px", fontSize: 12, fontWeight: 600, background: "#111", border: "1px solid #222", borderRadius: 10, color: "#555", cursor: "pointer" }}>
                {showConfig ? "Hide" : "Show"} config.json
              </button>
              {showConfig && (
                <div style={{ marginTop: 6, padding: 14, background: "#0a0a0a", borderRadius: 10, border: "1px solid #1a1a1a" }}>
                  <pre style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "#6ec", whiteSpace: "pre", userSelect: "all", margin: 0 }}>{config}</pre>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div style={{ marginTop: 16, width: 480, fontSize: 10, color: "#444", lineHeight: 2, paddingBottom: 40 }}>
              <ol style={{ paddingLeft: 16 }}>
                <li>Fork <a href="https://github.com/Rhizobium-gits/github-trophies" style={{ color: "#58a6ff" }}>repo</a></li>
                <li>Paste config into <code style={{ color: "#6ec" }}>config.json</code></li>
                <li>Add <code style={{ color: "#6ec" }}>GH_TOKEN</code> in Settings → Secrets</li>
                <li>Run Action → use <code style={{ color: "#6ec" }}>{"![](./stats.svg)"}</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
