/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalogue from "../catalogue.js";
import type * as catalogueData from "../catalogueData.js";
import type * as enquiries from "../enquiries.js";
import type * as http from "../http.js";
import type * as originalRecipes from "../originalRecipes.js";
import type * as pricingData from "../pricingData.js";
import type * as productDetailData from "../productDetailData.js";
import type * as productServingNotes from "../productServingNotes.js";
import type * as recipeData from "../recipeData.js";
import type * as recipes from "../recipes.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  catalogue: typeof catalogue;
  catalogueData: typeof catalogueData;
  enquiries: typeof enquiries;
  http: typeof http;
  originalRecipes: typeof originalRecipes;
  pricingData: typeof pricingData;
  productDetailData: typeof productDetailData;
  productServingNotes: typeof productServingNotes;
  recipeData: typeof recipeData;
  recipes: typeof recipes;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
