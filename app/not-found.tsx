import Link from "next/link";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="empty-state page-width section">
      <Sprout size={42} />
      <span className="eyebrow">A LITTLE OFF THE GARDEN PATH</span>
      <h1>Nothing growing here.</h1>
      <p>This page or crop could not be found.</p>
      <Button asChild>
        <Link href="/products">Explore our produce ↗</Link>
      </Button>
    </div>
  );
}
