const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const logoPngPath = path.join(rootDir, 'public/images/logo.png');

if (!fs.existsSync(logoPngPath)) {
  console.error('Logo PNG not found at', logoPngPath);
  process.exit(1);
}

const logoBase64 = fs.readFileSync(logoPngPath).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const logoSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 520 521" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="object-fit: contain; overflow: visible;">
  <image href="${logoDataUri}" width="520" height="521" preserveAspectRatio="xMidYMid meet" style="object-fit: contain;" />
</svg>
`;

// Save to all target locations
const targets = [
  path.join(rootDir, 'public/logo.svg'),
  path.join(rootDir, 'public/images/logo.svg'),
  path.join(rootDir, 'public/images/yememunnai_logo.svg'),
  path.join(rootDir, 'src/assets/logo.svg')
];

// Ensure src/assets exists
const assetsDir = path.join(rootDir, 'src/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

targets.forEach(loc => {
  fs.writeFileSync(loc, logoSvgContent, 'utf8');
  console.log('✓ Created logo.svg at:', loc);
});

console.log('✨ All logo.svg files updated with exact supplied reference logo artwork!');
