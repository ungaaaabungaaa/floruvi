"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./provider";

/** next/link that keeps visitors inside their country and language version. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { href: localize } = useI18n();
  return (
    <NextLink href={typeof href === "string" ? localize(href) : href} {...props} />
  );
}
