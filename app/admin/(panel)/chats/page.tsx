import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminApi, adminToken, type ChatInbox } from "@/lib/admin";
import { ChatInboxClient } from "./client";

export const metadata: Metadata = { title: "Chats" };
export default async function AdminChats({ searchParams }: PageProps<"/admin/chats">) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const { t, sort } = await searchParams;
  const threadId = typeof t === "string" ? t.slice(0, 64) : undefined;
  const byCost = sort === "cost";
  const response = await adminApi("chats", { token, threadId, ...(byCost && { sort: "cost" }) }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok) return <p className="admin-error" role="alert">The chat inbox is not available. Try again.</p>;
  const initial = await response.json() as ChatInbox;
  return <ChatInboxClient initial={initial} byCost={byCost} />;
}
