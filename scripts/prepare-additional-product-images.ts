import fs from "node:fs/promises";
import { cropCatalogue } from "../convex/catalogueData";

// Keep this map explicit so Next.js can optimise each generated asset.
// Missing files stop the build preparation instead of silently hiding a view.
async function main() {
  const crops = [...cropCatalogue].sort((a, b) => a.slug.localeCompare(b.slug));
  const imports = ['import type { StaticImageData } from "next/image";'];
  const entries: string[] = [];
  for (const [productIndex, crop] of crops.entries()) {
    const views: string[] = [];
    for (let variant = 1; variant <= 4; variant++) {
      const file = `src/assets/products/additional/${crop.slug}-${variant}.webp`;
      await fs.access(file);
      const variable = `product${productIndex}View${variant}`;
      imports.push(`import ${variable} from "@/${file}";`);
      views.push(variable);
    }
    entries.push(`  "${crop.slug}": [${views.join(", ")}],`);
  }
  await fs.writeFile(
    "lib/additional-product-images.ts",
    `${imports.join("\n")}\n\nexport const additionalProductImages: Record<string, StaticImageData[]> = {\n${entries.join("\n")}\n};\n`,
  );
  console.log(
    `Prepared four additional images for each of ${crops.length} products.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
