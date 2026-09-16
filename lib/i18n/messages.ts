import type en from "@/messages/en.json";
import type { Language } from "./config";

export type Messages = typeof en;

// Each dictionary loads only on the server, and only for the requested language.
const loaders: Record<Language, () => Promise<Messages>> = {
  en: () => import("@/messages/en.json").then((m) => m.default),
  ar: () => import("@/messages/ar.json").then((m) => m.default as unknown as Messages),
  de: () => import("@/messages/de.json").then((m) => m.default as unknown as Messages),
  ja: () => import("@/messages/ja.json").then((m) => m.default as unknown as Messages),
  nl: () => import("@/messages/nl.json").then((m) => m.default as unknown as Messages),
  ne: () => import("@/messages/ne.json").then((m) => m.default as unknown as Messages),
  bn: () => import("@/messages/bn.json").then((m) => m.default as unknown as Messages),
  ms: () => import("@/messages/ms.json").then((m) => m.default as unknown as Messages),
  si: () => import("@/messages/si.json").then((m) => m.default as unknown as Messages),
  uz: () => import("@/messages/uz.json").then((m) => m.default as unknown as Messages),
};

export function loadMessages(language: Language) {
  return loaders[language]();
}
