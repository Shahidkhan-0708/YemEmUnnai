const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const figmaDir = path.join(rootDir, 'figma_svgs');
const publicDir = path.join(rootDir, 'public/svgs');

// Extract defs and embedded font
const sampleSvgPath = path.join(figmaDir, '02_quick_order_modal.svg');
const sampleSvg = fs.readFileSync(sampleSvgPath, 'utf8');

const defsMatch = sampleSvg.match(/<defs>([\s\S]*?)<\/defs>/);
const defsInner = defsMatch ? defsMatch[1] : '';

const styleMatch = sampleSvg.match(/<style>([\s\S]*?)<\/style>/);
const styleInner = styleMatch ? styleMatch[1] : '';

function getBase64Image(filename) {
  const p = path.join(rootDir, 'public/images', filename);
  if (fs.existsSync(p)) {
    const ext = path.extname(filename).toLowerCase() === '.png' ? 'png' : 'jpeg';
    return `data:image/${ext};base64,${fs.readFileSync(p).toString('base64')}`;
  }
  return '';
}

const samosaUri = getBase64Image('samosa.jpg');
const biryaniUri = getBase64Image('biryani.jpg');
const chipsUri = getBase64Image('chips_bowl.jpg');
const laysUri = getBase64Image('lays_packet.jpg');
const canteenUri = getBase64Image('shop_canteen.jpg');
const royalUri = getBase64Image('shop_royal.jpg');
const chaiUri = getBase64Image('shop_chai.jpg');
const yatUri = getBase64Image('shop_yat.jpg');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function sanitizeXml(str) {
  return str.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
}

