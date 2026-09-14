"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { CartLink } from "./add-to-cart";
import { Brand } from "./brand";

const links = [
  ["/products", "Shop"],
  ["/boxes", "Boxes"],
  ["/our-farm", "Our Story"],
  ["/health", "Health"],
  ["/recipes", "Recipes"],
  ["/wholesale", "Business"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="header-shell">
      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
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
            Let’s talk <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
        <CartLink />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
            >
              <Menu />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="mobile-nav-panel">
              <Dialog.Title className="wordmark">floruvi</Dialog.Title>
              <Dialog.Description>
                Explore the farm and get in touch.
              </Dialog.Description>
              <Dialog.Close
                className="icon-button dialog-close"
                aria-label="Close navigation"
              >
                <X />
              </Dialog.Close>
              <nav aria-label="Mobile navigation">
                {[...links, ["/contact", "Let’s talk"]].map(([href, label]) => (
                  <Link href={href} key={href} onClick={() => setOpen(false)}>
                    {label}
                    <ArrowUpRight size={20} />
                  </Link>
                ))}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </div>
  );
}
