"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { adminLoginSchema, verifyAdminCredentials } from "../lib/admin-credentials";

/** scrypt needs Node. ADMIN_CREDENTIAL_HASH comes from `pnpm admin:hash`. */
export const verify = internalAction({
  args: {
    email: v.string(),
    aadhaar: v.string(),
    dob: v.string(),
    phone: v.string(),
    password: v.string(),
  },
  handler: async (_ctx, args) => {
    const stored = process.env.ADMIN_CREDENTIAL_HASH;
    const login = adminLoginSchema.safeParse(args);
    if (!stored || !login.success) return false;
    return verifyAdminCredentials(login.data, stored);
  },
});
