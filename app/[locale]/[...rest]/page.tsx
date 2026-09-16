import { notFound } from "next/navigation";

// Unknown paths inside a locale render the translated not-found page.
export default function UnknownPage() {
  notFound();
}
