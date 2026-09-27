import type { Metadata } from "next";
import { Filters, loadDashboard, rupees, telLink, Unavailable, when } from "../shared";

export const metadata: Metadata = { title: "Orders" };

const orderStatus = {
  created: "Awaiting payment",
  paid: "Paid",
  review: "Check payment",
} as const;

type Order = NonNullable<Awaited<ReturnType<typeof loadDashboard>>>["onlineOrders"][number];

const needsCheck = (o: Order) => o.status === "review" || o.extraPayments.length > 0;
const views = {
  all: { label: "All", keep: () => true },
  paid: { label: "Paid", keep: (o: Order) => o.status === "paid" },
  check: { label: "Check payment", keep: needsCheck },
  created: { label: "Awaiting payment", keep: (o: Order) => o.status === "created" },
} as const;

export default async function AdminOrders({ searchParams }: PageProps<"/admin/orders">) {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const { status } = await searchParams;
  const view = typeof status === "string" && status in views ? (status as keyof typeof views) : "all";
  const orders = data.onlineOrders.filter(views[view].keep);
  return (
    <>
      <h1>Orders</h1>
      <p className="admin-muted">Paid online. Deliver only Paid orders. Refund in Razorpay.</p>
      <Filters
        label="Order status"
        options={Object.entries(views).map(([key, v]) => ({
          href: key === "all" ? "/admin/orders" : `/admin/orders?status=${key}`,
          label: v.label,
          count: data.onlineOrders.filter(v.keep).length,
          current: key === view,
        }))}
      />
      {orders.length === 0 && <p className="admin-muted">No orders here yet.</p>}
      <ol className="admin-orders">
        {orders.map((order) => (
          <li key={order.id}>
            <details className={`admin-order ${order.status === "created" ? "is-waiting" : ""}`}>
              <summary className="admin-order-head">
                <strong>{order.reference}</strong>
                <span className={`admin-tag ${order.status}`}>{orderStatus[order.status]}</span>
                {order.mode === "test" && <span className="admin-tag test">Test</span>}
                {needsCheck(order) && order.status !== "review" && (
                  <span className="admin-tag review">Paid twice</span>
                )}
                <span>{order.customer.name}</span>
                <strong>{rupees(order.amountMinor)}</strong>
                <time dateTime={new Date(order.createdAt).toISOString()}>{when(order.createdAt)}</time>
              </summary>
              <dl>
                <dt>Phone</dt>
                <dd>
                  <a href={telLink(order.customer.phone)}>{order.customer.phone}</a>
                </dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                </dd>
                <dt>Address</dt>
                <dd>
                  {order.delivery.address || "Not given. Call to confirm."}
                  <br />
                  {[order.delivery.city, order.delivery.region, order.delivery.pincode].join(", ")}
                </dd>
                {order.delivery.notes && (
                  <>
                    <dt>Notes</dt>
                    <dd>{order.delivery.notes}</dd>
                  </>
                )}
                <dt>Items</dt>
                <dd>
                  {order.items.map((item) => (
                    <span key={item.slug} className="admin-line">
                      {item.name} × {item.quantity}
                      {item.packLabel && ` (${item.packLabel})`}: {rupees(item.lineMinor)}
                    </span>
                  ))}
                  {order.deliveryMinor > 0 && (
                    <span className="admin-line">Delivery: {rupees(order.deliveryMinor)}</span>
                  )}
                </dd>
                <dt>Payment</dt>
                <dd>
                  {order.payment
                    ? `${order.payment.id}${order.payment.method ? ` · ${order.payment.method}` : ""} · ${when(order.payment.capturedAt)}`
                    : order.lastFailure
                      ? `Not paid. Last attempt failed: ${order.lastFailure}`
                      : "Not paid"}
                  {order.status === "review" && (
                    <span className="admin-line admin-warning">
                      The captured amount did not match this order. Check it in Razorpay before delivery.
                    </span>
                  )}
                  {order.extraPayments.length > 0 && (
                    <span className="admin-line admin-warning">
                      Paid more than once. Refund in Razorpay: {order.extraPayments.join(", ")}
                    </span>
                  )}
                </dd>
                {order.notifications && (
                  <>
                    <dt>Alerts</dt>
                    <dd>Telegram {order.notifications.telegram}</dd>
                  </>
                )}
              </dl>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
