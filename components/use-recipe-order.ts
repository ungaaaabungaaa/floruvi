"use client";
import { useMemo, useSyncExternalStore } from "react";
import { readSessionSeed, sessionOrder } from "@/lib/session-order";

let seed: number | null = null;
const getSnapshot = () => seed;
const getServerSnapshot = () => null;
function subscribe(notify: () => void) {
  if (seed === null) {
    // Access storage through wrappers: even getting sessionStorage can throw.
    seed = readSessionSeed(
      {
        getItem: (key) => window.sessionStorage.getItem(key),
        setItem: (key, value) => window.sessionStorage.setItem(key, value),
      },
      () => crypto.getRandomValues(new Uint32Array(1))[0],
    );
  }
  notify();
  return () => {};
}

export function useRecipeOrder<T extends { slug: string }>(recipes: T[]) {
  const sessionSeed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return useMemo(
    () => sessionOrder(recipes, sessionSeed),
    [recipes, sessionSeed],
  );
}
