"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) setSubmitted(trimmed);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 1, marginBottom: 4 }}>GitHub Trophies</h1>
      <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 32 }}>
        Dynamic achievement trophies & language stats for your GitHub README
      </p>

      {/* Search */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "1px solid #ddd", borderRadius: 8, outline: "none", background: "#fff" }}
        />
        <button type="submit" style={{ padding: "10px 20px", fontSize: 14, background: "#24292f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Generate
        </button>
      </form>

      {submitted && (
        <div>
          {/* Preview */}
          <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, marginBottom: 12 }}>Preview</h2>

          <div style={{ marginBottom: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/trophies?username=${submitted}`} alt="Trophies" style={{ maxWidth: "100%", borderRadius: 12 }} />
          </div>
          <div style={{ marginBottom: 32 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/languages?username=${submitted}`} alt="Languages" style={{ maxWidth: "100%", borderRadius: 10 }} />
          </div>

          {/* Markdown snippets */}
          <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, marginBottom: 12 }}>Add to your README</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Trophies</label>
            <code style={{ display: "block", padding: 12, background: "#f0f0f0", borderRadius: 8, fontSize: 12, overflowX: "auto", whiteSpace: "pre", userSelect: "all" }}>
              {`![GitHub Trophies](${baseUrl}/api/trophies?username=${submitted})`}
            </code>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Trophies (dark theme)</label>
            <code style={{ display: "block", padding: 12, background: "#f0f0f0", borderRadius: 8, fontSize: 12, overflowX: "auto", whiteSpace: "pre", userSelect: "all" }}>
              {`![GitHub Trophies](${baseUrl}/api/trophies?username=${submitted}&theme=dark)`}
            </code>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Languages</label>
            <code style={{ display: "block", padding: 12, background: "#f0f0f0", borderRadius: 8, fontSize: 12, overflowX: "auto", whiteSpace: "pre", userSelect: "all" }}>
              {`![Languages](${baseUrl}/api/languages?username=${submitted})`}
            </code>
          </div>

          {/* Params */}
          <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, marginTop: 40, marginBottom: 12 }}>Parameters</h2>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Endpoint</th>
                <th style={{ padding: "8px 12px" }}>Param</th>
                <th style={{ padding: "8px 12px" }}>Default</th>
                <th style={{ padding: "8px 12px" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["/api/trophies", "username", "(required)", "GitHub username"],
                ["/api/trophies", "cols", "4", "Columns (1-8)"],
                ["/api/trophies", "theme", "default", "default / dark"],
                ["/api/languages", "username", "(required)", "GitHub username"],
                ["/api/languages", "limit", "8", "Languages shown (1-20)"],
                ["/api/languages", "theme", "default", "default / dark"],
              ].map(([ep, param, def, desc], i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 11 }}>{ep}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace", fontSize: 11 }}>{param}</td>
                  <td style={{ padding: "6px 12px", opacity: 0.6 }}>{def}</td>
                  <td style={{ padding: "6px 12px" }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
