const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const figmaDir = path.join(rootDir, 'figma_svgs');
const publicDir = path.join(rootDir, 'public/svgs');

function updateFile(filename, updater) {
  const fPath = path.join(figmaDir, filename);
  if (!fs.existsSync(fPath)) {
    console.error('File not found:', fPath);
    return;
  }
  let content = fs.readFileSync(fPath, 'utf8');
  content = updater(content);
  fs.writeFileSync(fPath, content, 'utf8');
  
  const pPath = path.join(publicDir, filename);
  fs.writeFileSync(pPath, content, 'utf8');
  console.log(`✓ Updated ${filename} in figma_svgs and public/svgs`);
}

// ============================================================================
// SCREEN 2: 02_quick_order_modal.svg
// ============================================================================
updateFile('02_quick_order_modal.svg', content => {
  const styleIdx = content.indexOf('</style>');
  const prefix = content.slice(0, styleIdx + 8);
  let markup = content.slice(styleIdx + 8);

  // 1. Shift "X" button into upper corner with 16px margin from edge
  // Replace old X: <g transform="translate(330 299) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18"...
  const oldXRegex = /<g transform="translate\(330 299\) scale\(0\.75\)><path d="M6 6l12 12 M18 6L6 18"[^>]*><\/g>/;
  const newX = `<circle cx="334" cy="296" r="14" fill="#DDE7E1"/><g transform="translate(325 287) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#0A2E20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  markup = markup.replace(oldXRegex, newX);

  // 2. Add clear title text ("Delivery Details") above horizontal dividing line
  const oldTitleRegex = /<text x="32" y="316" font-size="15" font-weight="800" fill="#0A2E20" text-anchor="start">Quick Order · No Account Needed<\/text>/;
  const newTitle = `<text x="31" y="310" font-size="17" font-weight="800" fill="#0A2E20" text-anchor="start">Delivery Details</text><text x="31" y="327" font-size="11" font-weight="600" fill="#5C7A6D" text-anchor="start">Instant Campus Checkout • No Account Needed</text><path d="M31 336H344" stroke="#CAD8D0"/>`;
  markup = markup.replace(oldTitleRegex, newTitle);

  // 3. Button corner radius to 12px
  markup = markup.replace(/<rect x="29" y="605" width="317" height="47" rx="23\.5"/, '<rect x="29" y="605" width="317" height="47" rx="12"');

  return prefix + markup;
});

// ============================================================================
// SCREEN 3: 03_feedback_popup.svg
// ============================================================================
updateFile('03_feedback_popup.svg', content => {
  const styleIdx = content.indexOf('</style>');
  const prefix = content.slice(0, styleIdx + 8);
  let markup = content.slice(styleIdx + 8);

  // 1. Shift "X" button into upper corner with 16px margin from edge
  const oldXRegex = /<g transform="translate\(330 297\) scale\(0\.75\)><path d="M6 6l12 12 M18 6L6 18"[^>]*><\/g>/;
  const newX = `<circle cx="334" cy="296" r="14" fill="#DDE7E1"/><g transform="translate(325 287) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#0A2E20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  markup = markup.replace(oldXRegex, newX);

  // 2. Clear title text & subtitle
  const oldTitleRegex = /<text x="32" y="314" font-size="15" font-weight="800" fill="#0A2E20" text-anchor="start">FEEDBACK POP-UP<\/text>/;
  const newTitle = `<text x="31" y="310" font-size="17" font-weight="800" fill="#0A2E20" text-anchor="start">Rating &amp; Feedback</text><text x="31" y="327" font-size="11" font-weight="600" fill="#5C7A6D" text-anchor="start">Help MITS Canteen improve live batch quality</text><path d="M31 336H344" stroke="#CAD8D0"/>`;
  markup = markup.replace(oldTitleRegex, newTitle);

  // 3. Remove thumb icons and center slider switch; let stars handle rating with subtitle
  const thumbsRegex = /<g transform="translate\(36 419\) scale\(0\.875\)>[\s\S]*?<text x="264" y="435" font-size="13" font-weight="700" fill="#0A2E20" text-anchor="start">Dislike<\/text>/;
  const ratingStatus = `<text x="32" y="420" font-size="11" font-weight="700" fill="#09431B">★ ★ ★ ★ ★ Tap stars to rate</text><text x="343" y="420" font-size="11" font-weight="700" fill="#EAA02B" text-anchor="end">5.0 • Super Tasty</text>`;
  markup = markup.replace(thumbsRegex, ratingStatus);

  // 4. Adjust review comment box to fill the breathing room comfortably
  markup = markup.replace(/<rect x="29" y="459" width="317" height="151" rx="20"/, '<rect x="29" y="438" width="317" height="175" rx="16"');
  markup = markup.replace(/<text x="44" y="485"/, '<text x="44" y="466"');

  // 5. Button corner radius to 12px
  markup = markup.replace(/<rect x="29" y="636" width="317" height="46" rx="23\.0"/, '<rect x="29" y="636" width="317" height="46" rx="12"');

  return prefix + markup;
});

