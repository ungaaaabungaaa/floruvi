"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronRight, Languages, X } from "lucide-react";
import {
  LOCALE_COOKIE,
  languages,
  localizePath,
  marketCodes,
  markets,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";
import { countryName, fill } from "@/lib/i18n/format";
import { useI18n } from "./provider";

/**
 * Saves the choice for the redirect rule, then loads the same page in that version.
 * A full document load is intentional: the root layout's lang, dir & prices change.
 */
function choose(locale: Locale, pathname: string) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  const { origin, search, hash } = window.location;
  window.location.href = new URL(
    `${localizePath(locale, stripLocale(pathname))}${search}${hash}`,
    origin,
  ).toString();
}

export function LocalePicker({
  variant = "icon",
  onNavigate,
}: {
  variant?: "icon" | "row";
  onNavigate?: () => void;
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = fill(t.locale.change, {
    country: locale.countryName,
    language: languages[locale.language].name,
  });
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {variant === "row" ? (
          <button type="button" className="navigation-locale" aria-label={label}>
            <span>{t.locale.label}</span>
            <span className="navigation-locale-current">
              {locale.countryName} · {languages[locale.language].name}
              <ChevronRight size={20} aria-hidden="true" />
            </span>
          </button>
        ) : (
          <button type="button" className="icon-button locale-button" aria-label={label}>
            <Languages size={21} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="locale-panel" dir={locale.dir}>
          <Dialog.Title>{t.locale.title}</Dialog.Title>
          <Dialog.Description>{t.locale.description}</Dialog.Description>
          <Dialog.Close className="icon-button dialog-close" aria-label={t.locale.close}>
            <X />
          </Dialog.Close>
          <ul className="locale-list">
            {marketCodes.map((market) => {
              const config = markets[market];
              const name = countryName(config.country, locale.language);
              const language = config.languages[0];
              const code = `${language}-${market}` as Locale;
              const selected = code === locale.locale;
              return (
                <li key={market}>
                  <span className="locale-country">
                    <strong>{name}</strong>
                    <small>{config.currency}</small>
                  </span>
                  <span className="locale-languages">
                    <button
                      type="button"
                      lang={language}
                      aria-pressed={selected}
                      aria-label={`${name}, ${languages[language].name}`}
                      onClick={() => {
                        if (!selected) return choose(code, pathname);
                        setOpen(false);
                        onNavigate?.();
                      }}
                    >
                      {selected && <Check size={14} aria-hidden="true" />}
                      {languages[language].name}
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
