"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "./i18n/provider";

const ChatGuide = dynamic(() => import("./chat-guide").then((m) => m.ChatGuide), {
  ssr: false,
});
const ChatBot = dynamic(() => import("./chat-bot").then((m) => m.ChatBot), { ssr: false });

// The chat loads after the page is idle and only when the owner has switched it on.
// The AI assistant answers in every language. Without an OpenRouter key, the simple
// catalogue guide answers, in English only, so other language versions stay chat-free.
export function ChatSlot() {
  const { locale } = useI18n();
  const [chat, setChat] = useState<"off" | "guide" | "bot">("off");
  useEffect(() => {
    let active = true;
    const check = () =>
      fetch("/api/chat")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!active || data?.enabled !== true) return;
          setChat(data.ai ? "bot" : locale.language === "en" ? "guide" : "off");
        })
        .catch(() => {});
    const idle = "requestIdleCallback" in window;
    const handle = idle ? requestIdleCallback(check, { timeout: 4000 }) : setTimeout(check, 2000);
    return () => {
      active = false;
      if (idle) cancelIdleCallback(handle as number);
      else clearTimeout(handle);
    };
  }, [locale.language]);
  return chat === "bot" ? <ChatBot /> : chat === "guide" ? <ChatGuide /> : null;
}
