import Image, { type StaticImageData } from "next/image";

export function EditorialBanner({
  image,
  title,
  alt,
  className = "",
}: {
  image: StaticImageData;
  title: string;
  alt: string;
  className?: string;
}) {
  return (
    <aside
      className={`recipe-banner recipe-interlude editorial-banner ${className}`}
      aria-label={title}
    >
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className="recipe-banner-photo"
      />
      <div className="recipe-banner-copy">
        <h2>{title}</h2>
      </div>
    </aside>
  );
}
