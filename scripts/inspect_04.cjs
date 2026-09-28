const fs = require('fs');
const content = fs.readFileSync('figma_svgs/04_business_dashboard.svg', 'utf8');
const styleIdx = content.indexOf('</style>');
let markup = content.slice(styleIdx + 8);
markup = markup.replace(/href="data:image[^"]+"/g, 'href="[BASE64_IMAGE]"');
markup = markup.replace(/xlink:href="data:image[^"]+"/g, 'xlink:href="[BASE64_IMAGE]"');
console.log('=== 04_business_dashboard.svg ===');
console.log(markup);
