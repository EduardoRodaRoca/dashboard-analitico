"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  summary: string;
};

type Props = {
  items: NavItem[];
};

const baseClasses =
  "group block rounded-2xl border px-4 py-3 text-sm font-medium transition-all";
const inactiveClasses =
  "border-transparent text-slate-600 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700";
const activeClasses = "border-rose-200 bg-rose-50 text-rose-700";

export function SidebarNav({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
          >
            <p className="text-base font-semibold">{item.label}</p>
            <p className="text-xs text-slate-500">{item.summary}</p>
          </Link>
        );
      })}
    </nav>
  );
}
