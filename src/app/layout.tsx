import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Trophies",
  description: "Dynamic GitHub achievement trophies for your README",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', background: "#FAFAFA", color: "#333" }}>
        {children}
      </body>
    </html>
  );
}
