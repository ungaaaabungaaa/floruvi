import { storefrontCopy } from "./storefront-copy";
import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type Catalogue = FunctionReturnType<typeof api.catalogue.browse>;
export type CatalogueProduct = Catalogue["products"][number];
export type Product = CatalogueProduct;
export type Category = Catalogue["categories"][number];
export type ProductDetails = FunctionReturnType<typeof api.catalogue.details>;

/** Stored English catalogue text, before display formatting. */
export const getRawCatalogue = cache(() => fetchQuery(api.catalogue.browse, {}));
export const getRawProductDetails = cache((slug: string) =>
  fetchQuery(api.catalogue.details, { slug }),
);

export const getCatalogue = cache(async () => storefrontCopy(await getRawCatalogue()));
export const getProductDetails = cache(async (slug: string) =>
  storefrontCopy(await getRawProductDetails(slug)),
);
