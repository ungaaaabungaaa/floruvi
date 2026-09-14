"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state section page-width">
      <span className="eyebrow">A SMALL PAUSE</span>
      <h1>We couldn’t load this page.</h1>
      <p>The farm catalogue is temporarily unavailable. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
