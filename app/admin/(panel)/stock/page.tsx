import type { Metadata } from "next";
import { setStock } from "../../actions";
import { Filters, loadDashboard, rupees, Unavailable } from "../shared";

export const metadata: Metadata = { title: "Stock" };

const shows = { all: "All", in: "In stock", out: "Out of stock" } as const;
const text = (value: string | string[] | undefined) => (typeof value === "string" ? value.slice(0, 80) : "");

export default async function AdminStock({ searchParams }: PageProps<"/admin/stock">) {
  const data = await loadDashboard();
  if (!data) return <Unavailable />;
  const params = await searchParams;
  const q = text(params.q).trim();
  const category = text(params.category);
  const show = params.show === "in" || params.show === "out" ? params.show : "all";
  const categories = [...new Set(data.products.map((p) => p.category))].sort();
  const matches = data.products.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
      (!category || p.category === category),
  );
  const keep = (s: keyof typeof shows) => (p: (typeof data.products)[number]) =>
    s === "all" || p.inStock === (s === "in");
  const products = matches.filter(keep(show));
  const href = (s: string) =>
    `/admin/stock?${new URLSearchParams({ ...(q && { q }), ...(category && { category }), ...(s !== "all" && { show: s }) })}`;
  return (
    <>
      <h1>Stock</h1>
      <p className="admin-muted">Out-of-stock products stay on the site but cannot be bought or requested.</p>
      <form className="admin-search" role="search">
        <label>
          <span className="sr-only">Search products</span>
          <input type="search" name="q" defaultValue={q} placeholder="Search products" />
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select name="category" defaultValue={category}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {show !== "all" && <input type="hidden" name="show" value={show} />}
        <button className="admin-button ghost small">Search</button>
      </form>
      <Filters
        label="Stock status"
        options={Object.entries(shows).map(([key, label]) => ({
          href: href(key),
          label,
          count: matches.filter(keep(key as keyof typeof shows)).length,
          current: key === show,
        }))}
      />
      {products.length === 0 ? (
        <p className="admin-muted">No products match.</p>
      ) : (
        <table className="admin-stock">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Pack & India price</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className={product.inStock ? "" : "is-out"}>
                <th scope="row">
                  {product.name}
                  <small>
                    {product.category}
                    {!product.published && " · hidden"}
                  </small>
                </th>
                <td>
                  {product.price ? `${product.price.packLabel} · ${rupees(product.price.amountMinor)}` : "—"}
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
      )}
    </>
  );
}
