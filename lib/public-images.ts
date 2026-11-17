import type { StaticImageData } from "next/image";

/** Public R2 files use versioned names and bypass paid image transformations. */
export function publicImage(
  key: string,
  width: number,
  height: number,
): StaticImageData {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL is required for public images.");
  const url = new URL(base);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash)
    throw new Error("The public image base must be an unsigned HTTPS URL.");
  if (
    !key.startsWith("flourvi/") ||
    key.split("/").some((part) => !part || part === "." || part === "..") ||
    /[\\?#]/.test(key)
  )
    throw new Error("Use a public image key inside flourvi/.");
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1)
    throw new Error("Public image dimensions must be positive integers.");
  return {
    src: `${url.href.replace(/\/+$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`,
    width,
    height,
  };
}
