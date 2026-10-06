"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomerChat } from "@/lib/chat";

const SESSION = "floruvi-chat-session-v1";
const SEEN = "floruvi-chat-seen-v1";
const empty: CustomerChat = { mode: "bot", messages: [], history: [], typingUntil: 0 };

/** One live, private conversation per browser session. No chat text is stored locally. */
export function useCustomerChat(open: boolean, busy: boolean, apply: (data: CustomerChat) => void) {
  const [session, setSession] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try { return sessionStorage.getItem(SESSION) || crypto.randomUUID(); } catch { return crypto.randomUUID(); }
  });
  const [snapshot, setSnapshot] = useState<CustomerChat>(empty);
  const [unread, setUnread] = useState(0);
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(true);
  const current = useRef({ open, busy, apply });
  const seen = useRef<Record<string, number>>({});
  useEffect(() => { current.current = { open, busy, apply }; }, [open, busy, apply]);
  useEffect(() => {
    try {
      if (session !== null) sessionStorage.setItem(SESSION, session);
      seen.current = JSON.parse(localStorage.getItem(SEEN) || "{}");
    } catch { /* Storage can be disabled; the in-memory session still works. */ }
  }, [session]);

  const markSeen = useCallback((id: string, at: number) => {
    seen.current[id] = at;
    try { localStorage.setItem(SEEN, JSON.stringify(seen.current)); } catch { /* Optional. */ }
    setUnread(0);
  }, []);
  const markRead = useCallback(() => {
    if (session !== null) markSeen(session, snapshot.messages.at(-1)?.at ?? Date.now());
  }, [session, snapshot, markSeen]);
  useEffect(() => {
    const visible = () => { if (current.current.open && document.visibilityState === "visible") markRead(); };
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [markRead]);

  useEffect(() => {
    if (session === null || busy) return;
    let active = true;
    const accept = (data: CustomerChat) => {
      if (!active) return;
      setSnapshot(data);
      setTyping(data.typingUntil > Date.now());
      setConnected(true);
      const lastSeen = seen.current[session] ?? 0;
      const count = data.messages.filter((m) => m.author !== "customer" && m.at > lastSeen).length;
      setUnread(current.current.open && document.visibilityState === "visible" ? 0 : count);
      if (current.current.open && document.visibilityState === "visible") markSeen(session, data.messages.at(-1)?.at ?? Date.now());
      if (!current.current.busy) current.current.apply(data);
    };
    void fetch(`/api/chat/thread?session=${encodeURIComponent(session)}`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null).then((data) => { if (data) accept(data); }).catch(() => { if (active) setConnected(false); });
    const source = new EventSource(`/api/chat/live?session=${encodeURIComponent(session)}`);
    source.onmessage = (event) => { try { accept(JSON.parse(event.data)); } catch { /* Reconnect delivers the next complete snapshot. */ } };
    source.onerror = () => { if (active) setConnected(false); };
    source.addEventListener("denied", () => { source.close(); setConnected(false); });
    source.addEventListener("unavailable", () => { setConnected(false); });
    return () => { active = false; source.close(); };
  }, [session, busy, markSeen]);

  useEffect(() => {
    const left = snapshot.typingUntil - Date.now();
    if (left <= 0) return;
    const timer = setTimeout(() => setTyping(false), left);
    return () => clearTimeout(timer);
  }, [snapshot.typingUntil]);

  const select = (id: string) => {
    setSession(id);
    setSnapshot(empty);
    setTyping(false);
    setUnread(0);
    current.current.apply(empty);
    try { sessionStorage.setItem(SESSION, id); } catch { /* Optional. */ }
  };
  return { session, history: snapshot.history, unread, typing, connected, select, markRead, startNew: () => select(crypto.randomUUID()) };
}
