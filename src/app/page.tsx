"use client";

import { useState } from "react";

const THEMES = [
  { name: "noir", label: "Noir" },
  { name: "dracula", label: "Dracula" },
  { name: "one-dark", label: "One Dark" },
  { name: "monokai", label: "Monokai" },
  { name: "tokyo-night", label: "Tokyo Night" },
  { name: "nord", label: "Nord" },
  { name: "github-dark", label: "GitHub Dark" },
  { name: "catppuccin", label: "Catppuccin" },
  { name: "gruvbox-dark", label: "Gruvbox Dark" },
  { name: "solarized-dark", label: "Solarized Dark" },
  { name: "synthwave", label: "Synthwave" },
  { name: "cobalt", label: "Cobalt" },
  { name: "ayu", label: "Ayu" },
  { name: "material-ocean", label: "Material Ocean" },
  { name: "rose", label: "Rose" },
  { name: "light", label: "Light" },
  { name: "github-light", label: "GitHub Light" },
  { name: "solarized-light", label: "Solarized Light" },
  { name: "gruvbox-light", label: "Gruvbox Light" },
  { name: "catppuccin-latte", label: "Catppuccin Latte" },
];

export default function Home() {
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("noir");
  const [submitted, setSubmitted] = useState("");
  const [submittedTheme, setSubmittedTheme] = useState("noir");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      setSubmitted(trimmed);
      setSubmittedTheme(theme);
    }
  };

  const S = {
    page: { maxWidth: 720, margin: "0 auto", padding: "60px 20px", fontFamily: 'system-ui, -apple-system, sans-serif', color: "#333" } as const,
    h1: { fontSize: 28, fontWeight: 300, letterSpacing: 1, marginBottom: 4 } as const,
    sub: { fontSize: 14, opacity: 0.5, marginBottom: 32 } as const,
    form: { display: "flex", gap: 8, marginBottom: 16 } as const,
    input: { flex: 1, padding: "10px 14px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", background: "#fff" } as const,
    btn: { padding: "10px 20px", fontSize: 14, background: "#24292f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" } as const,
    select: { padding: "10px 14px", fontSize: 13, border: "1px solid #ddd", borderRadius: 8, outline: "none", background: "#fff", marginBottom: 32 } as const,
    section: { fontSize: 13, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 32 },
    code: { display: "block", padding: 12, background: "#f0f0f0", borderRadius: 8, fontSize: 12, overflowX: "auto" as const, whiteSpace: "pre" as const, userSelect: "all" as const, marginBottom: 16 },
  };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>GitHub Trophies</h1>
      <p style={S.sub}>Dynamic GitHub stats card with devicon logos, activity graph, and 20 themes</p>

      <form onSubmit={handleSubmit} style={S.form}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="GitHub username" style={S.input} />
        <button type="submit" style={S.btn}>Generate</button>
      </form>

      <select value={theme} onChange={(e) => setTheme(e.target.value)} style={S.select}>
        {THEMES.map((t) => (<option key={t.name} value={t.name}>{t.label}</option>))}
      </select>

      {submitted && (
        <div>
          <h2 style={S.section}>Preview</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${submitted}-${submittedTheme}`}
            src={`/api/stats?username=${submitted}&theme=${submittedTheme}`}
            alt="Stats"
            style={{ maxWidth: "100%", borderRadius: 14, marginBottom: 24 }}
          />

          <h2 style={S.section}>Copy for your README</h2>
          <code style={S.code}>
            {`![GitHub Stats](${baseUrl}/api/stats?username=${submitted}&theme=${submittedTheme})`}
          </code>

          <h2 style={S.section}>All themes for @{submitted}</h2>
          {THEMES.map((t) => (
            <div key={t.name} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, marginBottom: 4 }}>{t.label}</div>
              <code style={S.code}>
                {`![GitHub Stats](${baseUrl}/api/stats?username=${submitted}&theme=${t.name})`}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
