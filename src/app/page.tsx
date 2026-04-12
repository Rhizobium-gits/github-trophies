"use client";

import { useState, useCallback } from "react";

// 🐱 Available widget types
interface Widget {
  id: string;
  type: string;
  label: string;
  width: "full" | "half";
  description: string;
}

const WIDGET_CATALOG: Omit<Widget, "id" | "width">[] = [
  { type: "header", label: "Profile Header", description: "Avatar, name, bio" },
  { type: "rank", label: "Rank Circle", description: "Overall rank (S ~ C)" },
  { type: "stats", label: "Stats (All)", description: "Commits, PRs, Issues, Stars, Repos, Experience" },
  { type: "stat-commits", label: "Commits", description: "Total commit count" },
  { type: "stat-prs", label: "Pull Requests", description: "Total PR count" },
  { type: "stat-issues", label: "Issues", description: "Total issue count" },
  { type: "stat-stars", label: "Stars", description: "Total stars earned" },
  { type: "stat-repos", label: "Repositories", description: "Public repo count" },
  { type: "stat-experience", label: "Experience", description: "Years on GitHub" },
  { type: "contributions", label: "Contributions", description: "1-year contribution graph" },
  { type: "languages-donut", label: "Languages (Donut)", description: "Donut chart of top languages" },
  { type: "languages-list", label: "Languages (List)", description: "Language list with percentages" },
  { type: "languages", label: "Languages (Full)", description: "Donut chart + list combined" },
  { type: "divider", label: "Divider", description: "Horizontal line separator" },
];

const THEMES = [
  "noir","dracula","one-dark","monokai","tokyo-night","nord","github-dark","catppuccin",
  "gruvbox-dark","solarized-dark","synthwave","cobalt","ayu","material-ocean","rose",
  "night-owl","palenight","shades-of-purple","panda","horizon","vitesse","everforest",
  "kanagawa","fleet","light","github-light","solarized-light","gruvbox-light",
  "catppuccin-latte","light-owl","everforest-light","vitesse-light",
];

let nextId = 1;
function makeId() { return `w${nextId++}`; }

// 🐱 Default layout
const DEFAULT_WIDGETS: Widget[] = [
  { id: makeId(), type: "header", label: "Profile Header", width: "full", description: "" },
  { id: makeId(), type: "rank", label: "Rank Circle", width: "half", description: "" },
  { id: makeId(), type: "stats", label: "Stats (All)", width: "full", description: "" },
  { id: makeId(), type: "contributions", label: "Contributions", width: "full", description: "" },
  { id: makeId(), type: "languages", label: "Languages (Full)", width: "full", description: "" },
];

