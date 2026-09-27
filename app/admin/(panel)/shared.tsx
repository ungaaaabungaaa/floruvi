import Link from "next/link";
import { redirect } from "next/navigation";
import { adminApi, adminToken, type Dashboard } from "@/lib/admin";
import { formatCurrency } from "@/lib/i18n/format";

// Shared by the admin panel pages. Each page checks the session itself;
// the layout only draws the navigation.

export const rupees = (minor: number) => formatCurrency(minor, "INR", "en-IN");

export const when = (time: number) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(time);

const WEEK = 7 * 24 * 60 * 60 * 1000;

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** The dashboard data, or null when the backend is not reachable. Redirects when signed out. */
export async function loadDashboard() {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("dashboard", { token }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok) return null;
  const data = (await response.json()) as Dashboard;
  // Older backends send neither; the pages still work until Convex is deployed.
  return {
    ...data,
    payments: data.payments ?? { enabled: false, keys: false, webhook: false, mode: null },
    onlineOrders: data.onlineOrders ?? [],
    // Start of the "last 7 days" counts, taken when the request is served.
    weekAgo: Date.now() - WEEK,
  };
}

export function Unavailable() {
  return (
    <p className="admin-error" role="alert">
      The admin service is not available. Check ADMIN_API_SECRET in both Vercel and Convex.
    </p>
  );
}

/** A row of filter links. The current one is marked for screen readers and styled. */
export function Filters({
  label,
  options,
}: {
  label: string;
  options: { href: string; label: string; count?: number; current: boolean }[];
}) {
  return (
    <nav aria-label={label} className="admin-filters">
      {options.map((option) => (
        <Link key={option.href} href={option.href} aria-current={option.current ? "page" : undefined}>
          {option.label}
          {option.count !== undefined && <span>{option.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
