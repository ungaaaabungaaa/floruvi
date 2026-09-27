import type { Metadata } from "next";
import { Filters, loadDashboard, telLink, Unavailable, when } from "../shared";

export const metadata: Metadata = { title: "Requests" };

const kinds = { all: "All", home: "Home", business: "Business" } as const;

export default async function AdminRequests({ searchParams }: PageProps<"/admin/requests">) {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const { kind } = await searchParams;
  const view = typeof kind === "string" && kind in kinds ? (kind as keyof typeof kinds) : "all";
  const keep = (k: keyof typeof kinds) => (o: (typeof data.orders)[number]) =>
    k === "all" || (k === "business") === (o.kind === "business");
  const requests = data.orders.filter(keep(view));
  return (
    <>
      <h1>Requests & enquiries</h1>
      <p className="admin-muted">Not paid and no street address. Call to confirm the total and address.</p>
      <Filters
        label="Request type"
        options={Object.entries(kinds).map(([key, label]) => ({
          href: key === "all" ? "/admin/requests" : `/admin/requests?kind=${key}`,
          label,
          count: data.orders.filter(keep(key as keyof typeof kinds)).length,
          current: key === view,
        }))}
      />
      {requests.length === 0 && <p className="admin-muted">No requests here yet.</p>}
      <ol className="admin-orders">
        {requests.map((order) => (
          <li key={order.id}>
            <details className="admin-order">
              <summary className="admin-order-head">
                <strong>{order.name}</strong>
                <span className={`admin-tag ${order.kind}`}>
                  {order.kind === "business" ? "Business" : "Home"}
                </span>
                <span>{order.city}</span>
                <time dateTime={new Date(order.receivedAt).toISOString()}>{when(order.receivedAt)}</time>
              </summary>
              <dl>
                {order.business && (
                  <>
                    <dt>Business</dt>
                    <dd>{order.business}</dd>
                  </>
                )}
                <dt>Phone</dt>
                <dd>{order.phone ? <a href={telLink(order.phone)}>{order.phone}</a> : "—"}</dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </dd>
                <dt>Interest</dt>
                <dd>{[order.interest, order.quantity].filter(Boolean).join(" · ") || "—"}</dd>
                <dt>Alerts</dt>
                <dd>Telegram {order.notifications?.telegram ?? "—"}</dd>
              </dl>
              <pre className="admin-message">{order.message}</pre>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
