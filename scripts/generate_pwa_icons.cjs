/**
 * Generates the PWA icon set (192, 512, maskable 512) from public/images/logo.png.
 * Run: node scripts/generate_pwa_icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.join(__dirname, '..');
const logoPath = path.join(rootDir, 'public', 'images', 'logo.png');
const outDir = path.join(rootDir, 'public', 'icons');
const BRAND_BG = { r: 9, g: 67, b: 27, alpha: 1 }; // #09431B

fs.mkdirSync(outDir, { recursive: true });

async function main() {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo not found: ${logoPath}`);
  }

  // Standard icons: the logo fills the entire icon square, edge to edge.
  for (const size of [192, 512]) {
    await sharp(logoPath)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`icon-${size}.png written`);
  }

  // Maskable icon: full-bleed logo — OS masks crop the edges, the centre stays safe.
  const maskSize = 512;
  await sharp(logoPath)
    .resize(maskSize, maskSize, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(outDir, 'icon-maskable-512.png'));
  console.log('icon-maskable-512.png written');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
