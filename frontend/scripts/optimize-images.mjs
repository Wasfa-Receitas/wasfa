import sharp from "sharp";
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const recipesDir = path.join(root, "public/images/receitas");
const outputDir = path.join(recipesDir, "optimized");
await mkdir(outputDir, { recursive: true });
const manifest = {};
let originals = 0, cards = 0;
for (const file of await readdir(recipesDir)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const slug = path.parse(file).name;
  const source = path.join(recipesDir, file);
  const variants = [];
  for (const width of [320, 640, 1200]) {
    const name = `${slug}-${width}.webp`;
    const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(outputDir, name));
    variants.push({ url: `/images/receitas/optimized/${name}`, width: result.width });
    if (width === 320) cards += result.size;
  }
  originals += (await stat(source)).size;
  manifest[`/images/receitas/${file}`] = variants;
}
await writeFile(path.join(root, "src/recipe-images.json"), JSON.stringify(manifest, null, 2) + "\n");
for (const [name, width] of [["almoco", 800], ["torta", 700], ["suco", 700], ["hotdog", 700], ["wasfalogo", 320]]) {
  await sharp(path.join(root, `assets/img/${name}.png`)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(root, `assets/img/${name}.webp`));
}
console.log(`Receitas: ${(originals / 1e6).toFixed(2)} MB originais; ${(cards / 1e6).toFixed(2)} MB nas versões de 320px.`);
