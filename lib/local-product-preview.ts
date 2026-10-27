/** Explicit local review data only. Never catch a production outage with fixtures. */
export function localProductPreview() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.FLORUVI_PRODUCT_PREVIEW === "1"
  );
}
