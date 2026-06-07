"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeCard({ card }: any) {
  const [hover, setHover] = useState(false);

  return (
    <Link href={card.href} style={{ textDecoration: "none" }}>
      <div
  style={{
    height: "160px",
    padding: "20px",
    borderRadius: "16px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    /* ✨ ANIMATION */
    transition: "all 0.25s ease",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
    e.currentTarget.style.boxShadow =
      "0 10px 30px rgba(59,130,246,0.25)";
    e.currentTarget.style.border = "1px solid rgba(59,130,246,0.4)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.border = "1px solid var(--border)";
  }}
>
        <div>
  <div style={{ fontSize: "26px" }}>{card.icon}</div>

  <h3 style={{ fontWeight: "700", marginTop: "10px" }}>
    {card.title}
  </h3>

  <p style={{ opacity: 0.7, fontSize: "14px" }}>
    {card.desc}
  </p>
</div>
      </div>
    </Link>
  );
}