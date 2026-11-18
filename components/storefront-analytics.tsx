"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import {
  analyticsConfigured,
  CONSENT_KEY,
  pageViewed,
  setAnalyticsConsent,
  stopRecording,
  captureStorefrontError,
  reportStorefrontVital,
} from "@/lib/analytics";
import {
  parseAnalyticsConsent,
  publicAnalyticsPath,
  resolveAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-policy";

const NONE: AnalyticsConsent = { analytics: false, replay: false };
function browserPrivacySignals() {
  return {
    globalPrivacyControl: (
      navigator as Navigator & { globalPrivacyControl?: boolean }
    ).globalPrivacyControl,
    doNotTrack: navigator.doNotTrack,
  };
}

export function StorefrontAnalytics() {
  useReportWebVitals(reportStorefrontVital);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<AnalyticsConsent | null>(null);
  const [analytics, setAnalytics] = useState(false);
  const [replay, setReplay] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let saved: AnalyticsConsent | null = null;
    try {
      saved = parseAnalyticsConsent(localStorage.getItem(CONSENT_KEY));
    } catch {
      /* Default off if storage is unavailable. */
    }
    saved = resolveAnalyticsConsent(saved, browserPrivacySignals());
    // Read browser-only preferences after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(saved);
    setAnalytics(saved?.analytics || false);
    setReplay(saved?.replay || false);
    setReady(analyticsConfigured());
    void setAnalyticsConsent(saved || NONE);
    const beforeNavigation = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.getAttribute("href")!, location.href);
      if (
        url.origin !== location.origin ||
        !publicAnalyticsPath(url.pathname) ||
        url.search ||
        url.hash
      )
        stopRecording();
    };
    const onError = (event: ErrorEvent) => captureStorefrontError(event.error);
    const onRejection = (event: PromiseRejectionEvent) =>
      captureStorefrontError(event.reason);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        const next = resolveAnalyticsConsent(
          parseAnalyticsConsent(event.newValue),
          browserPrivacySignals(),
        );
        setChoice(next);
        setAnalytics(next?.analytics || false);
        setReplay(next?.replay || false);
        void setAnalyticsConsent(next || NONE);
      }
    };
    document.addEventListener("click", beforeNavigation, true);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("storage", onStorage);
    return () => {
      stopRecording();
      document.removeEventListener("click", beforeNavigation, true);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    pageViewed();
  }, [pathname]);

  function save(next: AnalyticsConsent) {
    const value =
      resolveAnalyticsConsent(next, browserPrivacySignals()) || NONE;
    setChoice(value);
    setAnalytics(value.analytics);
    setReplay(value.replay);
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ version: 1, ...value }),
      );
    } catch {
      /* Choice still applies for this visit. */
    }
    void setAnalyticsConsent(value);
    dialog.current?.close();
  }

  function openPrivacy() {
    stopRecording();
    dialog.current?.showModal();
  }

  if (!ready) return null;
  return (
    <div className="privacy-tools ph-no-capture">
      <div className="privacy-links page-width">
        <button type="button" onClick={openPrivacy}>
          Privacy choices
        </button>
      </div>
      {choice === null && (
        <aside
          className="analytics-consent-banner"
          aria-label="Optional analytics"
        >
          <p>
            Optional analytics helps us improve the shop. No contact or payment
            details. Recordings stay off.
          </p>
          <div className="privacy-actions">
            <button type="button" onClick={() => save(NONE)}>
              Decline
            </button>
            <button type="button" onClick={openPrivacy}>
              Settings
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => save({ analytics: true, replay: false })}
            >
              Allow analytics
            </button>
          </div>
        </aside>
      )}
      <dialog
        ref={dialog}
        className="privacy-dialog"
        aria-labelledby="privacy-dialog-title"
        onClose={() => {
          pageViewed();
        }}
      >
        <div className="privacy-dialog-heading">
          <h2 id="privacy-dialog-title">Your privacy choices</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <>
          <p>
            We use PostHog in the US. These choices do not affect your basket or
            checkout.
          </p>
          <label>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => {
                setAnalytics(e.target.checked);
                if (!e.target.checked) setReplay(false);
              }}
            />{" "}
            Anonymous usage and error reports
          </label>
          <p>
            Helps us understand pages, product interest, and site errors. No
            contact or payment details.
          </p>
          <label>
            <input
              type="checkbox"
              checked={replay}
              disabled={!analytics}
              onChange={(e) => setReplay(e.target.checked)}
            />{" "}
            Masked session recordings
          </label>
          <p>
            Records a 10% sample on public pages. Text and inputs are hidden.
            Checkout, contact, account, and payment pages are excluded.
            Recordings expire after 30 days.
          </p>
          <p>
            Your browser’s Do Not Track or Global Privacy Control signal keeps
            optional tracking off.
          </p>
          <div className="privacy-actions">
            <button type="button" onClick={() => save(NONE)}>
              Decline all
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => save({ analytics, replay })}
            >
              Save choices
            </button>
          </div>
        </>
      </dialog>
    </div>
  );
}
