"use client";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { ArrowLeft, ArrowUp, ArrowUpRight, Check, History, Leaf, Plus, ShoppingBag, Truck, Users } from "lucide-react";
import Link from "@/components/i18n/link";
import { MAX_CHAT_TEXT, type ChatMode, type ChatProduct, type StoredChatMessage } from "@/lib/chat";
import type { chatTools } from "@/lib/chat-bot";
import { useCart } from "./cart-store";
import { useI18n } from "./i18n/provider";
import { ChatHeader, ChatLauncher, ChatPrivacy, ChatTyping } from "./chat-chrome";
import { useCustomerChat } from "./use-customer-chat";

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
  const [showHistory, setShowHistory] = useState(false);
  const [transport] = useState(
    () =>
      new DefaultChatTransport<ChatMessage>({
        api: "/api/chat",
        // The server keeps the history; send only the new message and the site version.
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, text: textOf(messages.at(-1)), locale: locale.locale },
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
  const liveChat = useCustomerChat(open, busy, (data) => {
    setMode(data.mode);
    setMessages(restore(data.messages));
  });

  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open]);

  function send(text: string) {
    const value = text.trim().slice(0, MAX_CHAT_TEXT);
    if (!value || busy || mode === "closed" || liveChat.session === null) return;
    clearError();
    setInput("");
    void sendMessage({ text: value }, { body: { ...(liveChat.session && { sessionId: liveChat.session }) } });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(value) => { setOpen(value); if (value) liveChat.markRead(); }}>
      <ChatLauncher unread={liveChat.unread} />
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay chat-overlay" />
        <Dialog.Content className="chat-panel" dir={locale.dir}>
          <ChatHeader team={mode === "owner"} />
          <div className="chat-toolbar">
            <button type="button" disabled={busy} onClick={() => { liveChat.startNew(); clearError(); setInput(""); setAdded([]); setShowHistory(false); }}><Plus size={15} aria-hidden="true" />{labels.newChat}</button>
            <button type="button" disabled={busy} aria-pressed={showHistory} onClick={() => setShowHistory(!showHistory)}>{showHistory ? <ArrowLeft size={15} aria-hidden="true" /> : <History size={15} aria-hidden="true" />}{showHistory ? labels.back : labels.history}</button>
          </div>
          <div className="chat-messages" role="log" aria-live="polite" aria-label={labels.title}>
            {showHistory && <div className="chat-history">
              {liveChat.history.length === 0 && <p>{labels.noHistory}</p>}
              {liveChat.history.map((chat) => <button key={chat.sessionId} type="button" onClick={() => { liveChat.select(chat.sessionId); clearError(); setInput(""); setShowHistory(false); }}><span>{chat.preview || labels.title}</span><small>{new Intl.DateTimeFormat(locale.tag, { dateStyle: "medium" }).format(chat.at)}</small></button>)}
            </div>}
            {!showHistory && messages.length === 0 && (
              <div className="chat-welcome">
                <p dir="auto">{labels.greeting}</p>
                <div className="chat-suggestions">
                  <Link href="/products" onClick={() => setOpen(false)}>
                    <ShoppingBag size={18} aria-hidden="true" />
                    <span>{t.footer.vegetables}</span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  {labels.suggestions.map((text, index) => {
                    const Icon = [Leaf, Truck, Users][index] ?? Leaf;
                    return (
                      <button key={text} type="button" disabled={busy} onClick={() => send(text)}>
                        <Icon size={18} aria-hidden="true" />
                        <span>{text}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {!showHistory && messages.map((message) => {
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
            {!showHistory && (status === "submitted" || liveChat.typing) && <ChatTyping label={liveChat.typing ? labels.typing : labels.thinking} />}
            {!showHistory && error && (
              <div className="chat-error" role="alert">
                <p>{error.message.includes("limited") ? labels.tooMany : labels.error}</p>
                <Link href="/contact" onClick={() => setOpen(false)}>{t.footer.contact} <ArrowUpRight size={14} aria-hidden="true" /></Link>
              </div>
            )}
            {!showHistory && mode === "closed" && <p className="chat-loading">{labels.closed}</p>}
            {!liveChat.connected && messages.length > 0 && <p className="chat-loading" role="status">{labels.reconnecting}</p>}
            <div ref={end} />
          </div>
          {!showHistory && <form
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
              name="message"
              dir="auto"
              value={input}
              maxLength={MAX_CHAT_TEXT}
              onChange={(e) => setInput(e.target.value)}
              placeholder={labels.placeholder}
              autoComplete="off"
              disabled={mode === "closed" || liveChat.session === null}
            />
            {/* The limit shows only near the end, to keep the box plain. */}
            {input.length >= MAX_CHAT_TEXT - 60 && (
              <span
                className={input.length >= MAX_CHAT_TEXT ? "chat-count is-full" : "chat-count"}
                aria-live="polite"
              >
                {input.length}/{MAX_CHAT_TEXT}
              </span>
            )}
            <button className="icon-button" aria-label={labels.send} disabled={!input.trim() || busy || mode === "closed" || liveChat.session === null}>
              <ArrowUp size={20} aria-hidden="true" />
            </button>
          </form>}
          <ChatPrivacy />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
