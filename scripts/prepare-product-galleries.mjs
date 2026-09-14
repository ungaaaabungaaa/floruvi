import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const directory = 'src/assets/products/gallery';
const pngs = (await fs.readdir(directory)).filter(file => file.endsWith('.png')).sort();
for (const file of pngs) {
  await sharp(path.join(directory, file)).resize(960, 960, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(directory, file.replace('.png', '.webp')));
}
const files = (await fs.readdir(directory)).filter(file => file.endsWith('.webp')).sort();
await fs.writeFile('lib/product-gallery-images.ts', 'import type { StaticImageData } from "next/image";\n' + files.map((file, i) => `import gallery${i} from "@/src/assets/products/gallery/${file}";`).join('\n') + '\nexport const productGalleryImages: Record<string, StaticImageData> = {\n' + files.map((file, i) => `  "${file.replace('.webp', '')}": gallery${i},`).join('\n') + '\n};\n');
console.log(`Prepared ${files.length} product gallery images`);
