import Link from "@/components/i18n/link";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = (await getMessages()).notFound;
  return (
    <div className="empty-state page-width section">
      <Sprout size={42} />
      <span className="eyebrow">{t.eyebrow}</span>
      <h1>{t.title}</h1>
      <p>{t.text}</p>
      <Button asChild>
        <Link href="/products">{t.cta}</Link>
      </Button>
    </div>
  );
}