// ============================================================================
// SCREEN 4: 04_business_dashboard.svg
// ============================================================================
updateFile('04_business_dashboard.svg', content => {
  const styleIdx = content.indexOf('</style>');
  const prefix = content.slice(0, styleIdx + 8);
  let markup = content.slice(styleIdx + 8);

  // 1. Add explicit text block placeholders & labels next to phone and location icons
  const oldPhoneAndLoc = `<g transform="translate(128 481) scale(0.6666666666666666)"><path d="M5 3l4 1 1 5-3 2c1.5 3 3 4.5 6 6l2-3 5 1 1 4c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z" fill="none" stroke="#09431B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="150" y="494" font-size="11" font-weight="600" fill="#0A2E20" text-anchor="start">+91 98765 43210</text><g transform="translate(128 505) scale(0.6666666666666666)"><path d="M12 22S4 14 4 9a8 8 0 1 1 16 0c0 5-8 13-8 13Z M12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6" fill="none" stroke="#09431B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="150" y="518" font-size="11" font-weight="500" fill="#5C7A6D" text-anchor="start">Main Block, MITS</text>`;
  
  const newPhoneAndLoc = `<rect x="124" y="473" width="220" height="26" rx="8" fill="#DCE7E1"/><g transform="translate(131 478) scale(0.6666666666666666)"><path d="M5 3l4 1 1 5-3 2c1.5 3 3 4.5 6 6l2-3 5 1 1 4c0 2-2 3-4 2C9 19 5 15 3 7c-1-2 0-4 2-4Z" fill="none" stroke="#09431B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="150" y="490" font-size="10" font-weight="700" fill="#5C7A6D" text-anchor="start">Phone:</text><text x="190" y="490" font-size="11" font-weight="800" fill="#0A2E20" text-anchor="start">+91 98765 43210</text><rect x="124" y="504" width="220" height="26" rx="8" fill="#DCE7E1"/><g transform="translate(131 509) scale(0.6666666666666666)"><path d="M12 22S4 14 4 9a8 8 0 1 1 16 0c0 5-8 13-8 13Z M12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6" fill="none" stroke="#09431B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="150" y="521" font-size="10" font-weight="700" fill="#5C7A6D" text-anchor="start">Deliver to:</text><text x="210" y="521" font-size="11" font-weight="800" fill="#0A2E20" text-anchor="start">Main Block, Room 204</text>`;
  
  markup = markup.replace(oldPhoneAndLoc, newPhoneAndLoc);

  // 2. Give green checkmark button and red cross button equal visual weight (equal width side-by-side: 150px each, rx=12)
  const oldButtons = `<rect x="30" y="548" width="111" height="39" rx="19.5" fill="#E5EDE9" stroke="#C8978F"/><g transform="translate(42 558.5) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#9B443B" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="92.5" y="571.5" font-size="12" font-weight="700" fill="#9B443B" text-anchor="middle">Decline</text><rect x="151" y="548" width="193" height="39" rx="19.5" fill="#09431B" filter="url(#buttonShadow)"/><g transform="translate(163 558.5) scale(0.75)"><path d="M4 12l5 5L20 6" fill="none" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="254.5" y="571.5" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Accept &amp; Prepare</text>`;
  
  const newButtons = `<rect x="30" y="546" width="150" height="42" rx="12" fill="#FDF3F2" stroke="#E5ABA5"/><g transform="translate(62 557) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#B4382B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g><text x="108" y="572" font-size="13" font-weight="700" fill="#B4382B" text-anchor="middle">Decline</text><rect x="195" y="546" width="150" height="42" rx="12" fill="#09431B" filter="url(#buttonShadow)"/><g transform="translate(216 557) scale(0.75)"><path d="M4 12l5 5L20 6" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g><text x="278" y="572" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">Accept &amp; Prep</text>`;
  
  markup = markup.replace(oldButtons, newButtons);

  return prefix + markup;
});

