"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/chats", label: "Chats" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="admin-nav">
      {tabs.map((tab) => {
        const current = tab.href === "/admin" ? path === "/admin" : path.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} aria-current={current ? "page" : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
