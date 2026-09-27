"use client";
import { useEffect, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";

const HOUR = 60 * 60 * 1000;

/** Renews the session on load and when the tab comes back, at most once an hour. */
export function KeepSignedIn() {
  const router = useRouter();
  useEffect(() => {
    let last = 0;
    const renew = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < HOUR) return;
      last = Date.now();
      fetch("/admin/renew", { method: "POST", cache: "no-store" })
        .then((response) => {
          // The session ended while the tab was open or hidden.
          if (response.status === 401) router.replace("/admin/login");
        })
        .catch(() => {});
    };
    renew();
    document.addEventListener("visibilitychange", renew);
    return () => document.removeEventListener("visibilitychange", renew);
  }, [router]);
  return null;
}

/** A fixed-size bar inside a Link that shows while its page loads. It never moves the layout. */
export function LinkHint() {
  const { pending } = useLinkStatus();
  return <span aria-hidden className={`admin-hint${pending ? " is-pending" : ""}`} />;
}

/** A submit button that stays the same size and blocks repeat clicks while its form is saving. */
export function SubmitButton({ className, disabled, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      className={`${className ?? ""}${pending ? " is-pending" : ""}`}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    />
  );
}
