"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="aurora" />
          <div className="particles" />
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block px-3 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-gray-200 dark:bg-gray-800 font-medium"
        : "hover:bg-gray-100 dark:hover:bg-gray-900"
    }`;
useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    const ripple = document.createElement("span");

    ripple.className = "ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;

    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 700);
  };

  window.addEventListener("click", handleClick);

  return () => window.removeEventListener("click", handleClick);
}, []);
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[var(--border)] p-4 space-y-4 bg-[var(--card)]">
        <h2 className="text-xl font-bold">My App</h2>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/" className={linkClass("/")}>
            🏠 Welcome
          </Link>

          <Link href="/questions" className={linkClass("/questions")}>
            ❓ Questions
          </Link>

          <Link href="/polls" className={linkClass("/polls")}>
            📊 Polls
          </Link>
        </nav>
      </aside>

     <motion.main
  key={pathname}
  className="flex-1 p-6"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.25 }}
>
  {children}
</motion.main>

    </div>
  );
}