import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/server";
import { localizePath } from "@/lib/i18n/config";

export default async function Wholesale({
  searchParams,
}: PageProps<"/[locale]/wholesale">) {
  const [{ locale }, { product }] = await Promise.all([getLocale(), searchParams]);
  redirect(
    localizePath(
      locale,
      typeof product === "string"
        ? `/contact?product=${encodeURIComponent(product)}`
        : "/contact",
    ),
  );
}
