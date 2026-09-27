"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "./i18n/provider";

const ChatGuide = dynamic(() => import("./chat-guide").then((m) => m.ChatGuide), {
  ssr: false,
});

// The chat loads after the page is idle and only when the owner has switched it on.
// The current guide answers in English, so other language versions stay chat-free.
export function ChatSlot() {
  const { locale } = useI18n();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (locale.language !== "en") return;
    let active = true;
    const check = () =>
      fetch("/api/chat")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => active && setEnabled(data?.enabled === true))
        .catch(() => {});
    const idle = "requestIdleCallback" in window;
    const handle = idle ? requestIdleCallback(check, { timeout: 4000 }) : setTimeout(check, 2000);
    return () => {
      active = false;
      if (idle) cancelIdleCallback(handle as number);
      else clearTimeout(handle);
    };
  }, [locale.language]);
  return enabled ? <ChatGuide /> : null;
}
