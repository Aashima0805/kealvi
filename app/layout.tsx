import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "kealvi — Live Q&A",
  description: "Ask questions, vote, and get AI-powered answers in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />

        <div style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "860px",
          margin: "0 auto",
          padding: "0 20px",
        }}>
          <nav style={{
            padding: "18px 0 14px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
          }}>
           <Link
  href="/"
  style={{
    fontFamily: "'Syne', sans-serif",
    fontSize: "24px",
    fontWeight: 900,
    marginRight: "auto",
    textDecoration: "none",
    display: "inline-block",
  }}
>
  <span
    style={{
      background:
        "linear-gradient(90deg, #3b82f6, #a855f7, #06b6d4)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: 900,
      letterSpacing: "-0.8px",
    }}
  >
    Kealvi
  </span>
</Link>

            <NavLinks />
          </nav>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}