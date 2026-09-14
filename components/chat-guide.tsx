"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, ArrowUpRight, MessageCircle, Sprout, X } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { guideReply, type GuideReply } from "@/lib/guide";

type Message = GuideReply & { role: "guide" | "visitor" };
export function ChatGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "guide",
      text: "Hello, curious cook. 🌱 Looking for a particular crop? Try a name below, or ask how to contact the farm.",
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
      <Dialog.Trigger asChild>
        <button className="chat-launcher">
          <MessageCircle size={20} />
          <span>Ask Floruvi</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay chat-overlay" />
        <Dialog.Content className="chat-panel">
          <header className="chat-header">
            <span className="chat-avatar">
              <Sprout size={23} />
            </span>
            <div>
              <Dialog.Title>Floruvi catalogue guide</Dialog.Title>
              <Dialog.Description>
                Automated · No live operator
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="icon-button"
              aria-label="Close catalogue guide"
            >
              <X size={20} />
            </Dialog.Close>
          </header>
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
            {loading && (
              <p className="chat-loading">Looking through the growing list…</p>
            )}
            <div ref={end} />
          </div>
          <div className="chat-suggestions">
            {["Basil", "Lettuce", "Business enquiry"].map((text) => (
              <button key={text} disabled={loading} onClick={() => send(text)}>
                {text}
              </button>
            ))}
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
              <ArrowUp size={20} />
            </button>
          </form>
          <p className="chat-disclaimer">
            Page session only. Translation & human chat come later.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