// ============================================================================
// SCREEN 5: 05_add_edit_food_item.svg
// ============================================================================
updateFile('05_add_edit_food_item.svg', content => {
  const styleIdx = content.indexOf('</style>');
  const prefix = content.slice(0, styleIdx + 8);
  let markup = content.slice(styleIdx + 8);

  // 1. Shift "X" button into upper corner with 16px margin from edge
  const oldX = `<g transform="translate(330 201) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#6A8174" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const newX = `<circle cx="334" cy="199" r="14" fill="#DDE7E1"/><g transform="translate(325 190) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#0A2E20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  markup = markup.replace(oldX, newX);

  // 2. Subtitle under title
  markup = markup.replace(/<text x="32" y="218" font-size="15" font-weight="800" fill="#0A2E20" text-anchor="start">Add\/Edit Food Item<\/text>/, '<text x="32" y="215" font-size="17" font-weight="800" fill="#0A2E20" text-anchor="start">Add &amp; Edit Food Item</text><text x="32" y="231" font-size="11" font-weight="600" fill="#5C7A6D" text-anchor="start">Manage live canteen inventory</text>');

  // 3. Shift toggle switch to align with margin, add clear label ("Vegetarian Only")
  const oldToggle = `<text x="31" y="512" font-size="13" font-weight="700" fill="#0A2E20" text-anchor="start">Stock Status</text><text x="184" y="512" font-size="12" font-weight="600" fill="#0A2E20" text-anchor="start">In</text><rect x="207" y="495" width="43" height="24" rx="12" fill="#73AF83" /><circle cx="238" cy="507" r="9" fill="#F3F8F5" filter="url(#buttonShadow)"/><text x="264" y="512" font-size="12" font-weight="600" fill="#A44E40" text-anchor="start">Sold Out</text>`;
  
  const newToggle = `<text x="31" y="508" font-size="13" font-weight="700" fill="#0A2E20" text-anchor="start">Vegetarian Only</text><text x="31" y="523" font-size="10" font-weight="500" fill="#5C7A6D" text-anchor="start">Pure veg preparation</text><rect x="296" y="499" width="50" height="28" rx="14" fill="#09431B"/><circle cx="332" cy="513" r="11" fill="#FFFFFF" filter="url(#buttonShadow)"/>`;
  
  markup = markup.replace(oldToggle, newToggle);

  // 4. Button corner radius to 12px
  markup = markup.replace(/<rect x="29" y="710" width="317" height="47" rx="23\.5"/, '<rect x="29" y="710" width="317" height="47" rx="12"');

  return prefix + markup;
});

