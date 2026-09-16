"use client";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/provider";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { error } = useI18n().t;
  return (
    <div className="empty-state section page-width">
      <span className="eyebrow">{error.eyebrow}</span>
      <h1>{error.title}</h1>
      <p>{error.text}</p>
      <Button onClick={reset}>{error.retry}</Button>
    </div>
  );
}
