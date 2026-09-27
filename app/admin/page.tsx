import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminApi, adminToken, type Dashboard } from "@/lib/admin";
import { formatCurrency } from "@/lib/i18n/format";
import { logout, setChat, setStock } from "./actions";

export const metadata: Metadata = { title: "Orders & stock" };

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
          <h2 id="chat-title">Website chat</h2>
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

      <section aria-labelledby="orders-title">
        <h2 id="orders-title">
          Orders & enquiries <span className="admin-count">{data.orders.length}</span>
        </h2>
        <p className="admin-muted">
          Newest first. Payment is not taken online yet, so confirm the total and payment by phone.
          Checkout does not ask for a street address; call to confirm it.
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
                  Telegram {order.notifications?.telegram ?? "—"} · Email {order.notifications?.email ?? "—"}
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
