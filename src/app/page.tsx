"use client";

import { useState, useRef, CSSProperties } from "react";

// 🐱 Widget definitions
interface Widget {
  id: string;
  type: string;
  label: string;
  col: number;
  row: number;
  span: 1 | 2;
  color: string;
}

const CATALOG = [
  { type: "header", label: "Profile", color: "#2563eb", defaultSpan: 2 as const },
  { type: "rank", label: "Rank", color: "#7c3aed", defaultSpan: 1 as const },
  { type: "stats", label: "All Stats", color: "#059669", defaultSpan: 2 as const },
  { type: "stat-commits", label: "Commits", color: "#16a34a", defaultSpan: 1 as const },
  { type: "stat-prs", label: "PRs", color: "#2563eb", defaultSpan: 1 as const },
  { type: "stat-issues", label: "Issues", color: "#d97706", defaultSpan: 1 as const },
  { type: "stat-stars", label: "Stars", color: "#eab308", defaultSpan: 1 as const },
  { type: "stat-repos", label: "Repos", color: "#0891b2", defaultSpan: 1 as const },
  { type: "stat-experience", label: "Exp", color: "#6366f1", defaultSpan: 1 as const },
  { type: "contributions", label: "Contributions", color: "#10b981", defaultSpan: 2 as const },
  { type: "languages-donut", label: "Lang Donut", color: "#f59e0b", defaultSpan: 1 as const },
  { type: "languages-list", label: "Lang List", color: "#f59e0b", defaultSpan: 1 as const },
  { type: "languages", label: "Languages", color: "#f59e0b", defaultSpan: 2 as const },
  { type: "divider", label: "Divider", color: "#374151", defaultSpan: 2 as const },
];

const THEMES = [
  "noir","dracula","one-dark","monokai","tokyo-night","nord","github-dark","catppuccin",
  "gruvbox-dark","solarized-dark","synthwave","cobalt","ayu","material-ocean","rose",
  "night-owl","palenight","shades-of-purple","panda","horizon","vitesse","everforest",
  "kanagawa","fleet","light","github-light","solarized-light","gruvbox-light",
  "catppuccin-latte","light-owl","everforest-light","vitesse-light",
];

// 🐱 Theme preview colors
const THEME_COLORS: Record<string, { bg: string; text: string; sub: string; accent: string; border: string }> = {
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

let nextId = 1;

function buildGrid(widgets: Widget[]): Widget[][] {
  const sorted = [...widgets].sort((a, b) => a.row - b.row || a.col - b.col);
  const rows: Widget[][] = [];
  let currentRow: Widget[] = [];
  let currentRowIdx = -1;
  let colsUsed = 0;
  for (const w of sorted) {
    if (w.row !== currentRowIdx || colsUsed + w.span > 2) {
      if (currentRow.length) rows.push(currentRow);
      currentRow = [w];
      currentRowIdx = w.row;
      colsUsed = w.span;
    } else {
      currentRow.push(w);
      colsUsed += w.span;
    }
  }
  if (currentRow.length) rows.push(currentRow);
  return rows;
}

function normalize(widgets: Widget[]): Widget[] {
  const grid = buildGrid(widgets);
  const result: Widget[] = [];
  grid.forEach((row, ri) => {
    let col = 0;
    row.forEach(w => { result.push({ ...w, row: ri, col }); col += w.span; });
  });
  return result;
}

// 🐱 Mock preview renderers
function PreviewHeader({ tc }: { tc: typeof THEME_COLORS.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: tc.sub + "44", border: `1.5px solid ${tc.border}`, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: tc.text }}>Username</div>
        <div style={{ fontSize: 9, color: tc.sub }}>@username</div>
        <div style={{ fontSize: 8, color: tc.sub, opacity: 0.6 }}>Bio text here...</div>
      </div>
    </div>
  );
}

