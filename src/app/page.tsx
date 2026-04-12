"use client";

import { useState } from "react";

const THEMES = ["noir","dracula","one-dark","monokai","tokyo-night","nord","github-dark","catppuccin","gruvbox-dark","solarized-dark","synthwave","cobalt","ayu","material-ocean","rose","night-owl","palenight","shades-of-purple","panda","horizon","vitesse","everforest","kanagawa","fleet","light","github-light","solarized-light","gruvbox-light","catppuccin-latte","light-owl","everforest-light","vitesse-light"];

export default function Home() {
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("noir");
  const [submitted, setSubmitted] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) setSubmitted(username.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: 1, marginBottom: 6 }}>GitHub Trophies</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 32 }}>GitHub stats card for your README</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="GitHub username"
          style={{ padding: "8px 12px", fontSize: 13, background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", outline: "none", width: 180 }} />
        <select value={theme} onChange={e => setTheme(e.target.value)}
          style={{ padding: "8px 12px", fontSize: 13, background: "#111", border: "1px solid #222", borderRadius: 8, color: "#fff", outline: "none" }}>
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit"
          style={{ padding: "8px 16px", fontSize: 13, background: "#fff", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          Generate
        </button>
      </form>

      {submitted && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/stats?username=${submitted}&theme=${theme}&v=${Date.now()}`} alt="Stats" style={{ maxWidth: "100%", borderRadius: 14 }} />
        </div>
      )}
    </div>
  );
}
