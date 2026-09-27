import type { Metadata } from "next";
import Link from "next/link";
import { loadDashboard, Unavailable } from "./shared";

export const metadata: Metadata = { title: "Overview" };

/** Counts that need the owner, each linked to the page where they act on it. */
export default async function AdminOverview() {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const since = data.weekAgo;
  const live = data.onlineOrders.filter((o) => o.mode !== "test");
  const check = data.onlineOrders.filter((o) => o.status === "review" || o.extraPayments.length > 0);
  const tiles = [
    {
      href: "/admin/orders?status=paid",
      count: live.filter((o) => o.status === "paid" && o.createdAt > since).length,
      label: "Paid orders",
      hint: "Last 7 days",
    },
    {
      href: "/admin/orders?status=check",
      count: check.length,
      label: "Check payment",
      hint: "Amount did not match, or paid twice",
      warn: check.length > 0,
    },
    {
      href: "/admin/requests",
      count: data.orders.filter((o) => o.receivedAt > since).length,
      label: "Requests",
      hint: "Last 7 days. Not paid",
    },
    ...(typeof data.chatsWaiting === "number"
      ? [
          {
            href: "/admin/chats",
            count: data.chatsWaiting,
            label: "Chats waiting",
            hint: "You answer these",
            warn: data.chatsWaiting > 0,
          },
        ]
      : []),
    {
      href: "/admin/stock?show=out",
      count: data.products.filter((p) => !p.inStock).length,
      label: "Out of stock",
      hint: `Of ${data.products.length} products`,
    },
  ];
  return (
    <>
      <h1>Overview</h1>
      <ul className="admin-tiles">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link href={tile.href} className={tile.warn ? "is-warn" : undefined}>
              <strong>{tile.count}</strong>
              <span>{tile.label}</span>
              <small>{tile.hint}</small>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="admin-subtitle">Switches</h2>
      <ul className="admin-status">
        <li>
          Website chat:{" "}
          <span className={`admin-tag ${data.chatEnabled ? "paid" : "created"}`}>
            {data.chatEnabled ? "Visible" : "Hidden"}
          </span>
        </li>
        <li>
          Online payment:{" "}
          <span className={`admin-tag ${data.payments.enabled ? "paid" : "created"}`}>
            {data.payments.enabled ? "On" : "Off"}
          </span>
          {data.payments.mode === "test" && <span className="admin-tag test">Test keys</span>}
        </li>
        <li>
          <Link className="admin-link" href="/admin/settings">
            Change in Settings →
          </Link>
        </li>
      </ul>
    </>
  );
}
