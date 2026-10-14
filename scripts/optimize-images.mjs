import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const srcDir = path.resolve(
  "C:/Users/wesker/.cursor/projects/c-Users-wesker-Desktop-Miniautos/assets",
);
const outDir = path.resolve("public/images");

const files = [
  ["kompakt-sauna-one.jpg", "kompakt-sauna-one.webp", 2000],
  ["kompakt-sauna-one-detail.jpg", "kompakt-sauna-one-detail.webp", 2000],
  ["nordik-mini-sauna.jpg", "nordik-mini-sauna.webp", 2000],
  ["premium-relax-sauna.jpg", "premium-relax-sauna.webp", 2000],
  ["premium-relax-sauna-detail.jpg", "premium-relax-sauna-detail.webp", 2000],
  ["panorama-mini-sauna.jpg", "panorama-mini-sauna.webp", 2000],
  ["panorama-mini-sauna-detail.jpg", "panorama-mini-sauna-detail.webp", 2000],
  ["hero-wellness-oase.jpg", "hero-wellness-oase.webp", 2400],
];

await mkdir(outDir, { recursive: true });

for (const [source, target, width] of files) {
  const info = await sharp(path.join(srcDir, source))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(outDir, target));
  console.log(`${target} ${info.width}x${info.height} ${Math.round(info.size / 1024)}kb`);
}
