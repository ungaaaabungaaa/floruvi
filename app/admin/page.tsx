import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminApi, adminToken, type Dashboard } from "@/lib/admin";
import { formatCurrency } from "@/lib/i18n/format";
import { logout, setChat, setPayments, setStock } from "./actions";

export const metadata: Metadata = { title: "Orders & stock" };

const rupees = (minor: number) => formatCurrency(minor, "INR", "en-IN");
const orderStatus = {
  created: "Awaiting payment",
  paid: "Paid",
  review: "Check payment",
} as const;

const when = (time: number) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(time);

export default async function AdminHome() {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("dashboard", { token }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok)
    return (
      <main className="admin-page">
        <p className="admin-error" role="alert">
          The admin service is not available. Check ADMIN_API_SECRET in both Vercel and Convex.
        </p>
      </main>
    );
  const data = (await response.json()) as Dashboard;
  const out = data.products.filter((p) => !p.inStock).length;
  // Older backends send neither; the page still works until Convex is deployed.
  const payments = data.payments ?? { enabled: false, keys: false, webhook: false, mode: null };
  const onlineOrders = data.onlineOrders ?? [];
  return (
    <main className="admin-page">
      <header className="admin-top">
        <div>
          <p className="admin-eyebrow">Floruvi Farm</p>
          <h1>Orders & stock</h1>
          <p className="admin-muted">Signed in until {when(data.expiresAt)} IST.</p>
        </div>
        <form action={logout}>
          <button className="admin-button ghost">Sign out</button>
        </form>
      </header>

      <section aria-labelledby="chat-title" className="admin-setting">
        <div>
          <h2 id="chat-title">
            Website chat{" "}
            <Link className="admin-link" href="/admin/chats">
              Open chats →
            </Link>
          </h2>
          <p className="admin-muted">
            {data.chatEnabled
              ? "Visible on the English site versions. Visitors see it within a minute of a change."
              : "Hidden from visitors. Switch it on to show the chat button on the English site versions."}
          </p>
        </div>
        <form action={setChat}>
          <input type="hidden" name="enabled" value={String(!data.chatEnabled)} />
          <button
            className={`admin-switch ${data.chatEnabled ? "on" : "off"}`}
            aria-label={`Website chat is ${data.chatEnabled ? "visible" : "hidden"}. Change.`}
          >
            {data.chatEnabled ? "Visible" : "Hidden"}
          </button>
        </form>
      </section>

      <section aria-labelledby="payments-title" className="admin-setting">
        <div>
          <h2 id="payments-title">
            Online payment
            {payments.mode === "test" && <span className="admin-tag test">Test keys</span>}
          </h2>
          <p className="admin-muted">
            {!payments.keys
              ? "Add the Razorpay keys in Convex first. See docs/29-razorpay-payments.md."
              : payments.enabled
                ? "Customers in India pay by Razorpay at checkout. Export countries still send requests."
                : "Off. Checkout sends requests without payment."}
            {payments.keys && !payments.webhook && " The webhook secret is missing, so closed browser tabs cannot confirm payments."}
            {payments.mode === "test" && " Test keys take no real money."}
          </p>
        </div>
        <form action={setPayments}>
          <input type="hidden" name="enabled" value={String(!payments.enabled)} />
          <button
            className={`admin-switch ${payments.enabled ? "on" : "off"}`}
            disabled={!payments.keys && !payments.enabled}
            aria-label={`Online payment is ${payments.enabled ? "on" : "off"}. Change.`}
          >
            {payments.enabled ? "On" : "Off"}
          </button>
        </form>
      </section>

      <section aria-labelledby="online-title">
        <h2 id="online-title">
          Online orders <span className="admin-count">{onlineOrders.filter((o) => o.status !== "created").length} paid</span>
        </h2>
        <p className="admin-muted">
          Newest first. Deliver only orders marked Paid. Refunds are made in the Razorpay dashboard.
        </p>
        {onlineOrders.length === 0 && <p className="admin-muted">No online orders yet.</p>}
        <ol className="admin-orders">
          {onlineOrders.map((order) => (
            <li key={order.id} className={`admin-order ${order.status === "created" ? "is-waiting" : ""}`}>
              <div className="admin-order-head">
                <strong>{order.reference}</strong>
                <span className={`admin-tag ${order.status}`}>{orderStatus[order.status]}</span>
                {order.mode === "test" && <span className="admin-tag test">Test</span>}
                <strong>{rupees(order.amountMinor)}</strong>
                <time dateTime={new Date(order.createdAt).toISOString()}>{when(order.createdAt)}</time>
              </div>
              <dl>
                <dt>Customer</dt>
                <dd>{order.customer.name}</dd>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${order.customer.phone.replace(/[^\d+]/g, "")}`}>{order.customer.phone}</a>
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
                    <dd>
                      Telegram {order.notifications.telegram}
                    </dd>
                  </>
                )}
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="orders-title">
        <h2 id="orders-title">
          Requests & enquiries <span className="admin-count">{data.orders.length}</span>
        </h2>
        <p className="admin-muted">
          Newest first. These are not paid, so confirm the total and payment by phone. Requests do
          not include a street address; call to confirm it.
        </p>
        {data.orders.length === 0 && <p className="admin-muted">No orders yet.</p>}
        <ol className="admin-orders">
          {data.orders.map((order) => (
            <li key={order.id} className="admin-order">
              <div className="admin-order-head">
                <strong>{order.name}</strong>
                <span className={`admin-tag ${order.kind}`}>
                  {order.kind === "business" ? "Business" : "Home"}
                </span>
                <time dateTime={new Date(order.receivedAt).toISOString()}>{when(order.receivedAt)}</time>
              </div>
              <dl>
                {order.business && (
                  <>
                    <dt>Business</dt>
                    <dd>{order.business}</dd>
                  </>
                )}
                <dt>Phone</dt>
                <dd>{order.phone ? <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a> : "—"}</dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </dd>
                <dt>Delivery area</dt>
                <dd>{order.city}</dd>
                <dt>Interest</dt>
                <dd>{[order.interest, order.quantity].filter(Boolean).join(" · ") || "—"}</dd>
                <dt>Payment</dt>
                <dd>Not paid online</dd>
                <dt>Alerts</dt>
                <dd>
                  Telegram {order.notifications?.telegram ?? "—"}
                </dd>
              </dl>
              <pre className="admin-message">{order.message}</pre>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stock-title">
        <h2 id="stock-title">
          Stock <span className="admin-count">{out} out of stock</span>
        </h2>
        <p className="admin-muted">
          Out-of-stock products stay on the site but cannot be added to a basket or requested.
        </p>
        <table className="admin-stock">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Pack & India price</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((product) => (
              <tr key={product.slug} className={product.inStock ? "" : "is-out"}>
                <th scope="row">
                  {product.name}
                  <small>
                    {product.category}
                    {!product.published && " · hidden"}
                  </small>
                </th>
                <td>
                  {product.price
                    ? `${product.price.packLabel} · ${formatCurrency(product.price.amountMinor, "INR", "en-IN")}`
                    : "—"}
                </td>
                <td>
                  <form action={setStock}>
                    <input type="hidden" name="slug" value={product.slug} />
                    <input type="hidden" name="inStock" value={String(!product.inStock)} />
                    <button
                      className={`admin-switch ${product.inStock ? "on" : "off"}`}
                      aria-label={`${product.name}: ${product.inStock ? "in stock" : "out of stock"}. Change.`}
                    >
                      {product.inStock ? "In stock" : "Out of stock"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
