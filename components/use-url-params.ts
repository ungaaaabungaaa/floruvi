"use client";
import { useEffect, useMemo, useState } from "react";

const EVENT = "floruvi:url-params";

// Unlike useSearchParams, this does not suspend on the server, so the product
// grid renders in place in the first HTML. The page passes the request's query.
export function useUrlParams(serverQuery: string) {
  const [query, setQuery] = useState(serverQuery);
  const [rendered, setRendered] = useState(serverQuery);
  if (serverQuery !== rendered) {
    // A navigation rendered this page again with another query.
    setRendered(serverQuery);
    setQuery(serverQuery);
  }
  useEffect(() => {
    const sync = () => setQuery(window.location.search.replace(/^\?/, ""));
    // Back/forward can restore a page rendered for an older query.
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  return useMemo(() => new URLSearchParams(query), [query]);
}

/** Changes query values in place and updates every useUrlParams reader. */
export function setUrlParams(values: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENT));
}
