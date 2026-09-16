"use client";
import Link from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowUpRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { stripLocale } from "@/lib/i18n/config";
import { CartLink } from "./add-to-cart";
import { WishlistMenu } from "./wishlist";
import { Brand } from "./brand";
import { LocalePicker } from "./i18n/locale-picker";
import { useI18n } from "./i18n/provider";

export function Header() {
  const { t } = useI18n();
  const pathname = stripLocale(usePathname());
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    ["/products", t.nav.shop],
    ["/boxes", t.nav.boxes],
    ["/recipes", t.nav.recipes],
  ];
  const close = () => setOpen(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = window.requestAnimationFrame(onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <div className={`header-shell${scrolled ? " is-scrolled" : ""}`}>
      <header className="site-header">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="icon-button mobile-menu" aria-label={t.nav.open}>
              <Menu />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="mobile-nav-panel">
              <div className="mobile-nav-top">
                <Dialog.Title className="wordmark">floruvi</Dialog.Title>
                <Dialog.Close className="icon-button" aria-label={t.nav.close}>
                  <X />
                </Dialog.Close>
              </div>
              <Dialog.Description>{t.nav.description}</Dialog.Description>
              <nav aria-label={t.nav.mobile}>
                {[
                  ...links,
                  ["/contact", t.nav.talk],
                  ["/faq", t.footer.faq],
                  ["/privacy", t.footer.privacy],
                ].map(([href, label]) => (
                  <Link href={href} key={href} onClick={close}>
                    <span>{label}</span>
                    <ChevronRight size={20} aria-hidden="true" />
                  </Link>
                ))}
                <LocalePicker variant="row" onNavigate={close} />
                <WishlistMenu inNavigation onNavigate={close} />
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Brand />
        <nav className="desktop-nav" aria-label={t.nav.main}>
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            {t.nav.talk} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
        <div className="header-actions">
          <div className="desktop-locale">
            <LocalePicker />
          </div>
          <CartLink />
          <div className="desktop-wishlist">
            <WishlistMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
