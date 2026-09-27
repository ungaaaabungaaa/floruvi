import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminApi, adminToken } from "@/lib/admin";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLogin() {
  const token = await adminToken();
  if (token) {
    const response = await adminApi("dashboard", { token }).catch(() => null);
    if (response?.ok) redirect("/admin");
  }
  return (
    <main className="admin-login">
      <div className="admin-card">
        <p className="admin-eyebrow">Floruvi Farm</p>
        <h1>Owner sign-in</h1>
        <p className="admin-muted">All five details must match. They are checked as one hashed value.</p>
        <LoginForm today={new Date().toISOString().slice(0, 10)} />
      </div>
    </main>
  );
}
