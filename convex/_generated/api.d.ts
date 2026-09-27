/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminAuth from "../adminAuth.js";
import type * as adminHttp from "../adminHttp.js";
import type * as catalogue from "../catalogue.js";
import type * as catalogueData from "../catalogueData.js";
import type * as chat from "../chat.js";
import type * as chatHttp from "../chatHttp.js";
import type * as crons from "../crons.js";
import type * as enquiries from "../enquiries.js";
import type * as http from "../http.js";
import type * as httpUtils from "../httpUtils.js";
import type * as limits from "../limits.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as originalRecipes from "../originalRecipes.js";
import type * as payments from "../payments.js";
import type * as paymentsHttp from "../paymentsHttp.js";
import type * as pricingData from "../pricingData.js";
import type * as productDetailData from "../productDetailData.js";
import type * as productServingNotes from "../productServingNotes.js";
import type * as recipeData from "../recipeData.js";
import type * as recipes from "../recipes.js";
import type * as seed from "../seed.js";
import type * as seedI18n from "../seedI18n.js";
import type * as storefront from "../storefront.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminAuth: typeof adminAuth;
  adminHttp: typeof adminHttp;
  catalogue: typeof catalogue;
  catalogueData: typeof catalogueData;
  chat: typeof chat;
  chatHttp: typeof chatHttp;
  crons: typeof crons;
  enquiries: typeof enquiries;
  http: typeof http;
  httpUtils: typeof httpUtils;
  limits: typeof limits;
  notifications: typeof notifications;
  orders: typeof orders;
  originalRecipes: typeof originalRecipes;
  payments: typeof payments;
  paymentsHttp: typeof paymentsHttp;
  pricingData: typeof pricingData;
  productDetailData: typeof productDetailData;
  productServingNotes: typeof productServingNotes;
  recipeData: typeof recipeData;
  recipes: typeof recipes;
  seed: typeof seed;
  seedI18n: typeof seedI18n;
  storefront: typeof storefront;
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
