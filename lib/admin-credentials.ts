import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// Node-only (Convex "use node" actions, scripts and tests). The owner's details
// are hashed together, so a leaked hash cannot be cracked one weak field at a time.

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  aadhaar: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{12}$/)),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").replace(/^(?:91|0)(?=\d{10}$)/, ""))
    .pipe(z.string().regex(/^\d{10}$/)),
  password: z.string().min(1).max(200),
});
export type AdminLogin = z.infer<typeof adminLoginSchema>;

const canonical = (login: AdminLogin) =>
  ["floruvi-admin-v1", login.email, login.aadhaar, login.dob, login.phone, login.password.normalize("NFC")].join("\n");

// OWASP scrypt profile: N=2^17, r=8, p=1 (128 MiB).
const PARAMS = { N: 2 ** 17, r: 8, p: 1 };
const KEY_LENGTH = 32;
const derive = (input: string, salt: Buffer, params: typeof PARAMS) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(input, salt, KEY_LENGTH, { ...params, maxmem: 256 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

/** Format: scrypt$N$r$p$salt$hash (base64url). */
export async function hashAdminCredentials(login: AdminLogin) {
  const salt = randomBytes(16);
  const key = await derive(canonical(login), salt, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

/** Constant-time check. False for any malformed hash, never an exception. */
export async function verifyAdminCredentials(login: AdminLogin, stored: string) {
  const parts = stored.trim().split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isSafeInteger) || N < 2 ** 15 || N > 2 ** 20 || r < 8 || p < 1 || p > 4)
    return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (salt.length < 16 || expected.length !== KEY_LENGTH) return false;
  const actual = await derive(canonical(login), salt, { N, r, p });
  return timingSafeEqual(actual, expected);
}
