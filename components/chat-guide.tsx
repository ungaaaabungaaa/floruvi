"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/i18n/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { guideReply, type GuideReply } from "@/lib/guide";
import { ChatHeader, ChatLauncher, ChatPrivacy } from "./chat-chrome";

type Message = GuideReply & { role: "guide" | "visitor" };
export function ChatGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "guide",
      text: "Welcome to Floruvi. Choose a crop, or ask how to reach the farm.",
    },
  ]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open]);
  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);
    setMessages((m) => [
      ...m.slice(-39),
      { role: "visitor", text: text.slice(0, 300) },
    ]);
    try {
      let catalogue = products;
      if (!catalogue) {
        const response = await fetch("/api/catalogue");
        if (!response.ok) throw new Error("Unavailable");
        const body = await response.json();
        catalogue = body.products;
        setProducts(catalogue);
      }
      const reply = guideReply(text, catalogue ?? []);
      setMessages((m) => [...m, { role: "guide", ...reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "guide",
          text: "I couldn’t load the catalogue. Please try again, or use the enquiry form.",
          link: { href: "/contact", label: "Contact the farm" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <ChatLauncher />
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay chat-overlay" />
        <Dialog.Content className="chat-panel">
          <ChatHeader ai={false} />
          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {messages.map((m, i) => (
              <div className={`chat-message ${m.role}`} key={i}>
                <p dir="auto">{m.text}</p>
                {m.products?.map((p) => (
                  <Link
                    href={`/products/${p.slug}`}
                    key={p.slug}
                    onClick={() => setOpen(false)}
                  >
                    {p.name}
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
                {m.link && (
                  <Link href={m.link.href} onClick={() => setOpen(false)}>
                    {m.link.label}
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                {["Basil", "Microgreens", "Business enquiry"].map((text) => (
                  <button key={text} type="button" disabled={loading} onClick={() => void send(text)}>
                    <span>{text}</span><ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <p className="chat-loading">Looking through the growing list…</p>
            )}
            <div ref={end} />
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="chat-message">
              Ask the catalogue guide
            </label>
            <input
              id="chat-message"
              name="message"
              dir="auto"
              value={input}
              maxLength={300}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try a crop name…"
              autoComplete="off"
            />
            <button
              className="icon-button"
              aria-label="Send message"
              disabled={!input.trim() || loading}
            >
              <ArrowUp size={20} aria-hidden="true" />
            </button>
          </form>
          <ChatPrivacy />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
