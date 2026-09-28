const fs = require('fs');
['04_business_dashboard.svg', '05_add_edit_food_item.svg'].forEach(f => {
  const content = fs.readFileSync('figma_svgs/' + f, 'utf8');
  const styleIdx = content.indexOf('</style>');
  let markup = content.slice(styleIdx + 8);
  markup = markup.replace(/href="data:image[^"]+"/g, 'href="[BASE64_IMAGE]"');
  markup = markup.replace(/xlink:href="data:image[^"]+"/g, 'xlink:href="[BASE64_IMAGE]"');
  console.log('=== ' + f + ' ===');
  console.log(markup);
});
