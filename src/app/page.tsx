"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// 🐱 Widget definitions
interface Widget {
  id: string;
  type: string;
  label: string;
  col: number;    // 0-based column (0 or 1 in a 2-col grid)
  row: number;    // row index
  span: 1 | 2;    // column span (1=half, 2=full)
  color: string;  // preview color
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

let nextId = 1;

// 🐱 Convert widgets to grid rows for rendering
function buildGrid(widgets: Widget[]): Widget[][] {
  // Sort by row then col
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

// 🐱 Normalize widget positions after changes
function normalize(widgets: Widget[]): Widget[] {
  const grid = buildGrid(widgets);
  const result: Widget[] = [];
  grid.forEach((row, ri) => {
    let col = 0;
    row.forEach(w => {
      result.push({ ...w, row: ri, col });
      col += w.span;
    });
  });
  return result;
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
  const canvasRef = useRef<HTMLDivElement>(null);

  // 🐱 Add widget from catalog
  const addWidget = (cat: typeof CATALOG[0]) => {
    const maxRow = widgets.length ? Math.max(...widgets.map(w => w.row)) + 1 : 0;
    setWidgets(prev => normalize([...prev, {
      id: `w${nextId++}`,
      type: cat.type,
      label: cat.label,
      col: 0,
      row: maxRow,
      span: cat.defaultSpan,
      color: cat.color,
    }]));
  };

  // 🐱 Remove widget
  const removeWidget = (id: string) => {
    setWidgets(prev => normalize(prev.filter(w => w.id !== id)));
  };

  // 🐱 Toggle span
  const toggleSpan = (id: string) => {
    setWidgets(prev => normalize(prev.map(w =>
      w.id === id ? { ...w, span: w.span === 2 ? 1 : 2 } as Widget : w
    )));
  };

  // 🐱 Drag handling
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverSlot = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDropTarget({ row, col });
  };

  const onDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!dragId) return;

    setWidgets(prev => {
      const arr = prev.map(w => ({ ...w }));
      const dragWidget = arr.find(w => w.id === dragId);
      if (!dragWidget) return prev;

      // Move widget to target position
      dragWidget.row = targetRow;
      dragWidget.col = targetCol;

      // Push others down if needed
      arr.forEach(w => {
        if (w.id !== dragId && w.row >= targetRow) {
          w.row += 1;
        }
      });

      return normalize(arr);
    });

