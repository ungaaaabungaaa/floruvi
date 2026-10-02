import Link from "@/components/i18n/link";

export function CategoryLinks({
  categories,
  label,
  current,
}: {
  categories: { slug: string; name: string }[];
  label: string;
  current?: string;
}) {
  if (!categories.length) return null;
  return (
    <nav className="category-links" aria-label={label}>
      <span>{label}</span>
      <ul>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/products/category/${category.slug}`}
              aria-current={current === category.slug ? "page" : undefined}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
