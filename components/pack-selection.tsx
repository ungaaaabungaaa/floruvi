"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
const PackContext = createContext<{
  size: number;
  sizes: number[];
  setSize: (size: number) => void;
} | null>(null);
export function PackSelection({
  sizes,
  children,
}: {
  sizes: number[];
  children: ReactNode;
}) {
  const [size, setSize] = useState(sizes[0] ?? 0);
  return (
    <PackContext.Provider
      value={sizes.length ? { size, sizes, setSize } : null}
    >
      {children}
    </PackContext.Provider>
  );
}
export const usePackSelection = () => useContext(PackContext);
