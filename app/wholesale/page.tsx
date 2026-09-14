import { redirect } from "next/navigation";
export default async function Wholesale({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  redirect(
    typeof product === "string"
      ? `/contact?product=${encodeURIComponent(product)}`
      : "/contact",
  );
}
