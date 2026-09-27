import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminApi, adminToken, type ChatInbox } from "@/lib/admin";
import { costLabel } from "@/lib/chat";
import { updateChat } from "../../actions";
import { Filters } from "../shared";

export const metadata: Metadata = { title: "Chats" };

const when = (time: number) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(time);
const who = { customer: "Customer", bot: "Assistant", owner: "You" } as const;
const answering = { bot: "Assistant answers", owner: "You answer", closed: "Closed" } as const;

export default async function AdminChats({ searchParams }: PageProps<"/admin/chats">) {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const { t, sort } = await searchParams;
  const threadId = typeof t === "string" ? t.slice(0, 64) : undefined;
  const byCost = sort === "cost";
  const response = await adminApi("chats", {
    token,
    threadId,
    ...(byCost && { sort: "cost" }),
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok)
    return (
      <p className="admin-error" role="alert">
        The chat inbox is not available yet. Deploy the Convex backend, then reload.
      </p>
    );
  const { spend, threads, selected } = (await response.json()) as ChatInbox;
  const link = (id?: string) =>
    `/admin/chats?${new URLSearchParams({ ...(id && { t: id }), ...(byCost && { sort: "cost" }) })}`;
  return (
    <>
      <h1>Chats</h1>
      <p className="admin-muted">
        Chats waiting for you come first. Your reply takes the chat over until you give it back.
      </p>
      <p className={spend.paused ? "admin-error" : "admin-muted"}>
        Assistant spend in {spend.month}: <strong>{costLabel(spend.costMicros)}</strong> of{" "}
        {costLabel(spend.monthMicros)} · {spend.aiReplies} replies.{" "}
        {spend.paused
          ? "Budget used up: the assistant is paused until next month."
          : `A chat that costs more than ${costLabel(spend.chatDayMicros)} in a day goes to you.`}
      </p>
      <Filters
        label="Sort chats"
        options={[
          { href: "/admin/chats", label: "Newest", current: !byCost },
          { href: "/admin/chats?sort=cost", label: "Most expensive", current: byCost },
        ]}
      />
      <div className="admin-chats">
        <nav aria-label="Chats">
          {threads.length === 0 && <p className="admin-muted">No chats yet.</p>}
          <ol className="admin-thread-list">
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link
                  href={link(thread.id)}
                  aria-current={selected?.id === thread.id ? "page" : undefined}
                  className={thread.mode === "owner" ? "is-waiting" : ""}
                >
                  <span>
                    <strong>{thread.mode === "owner" ? "Needs you" : answering[thread.mode]}</strong>
                    {thread.unread && <span className="admin-tag review">New</span>}
                    <small>
                      {thread.language}-{thread.market} · {when(thread.lastMessageAt)} ·{" "}
                      {costLabel(thread.costMicros)} · {thread.aiReplies} replies
                    </small>
                  </span>
                  <span className="admin-muted">{thread.preview}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        {selected ? (
          <section aria-labelledby="thread-title" className="admin-thread">
            <p className="admin-muted">
              Cost: {costLabel(selected.costMicros)} · {selected.aiReplies} assistant replies ·{" "}
              {selected.tokensIn.toLocaleString("en-IN")} tokens in,{" "}
              {selected.tokensOut.toLocaleString("en-IN")} out
            </p>
            <h2 id="thread-title">
              {answering[selected.mode]}
              {selected.handOffReason && selected.mode === "owner" && (
                <span className="admin-tag review">{selected.handOffReason}</span>
              )}
            </h2>
            <ol className="admin-chat-log">
              {selected.messages.map((message) => (
                <li key={message.id} className={message.author}>
                  <small>
                    {who[message.author]} · {when(message.at)}
                  </small>
                  <p dir="auto">{message.text}</p>
                  {message.products?.length ? (
                    <p className="admin-muted">
                      Products: {message.products.map((p) => p.name).join(", ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
            <form action={updateChat} className="admin-form">
              <input type="hidden" name="threadId" value={selected.id} />
              <label>
                Your reply
                <textarea name="text" rows={3} maxLength={2000} required dir="auto" />
              </label>
              <button className="admin-button">Send reply</button>
            </form>
            <div className="admin-chat-actions">
              {selected.mode !== "bot" && (
                <form action={updateChat}>
                  <input type="hidden" name="threadId" value={selected.id} />
                  <input type="hidden" name="mode" value="bot" />
                  <button className="admin-button ghost">Give back to the assistant</button>
                </form>
              )}
              {selected.mode === "bot" && (
                <form action={updateChat}>
                  <input type="hidden" name="threadId" value={selected.id} />
                  <input type="hidden" name="mode" value="owner" />
                  <button className="admin-button ghost">Take over</button>
                </form>
              )}
              {selected.mode !== "closed" && (
                <form action={updateChat}>
                  <input type="hidden" name="threadId" value={selected.id} />
                  <input type="hidden" name="mode" value="closed" />
                  <button className="admin-button ghost">Close chat</button>
                </form>
              )}
            </div>
          </section>
        ) : (
          <p className="admin-muted">Choose a chat.</p>
        )}
      </div>
    </>
  );
}
