"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/questions", label: "Questions" },
  { href: "/polls",     label: "Polls"     },
];

export default function NavLinks() {
  const path = usePathname();

  return (
    <div style={{
      display: "flex",
      gap: "2px",
      background: "var(--surface)",
      borderRadius: "12px",
      padding: "4px",
    }}>
      {links.map(({ href, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} style={{
            padding: "7px 18px",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 500,
            color: active ? "var(--text)" : "var(--muted)",
            background: active ? "var(--surface2)" : "transparent",
            border: active ? "1px solid var(--border2)" : "1px solid transparent",
            textDecoration: "none",
            transition: "all 0.2s",
          }}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}