    setDragId(null);
    setDropTarget(null);
  };

  const onDragEnd = () => {
    setDragId(null);
    setDropTarget(null);
  };

  // 🐱 Generate config
  const config = {
    username,
    theme,
    layout: widgets.map(w => ({
      type: w.type,
      width: w.span === 2 ? "full" : "half",
    })),
  };
  const configStr = JSON.stringify(config, null, 2);
  const grid = buildGrid(widgets);

  // 🐱 Card height preview
  const WIDGET_HEIGHTS: Record<string, number> = {
    header: 58, rank: 52, stats: 132, contributions: 50,
    "languages-donut": 80, "languages-list": 80, languages: 100,
    divider: 10, "stat-commits": 22, "stat-prs": 22, "stat-issues": 22,
    "stat-stars": 22, "stat-repos": 22, "stat-experience": 22,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: 'system-ui, -apple-system, sans-serif', color: "#e0e0e0", background: "#0a0a0a" }}>
      {/* Left sidebar */}
      <div style={{ width: 220, background: "#111", borderRight: "1px solid #222", overflowY: "auto", padding: 12, flexShrink: 0 }}>
        <h1 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#fff" }}>GitHub Trophies</h1>

        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Username</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#fff", outline: "none", marginBottom: 8, marginTop: 4 }}
        />

        <label style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Theme</label>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value)}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: "#fff", outline: "none", marginBottom: 16, marginTop: 4 }}
        >
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Widgets</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {CATALOG.map(cat => (
            <button
              key={cat.type}
              onClick={() => addWidget(cat)}
              style={{
                padding: "6px 8px",
                fontSize: 10,
                fontWeight: 600,
                background: cat.color + "22",
                border: `1px solid ${cat.color}44`,
                borderRadius: 4,
                color: cat.color,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#444", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          Canvas — drag to reorder, click size badge to resize
        </div>

        {/* Card preview */}
        <div
          ref={canvasRef}
          style={{
            width: 480,
            background: "#161616",
            borderRadius: 14,
            border: "1px solid #2a2a2a",
            padding: 16,
            minHeight: 200,
          }}
        >
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
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
                    height: Math.max(WIDGET_HEIGHTS[w.type] || 40, 36),
                    background: w.color + "18",
                    border: `1.5px solid ${dragId === w.id ? "#fff" : w.color + "55"}`,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: "grab",
                    position: "relative",
                    transition: "border-color 0.15s, transform 0.15s",
                    transform: dragId === w.id ? "scale(0.96)" : "scale(1)",
                    opacity: dragId === w.id ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: w.color, userSelect: "none" }}>
                    {w.label}
                  </span>
                  <span
                    onClick={() => toggleSpan(w.id)}
                    style={{
                      fontSize: 8,
                      padding: "2px 5px",
                      borderRadius: 3,
                      background: w.span === 2 ? "#1a3a1a" : "#1a2a3a",
                      color: w.span === 2 ? "#4ade80" : "#60a5fa",
                      cursor: "pointer",
                      fontWeight: 700,
                      userSelect: "none",
                    }}
                  >
                    {w.span === 2 ? "FULL" : "HALF"}
                  </span>
                  <button
                    onClick={() => removeWidget(w.id)}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                      fontSize: 10,
                      background: "none",
                      border: "none",
                      color: "#555",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Drop zone at end of row if space */}
              {row.reduce((s, w) => s + w.span, 0) < 2 && (
                <div
                  onDragOver={e => onDragOverSlot(e, ri, 1)}
                  onDrop={e => onDrop(e, ri, 1)}
                  style={{
                    flex: 1,
                    height: 36,
                    border: `1.5px dashed ${dropTarget?.row === ri && dropTarget?.col === 1 ? "#555" : "#222"}`,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#333",
                  }}
                >
                  drop here
                </div>
              )}
            </div>
          ))}

          {/* Drop zone for new row */}
          <div
            onDragOver={e => { e.preventDefault(); setDropTarget({ row: grid.length, col: 0 }); }}
            onDrop={e => onDrop(e, grid.length, 0)}
            style={{
              height: 32,
              border: `1.5px dashed ${dropTarget?.row === grid.length ? "#555" : "#1a1a1a"}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#333",
              marginTop: 4,
            }}
          >
            {widgets.length === 0 ? "Add widgets from sidebar" : "drop to add row"}
          </div>
        </div>

        {/* Config output */}
        <div style={{ width: 480, marginTop: 20 }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              color: "#888",
              cursor: "pointer",
              width: "100%",
            }}
          >
            {showConfig ? "Hide" : "Show"} config.json
          </button>

          {showConfig && (
            <div style={{ marginTop: 8, padding: 16, background: "#0d0d0d", borderRadius: 8, border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>
                Copy this into your forked repo&apos;s <code style={{ color: "#8ec" }}>config.json</code>
              </div>
              <pre style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#8ec", whiteSpace: "pre", userSelect: "all", margin: 0 }}>
                {configStr}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ width: 480, marginTop: 20, fontSize: 11, color: "#444", lineHeight: 1.8, paddingBottom: 40 }}>
          <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Setup</div>
          <ol style={{ paddingLeft: 16, margin: 0 }}>
            <li>Fork <a href="https://github.com/Rhizobium-gits/github-trophies" style={{ color: "#60a5fa" }}>this repo</a></li>
            <li>Replace <code style={{ color: "#8ec" }}>config.json</code> with the config above</li>
            <li>Add <code style={{ color: "#8ec" }}>GH_TOKEN</code> in Settings → Secrets → Actions</li>
            <li>Run the Action or wait 6 hours</li>
            <li>Add <code style={{ color: "#8ec" }}>{"![Stats](./stats.svg)"}</code> to your README</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
