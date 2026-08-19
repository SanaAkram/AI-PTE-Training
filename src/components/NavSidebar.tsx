"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  ur: string;
  en: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", ur: "آج", en: "Today", icon: "🏠" },
  { href: "/practice", ur: "مشق", en: "Practice", icon: "🎯" },
  { href: "/mock-test", ur: "موک ٹیسٹ", en: "Mock Test", icon: "⏱️" },
  { href: "/my-words", ur: "میرے الفاظ", en: "My Words", icon: "📚" },
  { href: "/dashboard", ur: "پیش رفت", en: "Progress", icon: "📊" },
];

/** Mobile-only: hamburger trigger + slide-in drawer. Desktop gets a plain
 * inline nav instead (see DesktopNav below) — no need for a drawer there. */
export function NavSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 rounded-full border border-line flex items-center justify-center text-lg shrink-0"
        aria-label="مینو کھولیں / Open menu"
      >
        ☰
      </button>

      {/* Always mounted so open/close both animate smoothly. */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-surface border-l border-line shadow-2xl flex flex-col p-4 gap-1 transition-transform duration-200 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="ur text-lg font-display font-bold">مینو</span>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center"
              aria-label="بند کریں / Close"
            >
              ✕
            </button>
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-right ${
                pathname === item.href ? "bg-surface-alt" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="ur text-base">{item.ur}</div>
                <div className="en text-[0.65rem] font-bold text-ink-soft">{item.en}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/** Desktop-only plain inline nav — no drawer, no client state needed beyond
 * highlighting the active link. */
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-full hover:bg-surface-alt ${
            pathname === item.href ? "bg-surface-alt text-accent-deep" : "text-ink-soft"
          }`}
        >
          {item.icon} {item.ur} / {item.en}
        </Link>
      ))}
    </nav>
  );
}
