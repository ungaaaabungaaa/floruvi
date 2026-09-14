import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type Catalogue = FunctionReturnType<typeof api.catalogue.browse>;
export type Product = Catalogue["products"][number];
export type Category = Catalogue["categories"][number];
export const getCatalogue = cache(() => fetchQuery(api.catalogue.browse, {}));
