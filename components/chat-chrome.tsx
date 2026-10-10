"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, X } from "lucide-react";
import Link from "@/components/i18n/link";
import mark from "@/src/assets/floruvi-mark.webp";
import { useI18n } from "./i18n/provider";

export function ChatLauncher({ unread = 0 }: { unread?: number }) {
  const { t } = useI18n();
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 800px)");
    const update = () => setHeaderSlot(mobile.matches ? document.getElementById("mobile-chat-slot") : null);
    update();
    mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, []);
  const trigger = (
    <Dialog.Trigger asChild>
      <button type="button" className={headerSlot ? "icon-button header-chat" : "chat-launcher"} aria-label={`${t.chat.open}${unread > 0 ? ` · ${unread} ${t.chat.unread}` : ""}`}>
        <MessageCircle size={headerSlot ? 21 : 25} strokeWidth={headerSlot ? 1.5 : 2} fill={headerSlot ? "none" : "currentColor"} aria-hidden="true" />
        {unread > 0 && <span className="chat-unread"><span aria-hidden="true">{unread > 9 ? "9+" : unread}</span><span className="sr-only">{unread} {t.chat.unread}</span></span>}
      </button>
    </Dialog.Trigger>
  );
  return headerSlot ? createPortal(trigger, headerSlot) : trigger;
}

export function ChatHeader({ ai = true, team = false }: { ai?: boolean; team?: boolean }) {
  const { t } = useI18n();
  return (
    <header className="chat-header">
      <span className="chat-brand-mark" aria-hidden="true">
        <Image src={mark} alt="" width={34} height={34} />
      </span>
      <div className="chat-heading">
        <Dialog.Title>{t.chat.title}</Dialog.Title>
        <p>{team ? t.chat.team : ai ? t.chat.assistant : t.footer.help}</p>
      </div>
      <Dialog.Close type="button" className="icon-button" aria-label={t.chat.close}>
        <X size={20} aria-hidden="true" />
      </Dialog.Close>
    </header>
  );
}

export function ChatTyping({ label }: { label: string }) {
  return <div className="chat-typing" role="status" aria-label={label}><span /><span /><span /><span className="sr-only">{label}</span></div>;
}

export function ChatPrivacy() {
  const { t } = useI18n();
  return (
    <Dialog.Description className="chat-privacy">
      {t.chat.note} · <Link href="/privacy">{t.footer.privacy}</Link>
    </Dialog.Description>
  );
}
