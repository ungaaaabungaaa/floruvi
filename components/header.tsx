"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  ["/products", "Shop"],
  ["/our-farm", "Our Story"],
  ["/health", "Health"],
  ["/recipes", "Recipes"],
  ["/wholesale", "For businesses"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Floruvi home">
          floruvi
          <small>
            GOOD GREENS
            <br />
            BRIGHTER DAYS
          </small>
        </Link>
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
        </nav>
        <Button
          asChild
          variant="outline"
          size="small"
          className="header-contact"
        >
          <Link href="/contact">
            Let’s talk <ArrowUpRight size={16} />
          </Link>
        </Button>
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
    </>
  );
}