function PreviewRank({ tc }: { tc: typeof THEME_COLORS.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: `2.5px solid ${tc.accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 800, color: tc.text,
      }}>A-</div>
    </div>
  );
}

function PreviewStat({ label, value, tc }: { label: string; value: string; tc: typeof THEME_COLORS.noir }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 10px" }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: tc.sub + "88" }} />
      <span style={{ fontSize: 10, color: tc.sub, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: tc.text, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function PreviewStats({ tc }: { tc: typeof THEME_COLORS.noir }) {
  const items = [["Total Commits", "847"], ["Pull Requests", "33"], ["Issues", "62"], ["Stars Earned", "4"], ["Repositories", "20"], ["Experience", "0 yr"]];
  return <div>{items.map(([l, v]) => <PreviewStat key={l} label={l} value={v} tc={tc} />)}</div>;
}

function PreviewContributions({ tc }: { tc: typeof THEME_COLORS.noir }) {
  const bars = Array.from({ length: 26 }, () => Math.random());
  return (
    <div style={{ padding: "6px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 8, color: tc.sub, fontWeight: 600, letterSpacing: 1 }}>CONTRIBUTIONS</span>
        <span style={{ fontSize: 8, color: tc.sub, fontFamily: "monospace" }}>2,309 last year</span>
      </div>
      <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 16 }}>
        {bars.map((v, i) => (
          <div key={i} style={{ flex: 1, height: Math.max(v * 16, 1), background: tc.accent, opacity: v < 0.1 ? 0.1 : 0.2 + v * 0.8, borderRadius: 1 }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        {["Jan", "Apr", "Jul", "Oct"].map(m => <span key={m} style={{ fontSize: 6, color: tc.sub }}>{m}</span>)}
      </div>
    </div>
  );
}

function PreviewDonut({ tc }: { tc: typeof THEME_COLORS.noir }) {
  const colors = ["#3572A5", "#3D6117", "#e34c26", "#f1e05a", "#3178c6"];
  const angles = [0, 100, 170, 230, 280, 360];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 8 }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        {colors.map((c, i) => {
          const r = 26, ir = 16, cx = 30, cy = 30;
          const s = (angles[i] - 90) * Math.PI / 180, e = (angles[i + 1] - 90) * Math.PI / 180;
          const la = angles[i + 1] - angles[i] > 180 ? 1 : 0;
          return <path key={i} d={`M${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 ${la},1 ${cx + r * Math.cos(e)},${cy + r * Math.sin(e)} L${cx + ir * Math.cos(e)},${cy + ir * Math.sin(e)} A${ir},${ir} 0 ${la},0 ${cx + ir * Math.cos(s)},${cy + ir * Math.sin(s)} Z`} fill={c} />;
        })}
        <text x="30" y="30" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill={tc.text}>9</text>
      </svg>
    </div>
  );
}

function PreviewLangList({ tc }: { tc: typeof THEME_COLORS.noir }) {
  const langs = [["Python", "36.7%", "#3572A5"], ["TeX", "28.6%", "#3D6117"], ["HTML", "14.3%", "#e34c26"], ["JS", "6.3%", "#f1e05a"]];
  return (
    <div style={{ padding: "6px 10px" }}>
      {langs.map(([n, p, c]) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: tc.text, flex: 1 }}>{n}</span>
          <span style={{ fontSize: 9, color: tc.sub, fontFamily: "monospace" }}>{p}</span>
        </div>
      ))}
    </div>
  );
}

function PreviewLanguages({ tc }: { tc: typeof THEME_COLORS.noir }) {
  return (
    <div style={{ padding: "6px 10px" }}>
      <div style={{ fontSize: 8, color: tc.sub, fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>MOST USED LANGUAGES</div>
      <div style={{ display: "flex", gap: 8 }}>
        <PreviewDonut tc={tc} />
        <PreviewLangList tc={tc} />
      </div>
    </div>
  );
}

function WidgetPreview({ type, tc }: { type: string; tc: typeof THEME_COLORS.noir }) {
  switch (type) {
    case "header": return <PreviewHeader tc={tc} />;
    case "rank": return <PreviewRank tc={tc} />;
    case "stats": return <PreviewStats tc={tc} />;
    case "stat-commits": return <PreviewStat label="Total Commits" value="847" tc={tc} />;
    case "stat-prs": return <PreviewStat label="Pull Requests" value="33" tc={tc} />;
    case "stat-issues": return <PreviewStat label="Issues" value="62" tc={tc} />;
    case "stat-stars": return <PreviewStat label="Stars Earned" value="4" tc={tc} />;
    case "stat-repos": return <PreviewStat label="Repositories" value="20" tc={tc} />;
    case "stat-experience": return <PreviewStat label="Experience" value="0 yr" tc={tc} />;
    case "contributions": return <PreviewContributions tc={tc} />;
    case "languages-donut": return <PreviewDonut tc={tc} />;
    case "languages-list": return <PreviewLangList tc={tc} />;
    case "languages": return <PreviewLanguages tc={tc} />;
    case "divider": return <div style={{ borderTop: `1px solid ${tc.border}`, margin: "4px 10px" }} />;
    default: return <div style={{ padding: 10, fontSize: 10, color: tc.sub }}>{type}</div>;
  }
}

export default function Editor() {
  const [username, setUsername] = useState("Rhizobium-gits");
  const [theme, setTheme] = useState("noir");
  const [widgets, setWidgets] = useState<Widget[]>(() => normalize([
    { id: `w${nextId++}`, type: "header", label: "Profile", col: 0, row: 0, span: 1, color: "#2563eb" },
    { id: `w${nextId++}`, type: "rank", label: "Rank", col: 1, row: 0, span: 1, color: "#7c3aed" },
    { id: `w${nextId++}`, type: "stats", label: "All Stats", col: 0, row: 1, span: 2, color: "#059669" },
    { id: `w${nextId++}`, type: "contributions", label: "Contributions", col: 0, row: 2, span: 2, color: "#10b981" },
    { id: `w${nextId++}`, type: "languages", label: "Languages", col: 0, row: 3, span: 2, color: "#f59e0b" },
  ]));
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ row: number; col: number } | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const tc = THEME_COLORS[theme] || THEME_COLORS.noir;

  const addWidget = (cat: typeof CATALOG[0]) => {
    const maxRow = widgets.length ? Math.max(...widgets.map(w => w.row)) + 1 : 0;
    setWidgets(prev => normalize([...prev, {
      id: `w${nextId++}`, type: cat.type, label: cat.label,
      col: 0, row: maxRow, span: cat.defaultSpan, color: cat.color,
    }]));
  };

  const removeWidget = (id: string) => setWidgets(prev => normalize(prev.filter(w => w.id !== id)));

  const toggleSpan = (id: string) => {
    setWidgets(prev => normalize(prev.map(w =>
      w.id === id ? { ...w, span: w.span === 2 ? 1 : 2 } as Widget : w
    )));
  };

  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOverSlot = (e: React.DragEvent, row: number, col: number) => { e.preventDefault(); setDropTarget({ row, col }); };
  const onDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!dragId) return;
    setWidgets(prev => {
      const arr = prev.map(w => ({ ...w }));
      const dw = arr.find(w => w.id === dragId);
      if (!dw) return prev;
      dw.row = targetRow; dw.col = targetCol;
      arr.forEach(w => { if (w.id !== dragId && w.row >= targetRow) w.row += 1; });
      return normalize(arr);
    });
    setDragId(null); setDropTarget(null);
  };
  const onDragEnd = () => { setDragId(null); setDropTarget(null); };

  const config = { username, theme, layout: widgets.map(w => ({ type: w.type, width: w.span === 2 ? "full" : "half" })) };
  const configStr = JSON.stringify(config, null, 2);
  const grid = buildGrid(widgets);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: 'system-ui, -apple-system, sans-serif', color: "#e0e0e0", background: "#0a0a0a" }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: "#111", borderRight: "1px solid #222", overflowY: "auto", padding: 12, flexShrink: 0 }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#fff" }}>GitHub Trophies</h1>

        <label style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "5px 7px", fontSize: 11, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#fff", outline: "none", marginBottom: 6, marginTop: 2 }} />

        <label style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Theme</label>
        <select value={theme} onChange={e => setTheme(e.target.value)}
          style={{ width: "100%", padding: "5px 7px", fontSize: 11, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#fff", outline: "none", marginBottom: 12, marginTop: 2 }}>
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Add Widget</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {CATALOG.map(cat => (
            <button key={cat.type} onClick={() => addWidget(cat)}
              style={{ padding: "5px 8px", fontSize: 10, fontWeight: 500, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#bbb", cursor: "pointer", textAlign: "left" }}>
              + {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 9, color: "#333", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Preview — drag to reorder, click border to resize
        </div>

        {/* Card */}
        <div style={{
          width: 480, background: tc.bg, borderRadius: 14,
          border: `1px solid ${tc.border}`, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {grid.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 4 }}>
                {row.map(w => (
                  <div
                    key={w.id}
                    draggable
                    onDragStart={e => onDragStart(e, w.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={e => onDragOverSlot(e, ri, w.col)}
                    onDrop={e => onDrop(e, ri, w.col)}
                    style={{
                      flex: w.span,
                      borderRadius: 6,
                      border: `1px solid ${dragId === w.id ? tc.accent : "transparent"}`,
                      cursor: "grab",
                      position: "relative",
                      transition: "all 0.15s",
                      opacity: dragId === w.id ? 0.4 : 1,
                      background: dragId === w.id ? tc.accent + "11" : "transparent",
                    }}
                  >
                    <WidgetPreview type={w.type} tc={tc} />

                    {/* Controls overlay on hover */}
                    <div style={{
                      position: "absolute", top: 2, right: 2, display: "flex", gap: 2,
                      opacity: 0.6,
                    }} className="widget-controls">
                      <button onClick={() => toggleSpan(w.id)}
                        style={{ fontSize: 7, padding: "1px 4px", borderRadius: 2, border: "none", background: tc.accent + "33", color: tc.accent, cursor: "pointer", fontWeight: 700 }}>
                        {w.span === 2 ? "½" : "1"}
                      </button>
                      <button onClick={() => removeWidget(w.id)}
                        style={{ fontSize: 8, padding: "1px 4px", borderRadius: 2, border: "none", background: "#f8717133", color: "#f87171", cursor: "pointer" }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {row.reduce((s, w) => s + w.span, 0) < 2 && (
                  <div onDragOver={e => onDragOverSlot(e, ri, 1)} onDrop={e => onDrop(e, ri, 1)}
                    style={{ flex: 1, minHeight: 30, border: `1px dashed ${dropTarget?.row === ri ? tc.accent + "44" : tc.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: tc.sub }}>
                    drop
                  </div>
                )}
              </div>
            ))}

            <div onDragOver={e => { e.preventDefault(); setDropTarget({ row: grid.length, col: 0 }); }} onDrop={e => onDrop(e, grid.length, 0)}
              style={{ minHeight: 24, border: `1px dashed ${dropTarget?.row === grid.length ? tc.accent + "44" : "transparent"}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: tc.sub + "66" }}>
              {widgets.length === 0 && "Add widgets from sidebar"}
            </div>
          </div>
        </div>

        {/* Config */}
        <div style={{ width: 480, marginTop: 16 }}>
          <button onClick={() => setShowConfig(!showConfig)}
            style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, background: "#151515", border: "1px solid #2a2a2a", borderRadius: 6, color: "#666", cursor: "pointer", width: "100%" }}>
            {showConfig ? "▼" : "▶"} config.json
          </button>
          {showConfig && (
            <div style={{ marginTop: 6, padding: 14, background: "#0d0d0d", borderRadius: 8, border: "1px solid #1a1a1a" }}>
              <pre style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "#8ec", whiteSpace: "pre", userSelect: "all", margin: 0 }}>{configStr}</pre>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ width: 480, marginTop: 16, fontSize: 10, color: "#444", lineHeight: 1.8, paddingBottom: 40 }}>
          <ol style={{ paddingLeft: 16, margin: 0 }}>
            <li>Fork <a href="https://github.com/Rhizobium-gits/github-trophies" style={{ color: "#60a5fa" }}>repo</a></li>
            <li>Paste config above into <code style={{ color: "#8ec" }}>config.json</code></li>
            <li>Add <code style={{ color: "#8ec" }}>GH_TOKEN</code> secret</li>
            <li>Run Action → <code style={{ color: "#8ec" }}>{"![](./stats.svg)"}</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
