"use client";
import Link from "@/components/i18n/link";
import Image from "next/image";
import mark from "@/src/assets/floruvi-mark.png";
import { useI18n } from "./i18n/provider";

export function Brand() {
  const { t } = useI18n();
  return (
    <Link href="/" className="brand" aria-label={t.brand.home}>
      <Image src={mark} alt="" width={54} height={54} className="brand-mark" />
      <span className="brand-name">
        floruvi<small>{t.brand.tagline}</small>
      </span>
    </Link>
  );
}
