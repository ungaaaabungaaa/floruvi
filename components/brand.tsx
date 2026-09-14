import Link from "next/link";
import Image from "next/image";
import mark from "@/src/assets/floruvi-mark.png";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Floruvi home">
      <Image src={mark} alt="" width={54} height={54} className="brand-mark" />
      <span className="brand-name">
        floruvi<small>Freshness worth growing</small>
      </span>
    </Link>
  );
}
