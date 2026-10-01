import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve('public/images');
const files = fs.readdirSync(dir);

console.log(`Starting Sharp image optimization in ${dir}...`);
let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  const ext = path.extname(file).toLowerCase();

  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;

  const stat = fs.statSync(filePath);
  const beforeSize = stat.size;
  totalBefore += beforeSize;

  // Preserve critical branding transparent assets without heavy compression
  if (['brand_logo_full.png', 'mascot.png'].includes(file)) {
    totalAfter += beforeSize;
    continue;
  }

  try {
    const image = sharp(filePath);

    let transform = image.resize({
      width: 640,
      height: 640,
      fit: 'inside',
      withoutEnlargement: true
    });

    let buffer;
    if (ext === '.png') {
      buffer = await transform
        .png({
          quality: 82,
          compressionLevel: 9,
          palette: true,
          effort: 8
        })
        .toBuffer();
    } else if (ext === '.jpg' || ext === '.jpeg') {
      buffer = await transform
        .jpeg({
          quality: 80,
          mozjpeg: true
        })
        .toBuffer();
    } else if (ext === '.webp') {
      buffer = await transform
        .webp({
          quality: 80,
          effort: 6
        })
        .toBuffer();
    }

    if (buffer && buffer.length < beforeSize) {
      fs.writeFileSync(filePath, buffer);
      const afterSize = buffer.length;
      totalAfter += afterSize;
      const savedKB = ((beforeSize - afterSize) / 1024).toFixed(1);
      console.log(`✓ ${file}: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (-${savedKB} KB)`);
    } else {
      totalAfter += beforeSize;
    }
  } catch (err) {
    console.error(`✗ Error optimizing ${file}:`, err.message);
    totalAfter += beforeSize;
  }
}

const mbBefore = (totalBefore / (1024 * 1024)).toFixed(2);
const mbAfter = (totalAfter / (1024 * 1024)).toFixed(2);
const savedMB = ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2);
const percent = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);

console.log(`\n🎉 Image Optimization Complete!`);
console.log(`Original: ${mbBefore} MB | Optimized: ${mbAfter} MB | Saved: ${savedMB} MB (${percent}%)`);
