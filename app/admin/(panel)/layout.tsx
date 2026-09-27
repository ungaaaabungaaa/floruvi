import Link from "next/link";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";
import { KeepSignedIn, SubmitButton } from "./client";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="admin-header">
        <div className="admin-header-row">
          <Link href="/admin" className="admin-brand">
            Floruvi admin
          </Link>
          <form action={logout}>
            <SubmitButton className="admin-button ghost small">Sign out</SubmitButton>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="admin-page">{children}</main>
      <KeepSignedIn />
    </>
  );
}