function buildHomeDiscoveryFeedSvg() {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="375" height="812" viewBox="0 0 375 812" role="img" aria-labelledby="title desc">
<title id="title">Home &amp; Discovery Feed</title>
<desc id="desc">YEMEMUNNAI polished food discovery feed with ample top breathing room, high-contrast text, scrim photo protection, and unified 10px rounded action buttons.</desc>
<defs>
${defsInner}
  <!-- Scrim Gradient for 100% Text Readability over bright photos -->
  <linearGradient id="photoScrim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="45%" stop-color="#000000" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.68"/>
  </linearGradient>
</defs><style>${styleInner}</style>

<!-- Canvas Background -->
<rect width="375" height="812" fill="#E5EDE9"/>

<!-- TOP DEEP FOREST-GREEN HEADER WITH EXTENDED TOP PADDING & LUXURY ARC -->
<path d="M0 0 H375 V180 C375 198, 355 208, 332 208 H43 C20 208, 0 198, 0 180 Z" fill="url(#emerald)"/>

<!-- Search Input & Cart Button (34px breathing room from top edge) -->
<g transform="translate(18, 34)">
  <!-- Search Field with subtle inner glow -->
  <rect width="285" height="42" rx="21" fill="#DCE5E0" filter="url(#inset)"/>
  
  <!-- Search Icon -->
  <g transform="translate(15, 13)" stroke="#527063" stroke-width="1.8" fill="none" stroke-linecap="round">
    <circle cx="6" cy="6" r="5"/>
    <path d="M10 10 L14 14"/>
  </g>
  <text x="42" y="26" font-size="12" font-weight="600" fill="#527063">Search biryani, samosa, canteens...</text>

  <!-- Orange Cart CTA Button with Badge -->
  <g transform="translate(296, 1)">
    <circle cx="20" cy="20" r="20" fill="url(#orange)" filter="url(#warm)"/>
    <!-- Cart Icon -->
    <g transform="translate(11, 11)" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="15" r="1.5" fill="#FFFFFF"/>
      <circle cx="14" cy="15" r="1.5" fill="#FFFFFF"/>
      <path d="M1 1h3l2 10h10l2-7H5"/>
    </g>
    <!-- Badge Counter -->
    <circle cx="32" cy="7" r="7.5" fill="#FFFFFF"/>
    <text x="32" y="10.5" font-size="9" font-weight="800" fill="#F26A00" text-anchor="middle">2</text>
  </g>
</g>

<!-- Local Shops Section -->
<g transform="translate(18, 92)">
  <text x="0" y="18" font-size="13" font-weight="800" fill="#FFFFFF" letter-spacing="0.2">Local Canteens &amp; Shops</text>
  
  <g transform="translate(150, 6)">
    <rect width="70" height="16" rx="8" fill="#063214" stroke="#10B981" stroke-width="0.8"/>
    <circle cx="8" cy="8" r="3" fill="#10B981"/>
    <text x="39" y="11.5" font-size="8" font-weight="800" fill="#A7F3D0" text-anchor="middle">LIVE RADAR</text>
  </g>

  <text x="339" y="18" font-size="11" font-weight="700" fill="#A7F3D0" text-anchor="end">View All ›</text>

  <!-- Shop Avatars Row -->
  <!-- Shop 1: MITS Canteen (Active) -->
  <g transform="translate(2, 28)">
    <circle cx="27" cy="27" r="27" fill="#10B981"/>
    <circle cx="27" cy="27" r="25" fill="#0A461E"/>
    <clipPath id="shop1Clip">
      <circle cx="27" cy="27" r="24"/>
    </clipPath>
    <image href="${canteenUri}" x="3" y="3" width="48" height="48" clip-path="url(#shop1Clip)" preserveAspectRatio="xMidYMid slice"/>
    <circle cx="44" cy="44" r="5" fill="#10B981" stroke="#09431B" stroke-width="1.5"/>
    <text x="27" y="68" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">MITS Canteen</text>
    <text x="27" y="78" font-size="8" font-weight="500" fill="#A7F3D0" text-anchor="middle">160m walk</text>
  </g>

  <!-- Shop 2: Royal Corner -->
  <g transform="translate(86, 28)">
    <circle cx="27" cy="27" r="26" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.5"/>
    <clipPath id="shop2Clip">
      <circle cx="27" cy="27" r="24"/>
    </clipPath>
    <image href="${royalUri}" x="3" y="3" width="48" height="48" clip-path="url(#shop2Clip)" preserveAspectRatio="xMidYMid slice"/>
    <text x="27" y="68" font-size="10" font-weight="600" fill="#FFFFFF" text-anchor="middle">Royal Corner</text>
    <text x="27" y="78" font-size="8" font-weight="500" fill="#A7F3D0" text-anchor="middle">320m walk</text>
  </g>

  <!-- Shop 3: Chai Spot -->
  <g transform="translate(170, 28)">
    <circle cx="27" cy="27" r="26" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.5"/>
    <clipPath id="shop3Clip">
      <circle cx="27" cy="27" r="24"/>
    </clipPath>
    <image href="${chaiUri}" x="3" y="3" width="48" height="48" clip-path="url(#shop3Clip)" preserveAspectRatio="xMidYMid slice"/>
    <text x="27" y="68" font-size="10" font-weight="600" fill="#FFFFFF" text-anchor="middle">Chai Spot</text>
    <text x="27" y="78" font-size="8" font-weight="500" fill="#A7F3D0" text-anchor="middle">210m walk</text>
  </g>

  <!-- Shop 4: Vatika Tuck -->
  <g transform="translate(254, 28)">
    <circle cx="27" cy="27" r="26" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.5"/>
    <clipPath id="shop4Clip">
      <circle cx="27" cy="27" r="24"/>
    </clipPath>
    <image href="${yatUri}" x="3" y="3" width="48" height="48" clip-path="url(#shop4Clip)" preserveAspectRatio="xMidYMid slice"/>
    <text x="27" y="68" font-size="10" font-weight="600" fill="#FFFFFF" text-anchor="middle">Vatika Tuck</text>
    <text x="27" y="78" font-size="8" font-weight="500" fill="#A7F3D0" text-anchor="middle">400m walk</text>
  </g>
</g>

<!-- SEGMENTED CATEGORY TABS -->
<g transform="translate(18, 200)">
  <rect width="339" height="38" rx="19" fill="#D5E0DA" stroke="#C4D2CB" filter="url(#inset)"/>
  
  <!-- Active Tab: Cooked Foods -->
  <rect x="3" y="3" width="164" height="32" rx="16" fill="#09431B" filter="url(#buttonShadow)"/>
  <text x="85" y="23" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">🔥 Cooked Foods (12)</text>

  <!-- Inactive Tab: Packed Foods -->
  <text x="250" y="23" font-size="12" font-weight="700" fill="#09431B" text-anchor="middle">✨ Packed Foods (16)</text>
</g>

<!-- 2-COLUMN FOOD CARDS GRID -->
<!-- ROW 1 -->
<!-- CARD 1: CRISPY SAMOSA -->
<g transform="translate(18, 250)">
  <rect width="164" height="246" rx="18" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.85" filter="url(#soft)"/>
  
  <!-- Photo Container with Scrim Protection -->
  <g transform="translate(8, 8)">
    <rect width="148" height="106" rx="12" fill="#E2EDE6"/>
    <clipPath id="card1PhotoClip">
      <rect width="148" height="106" rx="12"/>
    </clipPath>
    <image href="${samosaUri}" x="0" y="-8" width="148" height="122" clip-path="url(#card1PhotoClip)" preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Scrim overlay at bottom of photo for text protection -->
    <rect y="46" width="148" height="60" rx="12" fill="url(#photoScrim)" clip-path="url(#card1PhotoClip)"/>

    <!-- Fresh Tag (Top-Left) -->
    <rect x="6" y="6" width="76" height="18" rx="9" fill="#062E16" fill-opacity="0.92" stroke="#10B981" stroke-width="0.8"/>
    <circle cx="13" cy="15" r="2.5" fill="#10B981"/>
    <text x="45" y="18.5" font-size="7.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Fresh Batch</text>
    
    <!-- Walk Time (Bottom-Right, Protected over scrim) -->
    <g transform="translate(84, 80)">
      <rect width="58" height="20" rx="6" fill="#062E16" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.8"/>
      <text x="29" y="13.5" font-size="8" font-weight="800" fill="#A7F3D0" text-anchor="middle">⚡ 2 min walk</text>
    </g>
  </g>

  <!-- Card Details: High Contrast Typography -->
  <text x="12" y="131" font-size="13" font-weight="800" fill="#0A2E20">Crispy Samosa</text>
  <text x="12" y="145" font-size="9.5" font-weight="600" fill="#5C7A6D">MITS Canteen • <tspan fill="#D97706" font-weight="700">★ 4.9</tspan></text>
  
  <text x="12" y="165" font-size="16" font-weight="900" fill="#09431B">₹20</text>
  <text x="44" y="165" font-size="10" font-weight="600" fill="#7C9588" text-decoration="line-through">₹25</text>
  <text x="152" y="165" font-size="9" font-weight="800" fill="#D96C37" text-anchor="end">22 left</text>

  <!-- Reaction Bar: High Contrast Separation -->
  <line x1="12" y1="174" x2="152" y2="174" stroke="#CBD9D1" stroke-width="0.8"/>
  
  <g transform="translate(12, 180)">
    <text x="0" y="11" font-size="9" font-weight="800" fill="#09431B">👍 48</text>
    <text x="50" y="11" font-size="9" font-weight="600" fill="#5C7A6D">👎 2</text>
    <text x="96" y="11" font-size="9" font-weight="600" fill="#5C7A6D">💬 14</text>
  </g>

  <!-- Action Button: Modern 10px Rounded Rectangle with Consistent Intention -->
  <g transform="translate(8, 200)">
    <rect width="148" height="36" rx="10" fill="url(#orange)" filter="url(#warm)"/>
    <text x="74" y="22.5" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">+ ORDER • ₹20</text>
  </g>
</g>

<!-- CARD 2: CHICKEN BIRYANI -->
<g transform="translate(193, 250)">
  <rect width="164" height="246" rx="18" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.85" filter="url(#soft)"/>
  
  <!-- Photo Container with Scrim Protection -->
  <g transform="translate(8, 8)">
    <rect width="148" height="106" rx="12" fill="#E2EDE6"/>
    <clipPath id="card2PhotoClip">
      <rect width="148" height="106" rx="12"/>
    </clipPath>
    <image href="${biryaniUri}" x="0" y="-8" width="148" height="122" clip-path="url(#card2PhotoClip)" preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Scrim overlay -->
    <rect y="46" width="148" height="60" rx="12" fill="url(#photoScrim)" clip-path="url(#card2PhotoClip)"/>

    <!-- Fresh Tag -->
    <rect x="6" y="6" width="76" height="18" rx="9" fill="#062E16" fill-opacity="0.92" stroke="#10B981" stroke-width="0.8"/>
    <circle cx="13" cy="15" r="2.5" fill="#10B981"/>
    <text x="45" y="18.5" font-size="7.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Pot #2 Ready</text>
    
    <!-- Walk Time -->
    <g transform="translate(84, 80)">
      <rect width="58" height="20" rx="6" fill="#062E16" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.8"/>
      <text x="29" y="13.5" font-size="8" font-weight="800" fill="#A7F3D0" text-anchor="middle">⚡ 4 min walk</text>
    </g>
  </g>

  <!-- Card Details -->
  <text x="12" y="131" font-size="13" font-weight="800" fill="#0A2E20">Chicken Biryani</text>
  <text x="12" y="145" font-size="9.5" font-weight="600" fill="#5C7A6D">Royal Corner • <tspan fill="#D97706" font-weight="700">★ 4.8</tspan></text>
  
  <text x="12" y="165" font-size="16" font-weight="900" fill="#F26A00">₹140</text>
  <text x="52" y="165" font-size="10" font-weight="600" fill="#7C9588" text-decoration="line-through">₹160</text>
  <text x="152" y="165" font-size="9" font-weight="800" fill="#D96C37" text-anchor="end">12 left</text>

  <!-- Reaction Bar -->
  <line x1="12" y1="174" x2="152" y2="174" stroke="#CBD9D1" stroke-width="0.8"/>
  
  <g transform="translate(12, 180)">
    <text x="0" y="11" font-size="9" font-weight="800" fill="#09431B">👍 96</text>
    <text x="50" y="11" font-size="9" font-weight="600" fill="#5C7A6D">👎 1</text>
    <text x="96" y="11" font-size="9" font-weight="600" fill="#5C7A6D">💬 32</text>
  </g>

  <!-- Action Button: Modern 10px Rounded Rectangle with Consistent Intention -->
  <g transform="translate(8, 200)">
    <rect width="148" height="36" rx="10" fill="url(#orange)" filter="url(#warm)"/>
    <text x="74" y="22.5" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">+ ORDER • ₹140</text>
  </g>
</g>

<!-- ROW 2 -->
<!-- CARD 3: POTATO CHIPS BOWL -->
<g transform="translate(18, 506)">
  <rect width="164" height="246" rx="18" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.85" filter="url(#soft)"/>
  
  <g transform="translate(8, 8)">
    <rect width="148" height="106" rx="12" fill="#E2EDE6"/>
    <clipPath id="card3PhotoClip">
      <rect width="148" height="106" rx="12"/>
    </clipPath>
    <image href="${chipsUri}" x="0" y="-8" width="148" height="122" clip-path="url(#card3PhotoClip)" preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Scrim overlay -->
    <rect y="46" width="148" height="60" rx="12" fill="url(#photoScrim)" clip-path="url(#card3PhotoClip)"/>

    <rect x="6" y="6" width="76" height="18" rx="9" fill="#062E16" fill-opacity="0.92" stroke="#10B981" stroke-width="0.8"/>
    <circle cx="13" cy="15" r="2.5" fill="#10B981"/>
    <text x="45" y="18.5" font-size="7.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Counter Fresh</text>

    <g transform="translate(84, 80)">
      <rect width="58" height="20" rx="6" fill="#062E16" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.8"/>
      <text x="29" y="13.5" font-size="8" font-weight="800" fill="#A7F3D0" text-anchor="middle">⚡ 2 min walk</text>
    </g>
  </g>

  <text x="12" y="131" font-size="13" font-weight="800" fill="#0A2E20">Potato Chips Bowl</text>
  <text x="12" y="145" font-size="9.5" font-weight="600" fill="#5C7A6D">MITS Canteen • <tspan fill="#D97706" font-weight="700">★ 4.6</tspan></text>
  
  <text x="12" y="165" font-size="16" font-weight="900" fill="#09431B">₹20</text>
  <text x="152" y="165" font-size="9" font-weight="800" fill="#D96C37" text-anchor="end">15 left</text>

  <line x1="12" y1="174" x2="152" y2="174" stroke="#CBD9D1" stroke-width="0.8"/>
  <g transform="translate(12, 180)">
    <text x="0" y="11" font-size="9" font-weight="800" fill="#09431B">👍 38</text>
    <text x="50" y="11" font-size="9" font-weight="600" fill="#5C7A6D">👎 3</text>
    <text x="96" y="11" font-size="9" font-weight="600" fill="#5C7A6D">💬 8</text>
  </g>

  <!-- Action Button: Modern 10px Rounded Rectangle with Consistent Intention -->
  <g transform="translate(8, 200)">
    <rect width="148" height="36" rx="10" fill="url(#orange)" filter="url(#warm)"/>
    <text x="74" y="22.5" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">+ ADD • ₹20</text>
  </g>
</g>

<!-- CARD 4: LAY'S SALTED -->
<g transform="translate(193, 506)">
  <rect width="164" height="246" rx="18" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.85" filter="url(#soft)"/>
  
  <g transform="translate(8, 8)">
    <rect width="148" height="106" rx="12" fill="#E2EDE6"/>
    <clipPath id="card4PhotoClip">
      <rect width="148" height="106" rx="12"/>
    </clipPath>
    <image href="${laysUri}" x="0" y="-8" width="148" height="122" clip-path="url(#card4PhotoClip)" preserveAspectRatio="xMidYMid slice"/>
    
    <!-- Scrim overlay -->
    <rect y="46" width="148" height="60" rx="12" fill="url(#photoScrim)" clip-path="url(#card4PhotoClip)"/>

    <rect x="6" y="6" width="76" height="18" rx="9" fill="#062E16" fill-opacity="0.92" stroke="#10B981" stroke-width="0.8"/>
    <circle cx="13" cy="15" r="2.5" fill="#10B981"/>
    <text x="45" y="18.5" font-size="7.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Sealed Pack</text>

    <g transform="translate(84, 80)">
      <rect width="58" height="20" rx="6" fill="#062E16" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="0.8"/>
      <text x="29" y="13.5" font-size="8" font-weight="800" fill="#A7F3D0" text-anchor="middle">⚡ 3 min walk</text>
    </g>
  </g>

  <text x="12" y="131" font-size="13" font-weight="800" fill="#0A2E20">Lay's Classic Salted</text>
  <text x="12" y="145" font-size="9.5" font-weight="600" fill="#5C7A6D">Lays Corner • <tspan fill="#D97706" font-weight="700">★ 4.9</tspan></text>
  
  <text x="12" y="165" font-size="16" font-weight="900" fill="#F26A00">₹20</text>
  <text x="152" y="165" font-size="9" font-weight="800" fill="#D96C37" text-anchor="end">28 left</text>

  <line x1="12" y1="174" x2="152" y2="174" stroke="#CBD9D1" stroke-width="0.8"/>
  <g transform="translate(12, 180)">
    <text x="0" y="11" font-size="9" font-weight="800" fill="#09431B">👍 104</text>
    <text x="50" y="11" font-size="9" font-weight="600" fill="#5C7A6D">👎 2</text>
    <text x="96" y="11" font-size="9" font-weight="600" fill="#5C7A6D">💬 19</text>
  </g>

  <!-- Action Button: Modern 10px Rounded Rectangle with Consistent Intention -->
  <g transform="translate(8, 200)">
    <rect width="148" height="36" rx="10" fill="url(#orange)" filter="url(#warm)"/>
    <text x="74" y="22.5" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">+ ADD • ₹20</text>
  </g>
</g>
</svg>`;

  return sanitizeXml(content);
}

const svgContent = buildHomeDiscoveryFeedSvg();

// Write to both figma_svgs and public/svgs
fs.writeFileSync(path.join(figmaDir, '01_home_discovery_feed.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, '01_home_discovery_feed.svg'), svgContent, 'utf8');
console.log('✓ Successfully generated 01_home_discovery_feed.svg with real public/ images, photo scrim, and consistent 10px buttons!');

// Render high-res PNG preview
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const edge = edgePaths.find(p => fs.existsSync(p));

if (edge) {
  const svgUrl = `file:///${path.join(figmaDir, '01_home_discovery_feed.svg').replace(/\\/g, '/')}`;
  const outPng = path.join(figmaDir, 'previews', '01_home_discovery_feed.png');
  const pubPng = path.join(publicDir, 'previews', '01_home_discovery_feed.png');

  try {
    const cmd = `"${edge}" --headless --disable-gpu --screenshot="${outPng}" --window-size=375,812 --hide-scrollbars "${svgUrl}"`;
    execSync(cmd, { stdio: 'ignore' });
    if (fs.existsSync(outPng)) {
      fs.copyFileSync(outPng, pubPng);
      console.log(`✓ Rendered preview for 01_home_discovery_feed.png (${fs.statSync(outPng).size} bytes)`);
    }
  } catch (err) {
    console.error('Failed to render preview:', err.message);
  }
}
