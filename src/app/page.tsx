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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 1, marginBottom: 4, color: "#111" }}>GitHub Trophies</h1>
      <p style={{ fontSize: 14, color: "#999", marginBottom: 40 }}>GitHub stats card for your README</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="GitHub username"
          style={{ padding: "10px 14px", fontSize: 14, background: "#fff", border: "1px solid #ddd", borderRadius: 10, color: "#111", outline: "none", width: 200 }}
        />
        <select
          value={theme}
          onChange={e => setTheme(e.target.value)}
          style={{ padding: "10px 14px", fontSize: 14, background: "#fff", border: "1px solid #ddd", borderRadius: 10, color: "#111", outline: "none" }}
        >
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" style={{ padding: "10px 20px", fontSize: 14, background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>
          Preview
        </button>
      </form>

      {submitted && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 520 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/stats?username=${submitted}&theme=${theme}&v=${Date.now()}`}
            alt="Stats"
            style={{ width: "100%", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
          />
        </div>
      )}

      <div style={{ marginTop: 60, fontSize: 13, color: "#bbb", textAlign: "center", lineHeight: 1.8 }}>
        <a href="https://github.com/Rhizobium-gits/github-trophies" style={{ color: "#888" }}>GitHub</a>
      </div>
    </div>
  );
}
