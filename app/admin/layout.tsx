import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Floruvi admin", template: "%s | Floruvi admin" },
  // The X-Robots-Tag header (next.config.ts) also covers redirects and non-HTML responses.
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true, noimageindex: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className="admin-html">
      <body className="admin-body">{children}</body>
    </html>
  );
}
