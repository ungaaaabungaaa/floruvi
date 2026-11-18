"use client";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/provider";
import { useEffect } from "react";
import { captureStorefrontError } from "@/lib/analytics";

// `retry` fetches the page data again; `reset` would only re-render the failed result.
export default function ErrorPage({
  retry,
  error: failure,
}: {
  retry: () => void;
  error: Error;
}) {
  useEffect(() => {
    captureStorefrontError(failure);
  }, [failure]);
  const { error } = useI18n().t;
  return (
    <div className="empty-state section page-width">
      <span className="eyebrow">{error.eyebrow}</span>
      <h1>{error.title}</h1>
      <p>{error.text}</p>
      <Button onClick={() => retry()}>{error.retry}</Button>
    </div>
  );
}
