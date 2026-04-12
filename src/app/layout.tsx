import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Trophies",
  description: "GitHub stats card for your README",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', background: "#fafafa", color: "#111" }}>
        {children}
      </body>
    </html>
  );
}
