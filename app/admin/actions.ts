"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { CATALOGUE_TAG } from "@/lib/convex-public";
import { adminLoginSchema } from "@/lib/admin-credentials";
import { ADMIN_COOKIE, adminApi, adminToken, callerHash, cookieOptions } from "@/lib/admin";

// Server Actions are reachable by direct POST, so each one checks the session
// through Convex. Next.js also rejects cross-site Origin headers for them.

export type LoginState = { error: string } | null;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const field = (name: string) => String(form.get(name) ?? "");
  const input = adminLoginSchema.safeParse({
    email: field("email"),
    aadhaar: field("aadhaar"),
    dob: field("dob"),
    phone: field("phone"),
    password: field("password"),
  });
  if (!input.success)
    return { error: "Check each field: a 12-digit Aadhaar number and a 10-digit mobile number." };
  const remember = form.get("remember") === "on";
  const response = await adminApi("login", {
    ...input.data,
    remember,
    ipHash: await callerHash(),
  }).catch(() => null);
  if (response?.status === 429)
    return { error: "Too many attempts. Wait one hour, then try again." };
  if (!response?.ok) {
    // Convex names the reason only for wrong details; anything else is setup.
    const reason = await response?.json().catch(() => null);
    return reason?.error === "invalid"
      ? { error: "Those details do not match." }
      : { error: "Sign-in is not set up yet. See docs/25-admin-and-order-alerts.md." };
  }
  const { token, maxAgeSeconds } = (await response.json()) as {
    token: string;
    maxAgeSeconds: number;
  };
  // Without "keep me signed in" the cookie ends with the browser; the server ends it after 12 hours.
  (await cookies()).set(ADMIN_COOKIE, token, {
    ...cookieOptions,
    ...(remember ? { maxAge: maxAgeSeconds } : {}),
  });
  redirect("/admin");
}

export async function logout() {
  const token = await adminToken();
  if (token) await adminApi("logout", { token }).catch(() => null);
  (await cookies()).delete({ name: ADMIN_COOKIE, ...cookieOptions });
  redirect("/admin/login");
}

export async function setChat(form: FormData) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("chat", {
    token,
    enabled: form.get("enabled") === "true",
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  revalidatePath("/admin", "layout");
}

export async function setPayments(form: FormData) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("payments", {
    token,
    enabled: form.get("enabled") === "true",
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  revalidatePath("/admin", "layout");
}

export async function setStock(form: FormData) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("stock", {
    token,
    slug: String(form.get("slug") ?? ""),
    inStock: form.get("inStock") === "true",
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  // Public product pages are cached; show the new stock state at once.
  updateTag(CATALOGUE_TAG);
  revalidatePath("/admin", "layout");
}

/** Owner reply in a website chat, or a change of who answers it. */
export async function updateChat(form: FormData) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const threadId = String(form.get("threadId") ?? "");
  const mode = String(form.get("mode") ?? "");
  const response = await adminApi("chat-update", {
    token,
    threadId,
    text: String(form.get("text") ?? "").slice(0, 2000),
    ...(["bot", "owner", "closed"].includes(mode) && { mode }),
    ...(form.has("archive") && { archive: form.get("archive") === "true" }),
    ...(form.get("read") === "true" && { read: true }),
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok) return { error: response?.status === 409 ? "Only chats inactive for three days can be archived." : "Your reply was not saved. Try again." };
  if (form.get("read") !== "true") revalidatePath("/admin", "layout");
  return { error: null };
}
