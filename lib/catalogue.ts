import { storefrontCopy } from "./storefront-copy";
import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type Catalogue = FunctionReturnType<typeof api.catalogue.browse>;
export type Product = Catalogue["products"][number];
export type Category = Catalogue["categories"][number];
export const getCatalogue = cache(async () => storefrontCopy(await fetchQuery(api.catalogue.browse, {})));

export const getProductDetails = cache(async (slug: string) =>
  storefrontCopy(await fetchQuery(api.catalogue.details, { slug })),
);