// ============================================================================
// SCREEN 6: 06_walk_in_map_modal.svg
// ============================================================================
updateFile('06_walk_in_map_modal.svg', content => {
  const styleIdx = content.indexOf('</style>');
  const prefix = content.slice(0, styleIdx + 8);
  let markup = content.slice(styleIdx + 8);

  // 1. Shift "X" button into upper corner with 16px margin from edge
  const oldX = `<g transform="translate(330 253) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#6A8174" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const newX = `<circle cx="334" cy="251" r="14" fill="#DDE7E1"/><g transform="translate(325 242) scale(0.75)"><path d="M6 6l12 12 M18 6L6 18" fill="none" stroke="#0A2E20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  markup = markup.replace(oldX, newX);

  // 2. Smoothly match map container corner radius with main card border radius (rx=22)
  markup = markup.replace(/<rect x="28" y="348" width="319" height="277" rx="20"/g, '<rect x="28" y="348" width="319" height="277" rx="22"');

  // 3. Center-align the white arrow and text inside the green button, corner radius 12px
  const oldBtn = `<rect x="29" y="706" width="317" height="47" rx="23.5" fill="#09431B" filter="url(#buttonShadow)"/><g transform="translate(41 720.5) scale(0.75)"><path d="M4 12h16 M14 6l6 6-6 6" fill="none" stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="194.5" y="733.5" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Open in Google Maps</text>`;
  
  const newBtn = `<rect x="29" y="706" width="317" height="47" rx="12" fill="#09431B" filter="url(#buttonShadow)"/><g transform="translate(94 720.5) scale(0.75)"><path d="M4 12h16 M14 6l6 6-6 6" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g><text x="195" y="735" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Open in Google Maps</text>`;
  
  markup = markup.replace(oldBtn, newBtn);

  return prefix + markup;
});

// ============================================================================
// SCREEN 7: 07_mascot_logo.svg
// ============================================================================
updateFile('07_mascot_logo.svg', _content => {
  // Read base64 image of logo
  const logoPngPath = path.join(rootDir, 'public/images/logo.png');
  const logoData = fs.readFileSync(logoPngPath).toString('base64');
  const logoUri = `data:image/png;base64,${logoData}`;

  // Fix: Clean up trailing punctuation dots ("..?") to a single, crisp exclamation mark ("YEMEMUNNAI!")
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="546" height="330" viewBox="0 0 546 330" role="img" aria-label="YEMEMUNNAI! Brand Mascot Logo">
<title>YEMEMUNNAI! Mascot Logo</title>
<desc>Official brand mascot and wordmark with crisp exclamation mark.</desc>
<defs>
  <filter id="soft" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
    <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#072A17" flood-opacity="0.12"/>
  </filter>
  <filter id="glow" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#F26A00" flood-opacity="0.25"/>
  </filter>
</defs>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&amp;display=swap');
  text { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
</style>
<!-- Background Canvas -->
<rect width="546" height="330" rx="28" fill="#EBF2EE"/>

<!-- Concentric Brand Rings -->
<circle cx="160" cy="165" r="120" fill="#DDE8E1" opacity="0.6"/>
<circle cx="160" cy="165" r="95" fill="#D1E2D7" opacity="0.8"/>

<!-- Circular Mascot Container -->
<g transform="translate(65, 70)" filter="url(#soft)">
  <circle cx="95" cy="95" r="95" fill="#0A461E"/>
  <circle cx="95" cy="95" r="90" fill="#EFF5EF"/>
  <clipPath id="mascotClip">
    <circle cx="95" cy="95" r="86"/>
  </clipPath>
  <image href="${logoUri}" x="9" y="9" width="172" height="172" clip-path="url(#mascotClip)" preserveAspectRatio="xMidYMid meet"/>
</g>

<!-- Wordmark and Tagline -->
<g transform="translate(285, 110)">
  <!-- Sparkle Badge -->
  <rect x="0" y="0" width="128" height="24" rx="12" fill="#0A461E"/>
  <text x="64" y="16" font-size="10" font-weight="800" fill="#FF8A2A" text-anchor="middle" letter-spacing="1.5">CAMPUS RADAR</text>

  <!-- Cleaned Wordmark: Single Crisp Exclamation Mark -->
  <text x="0" y="62" font-size="36" font-weight="900" fill="#0A2E20" letter-spacing="-0.8">YEMEMUNNAI!</text>
  
  <text x="0" y="92" font-size="13" font-weight="700" fill="#09431B" letter-spacing="0.5">Live Campus Food Discovery</text>
  <text x="0" y="112" font-size="11" font-weight="600" fill="#5C7A6D">Never wait in line for sold-out food.</text>
</g>
</svg>`;
});

console.log('✨ Screens 2-7 successfully updated with all critique fixes!');