export default function Editor() {
  const [username, setUsername] = useState("Rhizobium-gits");
  const [theme, setTheme] = useState("noir");
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // 🐱 Add widget from catalog
  const addWidget = useCallback((catalogItem: typeof WIDGET_CATALOG[0]) => {
    setWidgets(prev => [...prev, {
      id: makeId(),
      type: catalogItem.type,
      label: catalogItem.label,
      width: "full",
      description: catalogItem.description,
    }]);
  }, []);

  // 🐱 Remove widget
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  // 🐱 Toggle width
  const toggleWidth = useCallback((id: string) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, width: w.width === "full" ? "half" : "full" } : w
    ));
  }, []);

  // 🐱 Move widget up/down
  const moveWidget = useCallback((id: string, dir: -1 | 1) => {
    setWidgets(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }, []);

  // 🐱 Drag and drop reorder
  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    setWidgets(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(w => w.id === dragging);
      const toIdx = arr.findIndex(w => w.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };
  const handleDragEnd = () => setDragging(null);

  // 🐱 Generate config
  const config = {
    username,
    theme,
    layout: widgets.map(w => ({ type: w.type, width: w.width })),
  };
  const configStr = JSON.stringify(config, null, 2);

  const S = {
    page: { display: "flex", height: "100vh", fontFamily: 'system-ui, -apple-system, sans-serif', color: "#e0e0e0", background: "#111" } as const,
    sidebar: { width: 260, background: "#1a1a1a", borderRight: "1px solid #2a2a2a", overflowY: "auto" as const, padding: 16, flexShrink: 0 } as const,
    main: { flex: 1, overflowY: "auto" as const, padding: 24 } as const,
    h1: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#fff" } as const,
    h2: { fontSize: 13, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1, color: "#666", marginTop: 20, marginBottom: 8 } as const,
    input: { width: "100%", padding: "8px 10px", fontSize: 13, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#fff", outline: "none", marginBottom: 8 } as const,
    select: { width: "100%", padding: "8px 10px", fontSize: 13, background: "#222", border: "1px solid #333", borderRadius: 6, color: "#fff", outline: "none", marginBottom: 12 } as const,
    catalogItem: { padding: "8px 10px", background: "#222", borderRadius: 6, marginBottom: 4, cursor: "pointer", fontSize: 12, border: "1px solid #2a2a2a", transition: "border-color 0.15s" } as const,
    widget: { padding: "10px 12px", background: "#1a1a1a", borderRadius: 8, marginBottom: 6, border: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 8, cursor: "grab", fontSize: 13 } as const,
    btn: { padding: "4px 8px", fontSize: 11, background: "#333", border: "none", borderRadius: 4, color: "#aaa", cursor: "pointer" } as const,
    btnDanger: { padding: "4px 8px", fontSize: 11, background: "#3a1a1a", border: "none", borderRadius: 4, color: "#f87171", cursor: "pointer" } as const,
    tag: { padding: "2px 6px", fontSize: 10, borderRadius: 3, fontWeight: 600 } as const,
    configBox: { padding: 16, background: "#0a0a0a", borderRadius: 8, border: "1px solid #2a2a2a", marginTop: 16 } as const,
    code: { fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#8ec", whiteSpace: "pre" as const, userSelect: "all" as const } as const,
  };

  return (
    <div style={S.page}>
      {/* Sidebar: config + widget catalog */}
      <div style={S.sidebar}>
        <h1 style={S.h1}>GitHub Trophies</h1>

        <h2 style={S.h2}>Settings</h2>
        <input
          style={S.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="GitHub username"
        />
        <select style={S.select} value={theme} onChange={e => setTheme(e.target.value)}>
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <h2 style={S.h2}>Add Widget</h2>
        {WIDGET_CATALOG.map(item => (
          <div
            key={item.type}
            style={S.catalogItem}
            onClick={() => addWidget(item)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#555")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
          >
            <div style={{ fontWeight: 600 }}>+ {item.label}</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{item.description}</div>
          </div>
        ))}
      </div>

      {/* Main: canvas + output */}
      <div style={S.main}>
        <h2 style={S.h2}>Layout</h2>
        <p style={{ fontSize: 11, color: "#555", marginBottom: 12 }}>
          Drag to reorder. Click size to toggle full/half width.
        </p>

        {/* Widget list */}
        <div style={{ maxWidth: 600 }}>
          {widgets.map((w, i) => (
            <div
              key={w.id}
              style={{
                ...S.widget,
                opacity: dragging === w.id ? 0.4 : 1,
                borderColor: dragging === w.id ? "#555" : "#2a2a2a",
                width: w.width === "half" ? "48%" : "100%",
                display: "inline-flex",
                marginRight: w.width === "half" ? "2%" : 0,
                verticalAlign: "top",
              }}
              draggable
              onDragStart={() => handleDragStart(w.id)}
              onDragOver={e => handleDragOver(e, w.id)}
              onDragEnd={handleDragEnd}
            >
              <span style={{ color: "#555", cursor: "grab" }}>⠿</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{w.label}</span>
              <span
                style={{
                  ...S.tag,
                  background: w.width === "full" ? "#1a3a1a" : "#1a2a3a",
                  color: w.width === "full" ? "#4ade80" : "#60a5fa",
                  cursor: "pointer",
                }}
                onClick={() => toggleWidth(w.id)}
              >
                {w.width}
              </span>
              <button style={S.btn} onClick={() => moveWidget(w.id, -1)}>↑</button>
              <button style={S.btn} onClick={() => moveWidget(w.id, 1)}>↓</button>
              <button style={S.btnDanger} onClick={() => removeWidget(w.id)}>×</button>
            </div>
          ))}

          {widgets.length === 0 && (
            <div style={{ color: "#555", fontSize: 13, padding: 20, textAlign: "center" }}>
              Add widgets from the sidebar
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ marginTop: 24 }}>
          <button
            style={{ ...S.btn, padding: "8px 16px", fontSize: 13, background: "#2a2a2a" }}
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? "Hide" : "Show"} config.json
          </button>

          {showConfig && (
            <div style={S.configBox}>
              <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
                This content goes into your <code>config.json</code>:
              </p>
              <div style={S.code}>{configStr}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 24, fontSize: 12, color: "#555", lineHeight: 1.8 }}>
          <h2 style={S.h2}>How to use</h2>
          <ol style={{ paddingLeft: 20 }}>
            <li>Fork the <a href="https://github.com/Rhizobium-gits/github-trophies" style={{ color: "#60a5fa" }}>repository</a></li>
            <li>Replace <code style={{ color: "#8ec" }}>config.json</code> with the generated config above</li>
            <li>Add <code style={{ color: "#8ec" }}>GH_TOKEN</code> secret in repo Settings &gt; Secrets &gt; Actions</li>
            <li>Run the Action manually or wait 6 hours</li>
            <li>Add <code style={{ color: "#8ec" }}>![Stats](./stats.svg)</code> to your README</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
