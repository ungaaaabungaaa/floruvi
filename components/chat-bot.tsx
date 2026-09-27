"use client";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { ArrowUp, ArrowUpRight, Check, MessageCircle, Plus, X } from "lucide-react";
import Link from "@/components/i18n/link";
import { MAX_CHAT_TEXT, type ChatMode, type ChatProduct, type StoredChatMessage } from "@/lib/chat";
import type { chatTools } from "@/lib/chat-bot";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";

type Meta = { mode?: ChatMode; author?: StoredChatMessage["author"]; products?: ChatProduct[] };
type ChatMessage = UIMessage<Meta, UIDataTypes, InferUITools<ReturnType<typeof chatTools>>>;
type Listed = { slug: string; name: string; price?: string; pack?: string | null; quantity?: number };

const textOf = (message?: ChatMessage) =>
  message?.parts.map((part) => (part.type === "text" ? part.text : "")).join("") ?? "";

/** Saved messages, as the chat window shows them after a reload. */
const restore = (messages: StoredChatMessage[]): ChatMessage[] =>
  messages.map((m) => ({
    id: m.id,
    role: m.author === "customer" ? "user" : "assistant",
    metadata: { author: m.author, products: m.products },
    parts: m.text ? [{ type: "text", text: m.text }] : [],
  }));

/** Products a reply points to: from its tools while streaming, or saved with it. */
function listed(message: ChatMessage): Listed[] {
  const items = new Map<string, Listed>();
  for (const part of message.parts) {
    if (part.type === "tool-findProducts" && part.state === "output-available")
      for (const p of part.output) items.set(p.slug, p);
    if (part.type === "tool-getProduct" && part.state === "output-available" && "slug" in part.output)
      items.set(part.output.slug, part.output);
    if (part.type === "tool-addToBasket" && part.state === "output-available" && part.output.ok)
      items.set(part.output.slug, part.output);
  }
  for (const p of message.metadata?.products ?? []) if (!items.has(p.slug)) items.set(p.slug, p);
  return [...items.values()].slice(0, 5);
}

/** The AI shop assistant (Vercel AI SDK + OpenRouter). Replies stream from /api/chat. */
export function ChatBot() {
  const { t, locale, fill } = useI18n();
  const labels = t.chat;
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("bot");
  const [added, setAdded] = useState<string[]>([]);
  const [transport] = useState(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/chat",
        // The server keeps the history; send only the new message and the site version.
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { text: textOf(messages.at(-1)), locale: locale.locale },
        }),
      }),
  );
  const { messages, sendMessage, setMessages, status, error, clearError } = useChat<ChatMessage>({
    transport,
    onFinish: ({ message }) => {
      const handedOff = message.parts.some(
        (part) => part.type === "tool-handOff" && part.state === "output-available",
      );
      if (handedOff) setMode("owner");
      else if (message.metadata?.mode) setMode(message.metadata.mode);
    },
  });
  const busy = status === "submitted" || status === "streaming";
  const live = useRef({ busy, mode });
  useEffect(() => {
    live.current = { busy, mode };
  }, [busy, mode]);

  // Restore the chat when the window opens, and fetch the team's replies while it answers.
  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      if (live.current.busy) return;
      const data = await fetch("/api/chat/thread")
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
      if (!active || !data || live.current.busy) return;
      setMode(data.mode);
      if (data.messages.length) setMessages(restore(data.messages));
    };
    void load();
    const timer = setInterval(() => {
      if (live.current.mode === "owner") void load();
    }, 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [open, setMessages]);

  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open]);

  function send(text: string) {
    const value = text.trim().slice(0, MAX_CHAT_TEXT);
    if (!value || busy) return;
    clearError();
    setInput("");
    void sendMessage({ text: value });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="chat-launcher" aria-label={labels.open}>
          <MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay chat-overlay" />
        <Dialog.Content className="chat-panel" dir={locale.dir}>
          <header className="chat-header">
            <div>
              <Dialog.Title>{labels.title}</Dialog.Title>
              <Dialog.Description>{labels.note}</Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label={labels.close}>
              <X size={20} />
            </Dialog.Close>
          </header>
          <div className="chat-messages" role="log" aria-live="polite" aria-label={labels.title}>
            <div className="chat-message">
              <p dir="auto">{labels.greeting}</p>
            </div>
            {messages.map((message) => {
              const text = textOf(message);
              const products = message.role === "assistant" ? listed(message) : [];
              if (!text && !products.length) return null;
              return (
                <div
                  key={message.id}
                  className={`chat-message ${message.role === "user" ? "visitor" : ""}`}
                >
                  {message.metadata?.author === "owner" && (
                    <span className="chat-team">{labels.team}</span>
                  )}
                  {text && <p dir="auto">{text}</p>}
                  {products.map((product) =>
                    product.quantity ? (
                      <button
                        key={product.slug}
                        type="button"
                        className="chat-add"
                        disabled={added.includes(`${message.id}:${product.slug}`)}
                        onClick={() => {
                          if (cart.add(product.slug, product.quantity))
                            setAdded((list) => [...list, `${message.id}:${product.slug}`]);
                        }}
                      >
                        {added.includes(`${message.id}:${product.slug}`) ? (
                          <>
                            <Check size={15} aria-hidden="true" /> {labels.added}
                          </>
                        ) : (
                          <>
                            <Plus size={15} aria-hidden="true" />
                            {fill(labels.add, { quantity: product.quantity, name: product.name })}
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        onClick={() => setOpen(false)}
                      >
                        <span>
                          {product.name}
                          {product.price && (
                            <small>
                              {" "}
                              {product.price}
                              {product.pack && ` · ${product.pack}`}
                            </small>
                          )}
                        </span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    ),
                  )}
                </div>
              );
            })}
            {status === "submitted" && <p className="chat-loading">{labels.thinking}</p>}
            {error && (
              <p className="chat-loading" role="alert">
                {error.message.includes("limited") ? labels.tooMany : labels.error}
              </p>
            )}
            {mode === "owner" && <p className="chat-loading">{labels.withTeam}</p>}
            <div ref={end} />
          </div>
          {messages.length === 0 && (
            <div className="chat-suggestions">
              {labels.suggestions.map((text) => (
                <button key={text} type="button" disabled={busy} onClick={() => send(text)}>
                  {text}
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label className="sr-only" htmlFor="chat-message">
              {labels.label}
            </label>
            <input
              id="chat-message"
              dir="auto"
              value={input}
              maxLength={MAX_CHAT_TEXT}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labels.placeholder}
              autoComplete="off"
            />
            <button className="icon-button" aria-label={labels.send} disabled={!input.trim() || busy}>
              <ArrowUp size={20} />
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
