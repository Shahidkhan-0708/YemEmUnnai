const fs = require('fs');
const path = require('path');

const pngPath = path.resolve('NewLogo.png');
const pngData = fs.readFileSync(pngPath);
const base64Data = pngData.toString('base64');
const uri = `data:image/png;base64,${base64Data}`;

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1600 1600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet">
  <title>YEMUNNAI - A Food Discovery Platform</title>
  <desc>Official YEMUNNAI mascot logo with exact character art and typography</desc>
  <image width="1600" height="1600" href="${uri}" xlink:href="${uri}" />
</svg>
`;

fs.writeFileSync(path.resolve('NewLogo.svg'), svgContent, 'utf8');
fs.writeFileSync(path.resolve('public/images/NewLogo.svg'), svgContent, 'utf8');
console.log('✓ Successfully generated NewLogo.svg and public/images/NewLogo.svg with 100% exact fidelity.');
