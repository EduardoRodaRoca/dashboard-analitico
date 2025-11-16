"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./sidebar-nav";

type Props = {
  items: NavItem[];
};

export function Breadcrumbs({ items }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) {
    return null;
  }

  const crumbs = segments.map((_, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = items.find((item) => item.href === href)?.label ?? segments[index];
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
        <li>
          <Link href="/admin" className="hover:text-rose-600">
            Panel
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            {index === crumbs.length - 1 ? (
              <span className="text-rose-600">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-rose-600">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
