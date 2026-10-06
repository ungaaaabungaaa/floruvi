"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { Archive, ArrowLeft, Check, MessageCircle, Search, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatInbox } from "@/lib/admin";
import { costLabel } from "@/lib/chat";
import { updateChat } from "../../actions";

const who = { customer: "Customer", bot: "AI assistant", owner: "Floruvi team" };
const answering = { bot: "AI assistant", owner: "Floruvi team", closed: "Closed" };
const date = (at: number) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(at);
type Filter = "all" | "waiting" | "closed" | "archived";

export function ChatInboxClient({ initial, byCost }: { initial: ChatInbox; byCost: boolean }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial.selected?.id ?? initial.threads.find((t) => !t.archivedAt)?.id ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [result, action, pending] = useActionState(async (_: { error: string | null; sent: boolean; threadId: string }, form: FormData) => {
    const saved = await updateChat(form);
    if (!saved.error && form.get("text")) setDrafts((d) => ({ ...d, [String(form.get("threadId"))]: "" }));
    return { error: saved.error, sent: !saved.error && !!form.get("text"), threadId: String(form.get("threadId")) };
  }, { error: null, sent: false, threadId: "" });
  const selected = data.selected?.id === selectedId ? data.selected : null;
  const selectedUnread = data.threads.some((t) => t.id === selectedId && t.unread);
  useEffect(() => {
    const markRead = () => {
      if (!selectedId || !selectedUnread || document.visibilityState !== "visible") return;
      const form = new FormData();
      form.set("threadId", selectedId);
      form.set("read", "true");
      void updateChat(form);
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [selectedId, selectedUnread, selected?.lastMessageAt]);
  const text = drafts[selectedId] ?? "";
  const lastTyping = useRef(0);
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const params = new URLSearchParams({ ...(selectedId && { t: selectedId }), ...(byCost && { sort: "cost" }) });
    const source = new EventSource(`/api/admin/chats/live?${params}`);
    source.onmessage = (event) => { setData(JSON.parse(event.data)); setConnected(true); };
    source.onerror = () => setConnected(false);
    source.addEventListener("denied", () => { source.close(); router.replace("/admin/login"); });
    source.addEventListener("unavailable", () => setConnected(false));
    return () => source.close();
  }, [selectedId, byCost, router]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [selected?.messages.length, selectedId]);
  const signalTyping = (id: string, typing: boolean) => {
    void fetch("/api/admin/chats/typing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId: id, typing }), keepalive: true }).catch(() => {});
  };
  useEffect(() => {
    if (!selectedId || !text) return;
    const timer = setTimeout(() => signalTyping(selectedId, false), 2500);
    return () => clearTimeout(timer);
  }, [text, selectedId]);
  useEffect(() => () => { if (selectedId) signalTyping(selectedId, false); }, [selectedId]);
  const visible = data.threads.filter((t) => {
    if (filter === "archived" ? !t.archivedAt : t.archivedAt) return false;
    if (filter === "waiting" && t.mode !== "owner") return false;
    if (filter === "closed" && t.mode !== "closed") return false;
    return `${t.preview} ${t.id} ${t.language}-${t.market}`.toLowerCase().includes(search.toLowerCase());
  });
  const waiting = data.threads.filter((t) => t.mode === "owner" && !t.archivedAt).length;
  const unread = data.threads.filter((t) => t.unread && !t.archivedAt).length;
  return <>
    <div className="inbox-title"><div><p className="admin-eyebrow">Customer support</p><h1>Inbox</h1></div><span className={`inbox-live ${connected ? "is-live" : ""}`} role="status"><i />{connected ? "Live updates" : "Connecting…"}</span></div>
    <div className="inbox-summary"><span>{waiting} waiting for the team · {unread} unread</span><details><summary>Assistant budget: {costLabel(data.spend.costMicros)} / {costLabel(data.spend.monthMicros)}</summary><p>{data.spend.aiReplies} replies this month. Per-chat daily limit: {costLabel(data.spend.chatDayMicros)}.{data.spend.paused && " The assistant is paused."}</p></details></div>
    <div className={`team-inbox ${selectedId ? "has-selection" : ""}`}>
      <nav className="inbox-queue" aria-label="Conversations">
        <div className="inbox-tools"><label className="inbox-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search conversations</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats…" /></label>
          <div className="inbox-filters" aria-label="Filter conversations">{([ ["all", "All"], ["waiting", `Needs team (${waiting})`], ["closed", "Closed"], ["archived", "Archived"] ] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
          <label className="inbox-sort">Sort<select value={byCost ? "cost" : "newest"} onChange={(e) => router.push(e.target.value === "cost" ? "/admin/chats?sort=cost" : "/admin/chats")}><option value="newest">Newest first</option><option value="cost">Highest cost</option></select></label>
        </div>
        <ol className="inbox-rows">{visible.map((thread) => <li key={thread.id}><button type="button" aria-current={selectedId === thread.id ? "true" : undefined} onClick={() => { setSelectedId(thread.id); window.history.replaceState(null, "", `/admin/chats?${new URLSearchParams({ t: thread.id, ...(byCost && { sort: "cost" }) })}`); }}>
          <div className="inbox-row-head"><strong>{thread.language.toUpperCase()} · {thread.market.toUpperCase()}</strong>{thread.unread && <span className="inbox-unread" aria-label="Unread" />}</div><p>{thread.preview || "New conversation"}</p><div className="inbox-row-foot"><span>{thread.mode === "owner" ? "Needs team" : answering[thread.mode]}</span><time dateTime={new Date(thread.lastMessageAt).toISOString()}>{date(thread.lastMessageAt)}</time></div>
        </button></li>)}</ol>
        {visible.length === 0 && <p className="inbox-empty">No chats in this view.</p>}
      </nav>
      <section className="inbox-conversation" aria-label="Selected conversation">
        {selected ? <>
          <header className="inbox-thread-head"><button className="inbox-mobile-back" type="button" onClick={() => setSelectedId("")} aria-label="Back to conversations"><ArrowLeft size={20} /></button><div><h2>{selected.language.toUpperCase()} · {selected.market.toUpperCase()} conversation</h2><p>{answering[selected.mode]}{selected.archivedAt ? " · Archived" : ""}</p></div><span className="inbox-thread-id">#{selected.id.slice(-6)}</span></header>
          {selected.handOffReason && selected.mode === "owner" && <p className="inbox-handoff">{selected.handOffReason}</p>}
          <ol className="inbox-log" aria-live="polite">{selected.messages.map((m) => <li key={m.id} className={m.author}><small>{who[m.author]} · {date(m.at)}</small><p dir="auto">{m.text}</p>{m.products?.length ? <small>Products: {m.products.map((p) => p.name).join(", ")}</small> : null}</li>)}<li ref={end} className="inbox-log-end" /></ol>
          <div className="inbox-composer">
            {selected.mode === "closed" ? <p>This chat is closed. Its history is kept.</p> : <form action={action} onSubmit={() => signalTyping(selectedId, false)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (text.trim() && !pending) e.currentTarget.requestSubmit(); } }}>
              <input type="hidden" name="threadId" value={selected.id} /><label htmlFor="team-reply">Reply to customer</label><textarea id="team-reply" name="text" value={text} rows={3} maxLength={2000} required dir="auto" placeholder="Write a helpful reply…" onChange={(e) => { const value = e.target.value; setDrafts((d) => ({ ...d, [selectedId]: value })); if (Date.now() - lastTyping.current > 3000 || !value) { lastTyping.current = Date.now(); signalTyping(selectedId, !!value); } }} onBlur={() => signalTyping(selectedId, false)} />
              <div className="inbox-send-row"><small>{text.length}/2000 · ⌘ / Ctrl + Enter</small><button className="admin-button" disabled={pending || !text.trim()}><Send size={15} aria-hidden="true" />{pending ? "Sending…" : "Send reply"}</button></div>
            </form>}
            <div className="inbox-result" role="status">{result.threadId !== selected.id ? null : result.error ? <span className="admin-error">{result.error}</span> : result.sent ? <span><Check size={13} /> Reply saved</span> : null}</div>
            <div className="inbox-actions">
              {selected.mode !== "closed" && <form action={action}><input type="hidden" name="threadId" value={selected.id} /><input type="hidden" name="mode" value={selected.mode === "bot" ? "owner" : "bot"} /><button disabled={pending} type="submit">{selected.mode === "bot" ? "Take over" : "Return to AI"}</button></form>}
              {selected.mode !== "closed" && <form action={action}><input type="hidden" name="threadId" value={selected.id} /><input type="hidden" name="mode" value="closed" /><button disabled={pending} type="submit">Close chat</button></form>}
              {(selected.archivedAt || selected.canArchive) && <form action={action}><input type="hidden" name="threadId" value={selected.id} /><input type="hidden" name="archive" value={selected.archivedAt ? "false" : "true"} /><button disabled={pending} type="submit"><Archive size={14} />{selected.archivedAt ? "Restore" : "Archive"}</button></form>}
              <details><summary>Chat cost</summary><p>{costLabel(selected.costMicros)} · {selected.aiReplies} AI replies · {selected.tokensIn} tokens in / {selected.tokensOut} out</p></details>
            </div>
          </div>
        </> : <div className="inbox-empty"><MessageCircle size={28} /><p>{selectedId ? "Loading conversation…" : "Choose a conversation to reply."}</p></div>}
      </section>
    </div>
  </>;
}
