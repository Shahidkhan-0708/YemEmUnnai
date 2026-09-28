const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const figmaDir = path.join(rootDir, 'figma_svgs');
const publicDir = path.join(rootDir, 'public/svgs');

// Read defs and embedded font from existing 02_quick_order_modal.svg to maintain 100% fidelity
const sampleSvgPath = path.join(figmaDir, '02_quick_order_modal.svg');
const sampleSvg = fs.readFileSync(sampleSvgPath, 'utf8');

// Extract defs
const defsMatch = sampleSvg.match(/<defs>([\s\S]*?)<\/defs>/);
const defsInner = defsMatch ? defsMatch[1] : '';

// Extract style (with Plus Jakarta Sans @font-face)
const styleMatch = sampleSvg.match(/<style>([\s\S]*?)<\/style>/);
const styleInner = styleMatch ? styleMatch[1] : '';

// Helper to load base64 images
function getBase64Image(filename) {
  const p = path.join(rootDir, 'public/images', filename);
  if (fs.existsSync(p)) {
    const ext = path.extname(filename).toLowerCase() === '.png' ? 'png' : 'jpeg';
    return `data:image/${ext};base64,${fs.readFileSync(p).toString('base64')}`;
  }
  return '';
}

const biryaniUri = getBase64Image('biryani.jpg');
const samosaUri = getBase64Image('samosa.jpg');
const logoUri = getBase64Image('logo.png');
const laysUri = getBase64Image('lays_packet.jpg');
const chipsUri = getBase64Image('chips_bowl.jpg');
const shopUri = getBase64Image('shop_canteen.jpg');

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

function svgHeader(title, desc) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="375" height="812" viewBox="0 0 375 812" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(title)}</title><desc id="desc">${escapeXml(desc)}</desc>
<defs>
${defsInner}
</defs><style>${styleInner}</style>
`;
}

// -------------------------------------------------------------
// 08_splash_onboarding.svg
// -------------------------------------------------------------
function buildSplashOnboarding() {
  return `${svgHeader('Splash & Campus Onboarding', 'YEMEMUNNAI onboarding welcome screen with brand mascot, campus selection, operating hours, and quick start CTA.')}
<!-- Background Canvas -->
<rect width="375" height="812" fill="#E5EDE9"/>
<!-- Decorative campus geometry -->
<path d="M-40 280 C60 180, 200 340, 420 220 L420 812 L-40 812 Z" fill="#DCE8E1" opacity="0.7"/>
<path d="M-30 460 C100 380, 240 510, 410 420 L410 812 L-30 812 Z" fill="#D2E2D8" opacity="0.65"/>

<!-- Hero Mascot Badge Card -->
<g transform="translate(25, 38)">
  <rect width="325" height="255" rx="28" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#soft)"/>
  
  <!-- Subtle inner background rings -->
  <circle cx="162.5" cy="115" r="85" fill="#E2EDE6" opacity="0.6"/>
  <circle cx="162.5" cy="115" r="65" fill="#D3E5DA" opacity="0.8"/>
  
  <!-- Mascot Brand Image -->
  <g transform="translate(102.5, 55)">
    <circle cx="60" cy="60" r="58" fill="#0A461E" filter="url(#warm)"/>
    <circle cx="60" cy="60" r="55" fill="#E5EDE9"/>
    <clipPath id="splashMascotClip">
      <circle cx="60" cy="60" r="52"/>
    </clipPath>
    <image href="${logoUri}" x="8" y="8" width="104" height="104" clip-path="url(#splashMascotClip)" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <!-- Floating Badges -->
  <g transform="translate(230, 45)">
    <rect width="72" height="24" rx="12" fill="#0A461E" filter="url(#buttonShadow)"/>
    <text x="36" y="16" font-size="9.5" font-weight="800" fill="#FF8A2A" text-anchor="middle">LIVE RADAR</text>
  </g>
  <g transform="translate(24, 185)">
    <rect width="88" height="22" rx="11" fill="#FFFFFF" stroke="#C4D8CB"/>
    <text x="44" y="15" font-size="9" font-weight="700" fill="#09431B" text-anchor="middle">⚡ Real-time</text>
  </g>
</g>

<!-- Brand Header & Copy -->
<g transform="translate(25, 310)">
  <rect width="138" height="22" rx="11" fill="#D5E5DA"/>
  <text x="69" y="15" font-size="9.5" font-weight="800" fill="#09431B" text-anchor="middle" letter-spacing="1">CAMPUS EATS LIVE</text>

  <text x="0" y="52" font-size="26" font-weight="900" fill="#0A2E20" letter-spacing="-0.5">YEMEMUNNAI!</text>
  <text x="0" y="74" font-size="13.5" font-weight="700" fill="#0A461E">Never queue up for sold-out food.</text>
  <text x="0" y="94" font-size="11" font-weight="500" fill="#5C7A6D">Discover fresh batches, live canteen menus, and walking times.</text>
</g>

<!-- Filled Address Card with Location Pin -->
<g transform="translate(25, 428)">
  <rect width="325" height="72" rx="16" fill="#EFF5EF" stroke="#C8DACE" filter="url(#soft)"/>
  <g transform="translate(14, 16)">
    <circle cx="20" cy="20" r="18" fill="#09431B"/>
    <path d="M20 12 C16.7 12 14 14.7 14 18 C14 22.5 20 27 20 27 C20 27 26 22.5 26 18 C26 14.7 23.3 12 20 12 Z M20 19.5 C18.9 19.5 18 18.6 18 17.5 C18 16.4 18.9 15.5 20 15.5 C21.1 15.5 22 16.4 22 17.5 C22 18.6 21.1 19.5 20 19.5 Z" fill="#FF8A2A"/>
  </g>
  <text x="60" y="28" font-size="12" font-weight="800" fill="#0A2E20">Madanapalle Inst. of Tech &amp; Science</text>
  <text x="60" y="44" font-size="10" font-weight="600" fill="#5C7A6D">Angallu, Campus Food Court • G-Floor</text>
  <rect x="60" y="50" width="70" height="14" rx="7" fill="#D9EADA"/>
  <text x="95" y="61" font-size="8.5" font-weight="700" fill="#0A461E" text-anchor="middle">Open Now ✓</text>
</g>

<!-- Store Info / Operating Hours Dummy Card -->
<g transform="translate(25, 510)">
  <rect width="325" height="58" rx="16" fill="#EFF5EF" stroke="#C8DACE" filter="url(#soft)"/>
  <g transform="translate(14, 13)">
    <circle cx="16" cy="16" r="16" fill="#DDECE3"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="#09431B" stroke-width="1.8"/>
    <path d="M16 11 V16 H19" stroke="#09431B" stroke-width="1.8" stroke-linecap="round"/>
  </g>
  <text x="56" y="25" font-size="11.5" font-weight="800" fill="#0A2E20">Operating Hours &amp; Live Kitchen</text>
  <text x="56" y="42" font-size="10" font-weight="600" fill="#5C7A6D">Mon – Sat: 8:00 AM – 9:30 PM • Hot snacks from 4 PM</text>
</g>

<!-- Campus Radar Canteen Summary Card -->
<g transform="translate(25, 578)">
  <rect width="325" height="58" rx="16" fill="#EFF5EF" stroke="#C8DACE" filter="url(#soft)"/>
  <g transform="translate(14, 13)">
    <circle cx="16" cy="16" r="16" fill="#FFEAD9"/>
    <text x="16" y="21" font-size="13" text-anchor="middle">⚡</text>
  </g>
  <text x="56" y="25" font-size="11.5" font-weight="800" fill="#0A2E20">3 Active Canteens Inside Campus</text>
  <text x="56" y="42" font-size="10" font-weight="600" fill="#5C7A6D">Main Canteen • Nescafe Corner • Chai Point</text>
</g>

<!-- Bottom Onboarding Action Button (Unified 12px Corner Radius) -->
<g transform="translate(25, 650)">
  <rect width="325" height="48" rx="12" fill="url(#emerald)" filter="url(#buttonShadow)"/>
  <text x="162.5" y="30" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Explore Campus Food →</text>
</g>

<!-- Merchant Switch Link (No Clash Home Bar) -->
<text x="187.5" y="728" font-size="11" font-weight="600" fill="#5C7A6D" text-anchor="middle">Canteen owner? <tspan fill="#09431B" font-weight="800">Switch to Business Portal</tspan></text>
</svg>`;
}

// -------------------------------------------------------------
// 09_location_permission.svg
// -------------------------------------------------------------
function buildLocationPermission() {
  return `${svgHeader('Location Permission & Campus Geofence', 'YEMEMUNNAI campus radar permission dialog for live canteen distance and arrival alerts.')}
<!-- Background Canvas with Feed Silhouette -->
<rect width="375" height="812" fill="#E5EDE9"/>
<rect x="20" y="50" width="335" height="120" rx="18" fill="#DDE8E1" opacity="0.6"/>
<rect x="20" y="190" width="160" height="200" rx="18" fill="#DDE8E1" opacity="0.6"/>
<rect x="195" y="190" width="160" height="200" rx="18" fill="#DDE8E1" opacity="0.6"/>

<!-- Dark Translucent Overlay -->
<rect width="375" height="812" fill="#032A15" opacity="0.55"/>

<!-- Floating Modal Dialog -->
<g transform="translate(18, 130)">
  <rect width="339" height="590" rx="28" fill="#E5EDE9" stroke="#FFFFFF" stroke-opacity="0.85" filter="url(#soft)"/>
  
  <!-- Drag Handle -->
  <rect x="147" y="14" width="45" height="4" rx="2" fill="#BAC8C0"/>

  <!-- Radar Canvas Illustration -->
  <g transform="translate(169.5, 115)">
    <circle cx="0" cy="0" r="72" fill="#DFEBE3" stroke="#CAD8D0" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="50" fill="none" stroke="#BACFC2" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="0" cy="0" r="28" fill="none" stroke="#A6C2B0" stroke-width="1.5" stroke-dasharray="3 3"/>
    
    <!-- Radar Sweep Wedge -->
    <path d="M0 0 L51 -51 A72 72 0 0 1 72 0 Z" fill="#09431B" opacity="0.18"/>
    
    <!-- Center User Marker -->
    <circle cx="0" cy="0" r="16" fill="#09431B" opacity="0.18"/>
    <circle cx="0" cy="0" r="7" fill="#09431B" stroke="#FFFFFF" stroke-width="2.5"/>
    
    <!-- Nearby Canteen Pins -->
    <g transform="translate(36, -30)">
      <circle cx="0" cy="0" r="10" fill="#F26A00" opacity="0.25"/>
      <circle cx="0" cy="0" r="5" fill="#F26A00" stroke="#FFF" stroke-width="1.5"/>
      <text x="8" y="3" font-size="8" font-weight="700" fill="#0A2E20">Canteen</text>
    </g>
    <g transform="translate(-34, 28)">
      <circle cx="0" cy="0" r="8" fill="#09431B" opacity="0.2"/>
      <circle cx="0" cy="0" r="4" fill="#09431B" stroke="#FFF" stroke-width="1.5"/>
      <text x="7" y="3" font-size="8" font-weight="700" fill="#0A2E20">Chai Spot</text>
    </g>
  </g>

  <!-- Title & Copy -->
  <text x="169.5" y="224" font-size="19" font-weight="800" fill="#0A2E20" text-anchor="middle">Enable Campus Radar</text>
  <text x="169.5" y="247" font-size="11.5" font-weight="500" fill="#5C7A6D" text-anchor="middle">Calculate real-time walking distance to each tuck shop</text>
  <text x="169.5" y="263" font-size="11.5" font-weight="500" fill="#5C7A6D" text-anchor="middle">and receive alerts when fresh batches come out.</text>

  <!-- Live Value Field 1: ETA & Distance with Subtle Clock/Timer Icon -->
  <g transform="translate(24, 288)">
    <rect width="291" height="56" rx="14" fill="#EFF5EF" stroke="#C4D8CB"/>
    <g transform="translate(14, 11)">
      <circle cx="17" cy="17" r="17" fill="#DDECE3"/>
      <circle cx="17" cy="17" r="9" fill="none" stroke="#09431B" stroke-width="1.8"/>
      <path d="M17 12 V17 H20.5" stroke="#09431B" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <text x="56" y="25" font-size="11.5" font-weight="800" fill="#0A2E20">Live Distance &amp; Walk Time</text>
    <text x="56" y="42" font-size="10" font-weight="600" fill="#5C7A6D">Main Canteen: 2 min walk • Nescafe: 4 min</text>
    <g transform="translate(230, 16)">
      <rect width="48" height="22" rx="11" fill="#DCEAE1"/>
      <text x="24" y="15" font-size="9" font-weight="700" fill="#09431B" text-anchor="middle">⏱ 2 min</text>
    </g>
  </g>

  <!-- Live Value Field 2: Fresh Batch Alert with Subtle Driver/Runner Icon -->
  <g transform="translate(24, 354)">
    <rect width="291" height="56" rx="14" fill="#EFF5EF" stroke="#C4D8CB"/>
    <g transform="translate(14, 11)">
      <circle cx="17" cy="17" r="17" fill="#FFEAD9"/>
      <!-- Driver / Runner Icon -->
      <path d="M14 12 C15.1 12 16 11.1 16 10 C16 8.9 15.1 8 14 8 C12.9 8 12 8.9 12 10 C12 11.1 12.9 12 14 12 Z M18 13.5 L15 14.5 L13 18 L10.5 16.5 M15 14.5 L16.5 21 M11 20 L13 18" fill="none" stroke="#F26A00" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="56" y="25" font-size="11.5" font-weight="800" fill="#0A2E20">Fresh Batch Arrival Alerts</text>
    <text x="56" y="42" font-size="10" font-weight="600" fill="#5C7A6D">Hot Samosas ready in 6m • Pot #2 Biryani</text>
    <g transform="translate(232, 16)">
      <rect width="46" height="22" rx="11" fill="#FFE8D6"/>
      <text x="23" y="15" font-size="9" font-weight="700" fill="#F26A00" text-anchor="middle">🔥 Hot</text>
    </g>
  </g>

  <!-- Privacy Tag -->
  <text x="169.5" y="435" font-size="10" font-weight="600" fill="#6A8679" text-anchor="middle">🔒 Geofenced strictly to campus bounds. Battery friendly.</text>

  <!-- Action Buttons (Unified 12px Corner Radius) -->
  <g transform="translate(24, 458)">
    <rect width="291" height="46" rx="12" fill="url(#emerald)" filter="url(#buttonShadow)"/>
    <text x="145.5" y="28.5" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Allow While Using App</text>
  </g>

  <g transform="translate(24, 514)">
    <rect width="291" height="42" rx="12" fill="#EFF5EF" stroke="#C8D8CE"/>
    <text x="145.5" y="26" font-size="12" font-weight="700" fill="#0A2E20" text-anchor="middle">Set Campus Manually</text>
  </g>
</g>
</svg>`;
}

// -------------------------------------------------------------
// 10_food_item_detail.svg
// -------------------------------------------------------------
function buildFoodItemDetail() {
  return `${svgHeader('Food Item Detail Page', 'YEMEMUNNAI single item detail view with full hero imagery, preparation timing, portion selector and quick order CTA.')}
<!-- Background Canvas -->
<rect width="375" height="812" fill="#E5EDE9"/>

<!-- Top Nav Bar -->
<g transform="translate(20, 36)">
  <circle cx="18" cy="18" r="18" fill="#EFF5EF" stroke="#FFFFFF" filter="url(#buttonShadow)"/>
  <path d="M21 12 L15 18 L21 24" fill="none" stroke="#0A2E20" stroke-width="2" stroke-linecap="round"/>
  
  <text x="167.5" y="23" font-size="14" font-weight="800" fill="#0A2E20" text-anchor="middle">Item Details</text>

  <g transform="translate(295, 0)">
    <circle cx="18" cy="18" r="18" fill="#EFF5EF" stroke="#FFFFFF" filter="url(#buttonShadow)"/>
    <path d="M18 13 C15 9 10 11 10 15 C10 20 18 24 18 24 C18 24 26 20 26 15 C26 11 21 9 18 13 Z" fill="#F26A00"/>
  </g>
</g>

<!-- Hero Food Image Card -->
<g transform="translate(20, 95)">
  <rect width="335" height="225" rx="24" fill="#131F17" filter="url(#soft)"/>
  <clipPath id="detailHeroClip">
    <rect width="335" height="225" rx="24"/>
  </clipPath>
  <image href="${biryaniUri}" x="0" y="-15" width="335" height="255" clip-path="url(#detailHeroClip)" preserveAspectRatio="xMidYMid slice"/>

  <!-- Live Fresh Batch Pill -->
  <g transform="translate(14, 14)">
    <rect width="180" height="28" rx="12" fill="#0A461E" filter="url(#buttonShadow)"/>
    <text x="90" y="18" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">🔥 Fresh Batch • 12 mins ago</text>
  </g>

  <!-- Stock Badge: Pulled inward by 18px from border per critique -->
  <g transform="translate(196, 170)">
    <rect width="118" height="28" rx="12" fill="#FF8A2A" filter="url(#warm)"/>
    <text x="59" y="18" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">14 Left In Pot</text>
  </g>
</g>

<!-- Item Info & Vendor Details -->
<g transform="translate(20, 335)">
  <text x="0" y="24" font-size="20" font-weight="800" fill="#0A2E20">Chicken Dum Biryani</text>
  <text x="335" y="24" font-size="22" font-weight="800" fill="#0A461E" text-anchor="end">₹140</text>
  <text x="335" y="42" font-size="12" font-weight="600" fill="#8EA397" text-anchor="end" text-decoration="line-through">₹160</text>

  <!-- Vendor Card Bar -->
  <g transform="translate(0, 52)">
    <rect width="335" height="54" rx="14" fill="#EFF5EF" stroke="#C8D8CE"/>
    <g transform="translate(12, 10)">
      <circle cx="17" cy="17" r="17" fill="#09431B"/>
      <clipPath id="vendorIconClip">
        <circle cx="17" cy="17" r="17"/>
      </clipPath>
      <image href="${shopUri}" x="0" y="0" width="34" height="34" clip-path="url(#vendorIconClip)" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="54" y="24" font-size="12" font-weight="800" fill="#0A2E20">MITS Main Canteen</text>
    <text x="54" y="40" font-size="10" font-weight="600" fill="#5C7A6D">★ 4.8 (128 ratings) • 160m (2 min walk)</text>
    <g transform="translate(260, 15)">
      <rect width="62" height="24" rx="12" fill="#D9E8DF"/>
      <text x="31" y="16" font-size="10" font-weight="700" fill="#09431B" text-anchor="middle">Map 📍</text>
    </g>
  </g>

  <!-- Tags / Dietary -->
  <g transform="translate(0, 120)">
    <rect x="0" y="0" width="95" height="24" rx="12" fill="#EFF5EF" stroke="#C8D8CE"/>
    <text x="47.5" y="16" font-size="10" font-weight="700" fill="#0A2E20" text-anchor="middle">🍗 Tender Meat</text>
    
    <rect x="102" y="0" width="85" height="24" rx="12" fill="#EFF5EF" stroke="#C8D8CE"/>
    <text x="144.5" y="16" font-size="10" font-weight="700" fill="#0A2E20" text-anchor="middle">🌶️ Mild Spicy</text>
    
    <rect x="194" y="0" width="105" height="24" rx="12" fill="#EFF5EF" stroke="#C8D8CE"/>
    <text x="246.5" y="16" font-size="10" font-weight="700" fill="#0A2E20" text-anchor="middle">🍚 Basmati Rice</text>
  </g>

  <!-- Portion Selector (Unified 12px Corner Radius) -->
  <g transform="translate(0, 160)">
    <text x="0" y="14" font-size="11" font-weight="800" fill="#0A2E20" letter-spacing="0.5">SELECT PORTION SIZE</text>
    
    <g transform="translate(0, 24)">
      <rect width="162" height="42" rx="12" fill="#09431B" filter="url(#buttonShadow)"/>
      <text x="20" y="26" font-size="12" font-weight="800" fill="#FFFFFF">Single Plate</text>
      <text x="142" y="26" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="end">₹140</text>
    </g>

    <g transform="translate(173, 24)">
      <rect width="162" height="42" rx="12" fill="#EFF5EF" stroke="#C8D8CE"/>
      <text x="20" y="26" font-size="12" font-weight="700" fill="#0A2E20">Double Feast</text>
      <text x="142" y="26" font-size="12" font-weight="700" fill="#5C7A6D" text-anchor="end">₹260</text>
    </g>
  </g>

  <!-- Kitchen Note -->
  <g transform="translate(0, 245)">
    <rect width="335" height="54" rx="14" fill="#EFF5EF" stroke="#CAD8D0"/>
    <text x="14" y="21" font-size="11" font-weight="800" fill="#0A2E20">Kitchen Status: Pot #2 Active</text>
    <text x="14" y="38" font-size="10" font-weight="500" fill="#5C7A6D">Served hot with onion raita, mirchi ka salan, and boiled egg.</text>
  </g>
</g>

<!-- Sticky Bottom Order Bar: Raised for Safety Zone, Home Bar Removed, 12px Radius Buttons -->
<g transform="translate(0, 695)">
  <rect width="375" height="117" fill="#EFF5EF" stroke="#C8D8CE" stroke-width="1.5" filter="url(#soft)"/>
  
  <!-- Counter Stepper -->
  <g transform="translate(20, 12)">
    <rect width="105" height="48" rx="12" fill="#E5EDE9" stroke="#BACFC2"/>
    <text x="22" y="30" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">-</text>
    <text x="52.5" y="30" font-size="15" font-weight="800" fill="#0A2E20" text-anchor="middle">1</text>
    <text x="83" y="30" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">+</text>
  </g>

  <!-- CTA Button (Unified 12px Radius) -->
  <g transform="translate(138, 12)">
    <rect width="217" height="48" rx="12" fill="url(#emerald)" filter="url(#buttonShadow)"/>
    <text x="108.5" y="29.5" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Quick Order • ₹140</text>
  </g>
</g>
</svg>`;
}

// -------------------------------------------------------------
// 11_menu_stock_management.svg
// -------------------------------------------------------------
function buildMenuStockManagement() {
  return `${svgHeader('Menu & Live Stock Management', 'YEMEMUNNAI canteen manager console for toggling in-stock items, adjusting quantities, and updating prices.')}
<!-- Background Canvas -->
<rect width="375" height="812" fill="#E5EDE9"/>

<!-- Header & Vendor Status -->
<g transform="translate(20, 36)">
  <text x="0" y="22" font-size="20" font-weight="800" fill="#0A2E20">Live Menu &amp; Stock</text>
  <text x="0" y="40" font-size="11" font-weight="600" fill="#5C7A6D">MITS Main Canteen • Vendor Terminal</text>

  <g transform="translate(230, 6)">
    <rect width="105" height="28" rx="12" fill="#0A461E" filter="url(#buttonShadow)"/>
    <circle cx="16" cy="14" r="5" fill="#10B981"/>
    <text x="56" y="18" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">ONLINE</text>
  </g>
</g>

<!-- Stats Metrics Strip -->
<g transform="translate(20, 105)">
  <g transform="translate(0, 0)">
    <rect width="105" height="60" rx="14" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
    <text x="12" y="24" font-size="10" font-weight="700" fill="#5C7A6D">ACTIVE</text>
    <text x="12" y="48" font-size="20" font-weight="800" fill="#0A2E20">18</text>
  </g>

  <g transform="translate(115, 0)">
    <rect width="105" height="60" rx="14" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
    <text x="12" y="24" font-size="10" font-weight="700" fill="#F26A00">SOLD OUT</text>
    <text x="12" y="48" font-size="20" font-weight="800" fill="#F26A00">3</text>
  </g>

  <g transform="translate(230, 0)">
    <rect width="105" height="60" rx="14" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
    <text x="12" y="24" font-size="10" font-weight="700" fill="#0A461E">TODAY</text>
    <text x="12" y="48" font-size="16" font-weight="800" fill="#0A461E">₹12,450</text>
  </g>
</g>

<!-- Category Pills -->
<g transform="translate(20, 180)">
  <rect x="0" y="0" width="70" height="30" rx="12" fill="#09431B"/>
  <text x="35" y="19" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">All (21)</text>

  <rect x="78" y="0" width="90" height="30" rx="12" fill="#EFF5EF" stroke="#CAD8D0"/>
  <text x="123" y="19" font-size="11" font-weight="700" fill="#0A2E20" text-anchor="middle">Meals (8)</text>

  <rect x="176" y="0" width="95" height="30" rx="12" fill="#EFF5EF" stroke="#CAD8D0"/>
  <text x="223.5" y="19" font-size="11" font-weight="700" fill="#0A2E20" text-anchor="middle">Snacks (9)</text>

  <rect x="279" y="0" width="56" height="30" rx="12" fill="#EFF5EF" stroke="#CAD8D0"/>
  <text x="307" y="19" font-size="11" font-weight="700" fill="#0A2E20" text-anchor="middle">Chai</text>
</g>

<!-- Inventory Items List -->
<!-- Item 1: Biryani (In Stock) -->
<g transform="translate(20, 225)">
  <rect width="335" height="96" rx="16" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
  
  <g transform="translate(14, 14)">
    <rect width="68" height="68" rx="12" fill="#0A2E20"/>
    <clipPath id="itemBiryaniClip">
      <rect width="68" height="68" rx="12"/>
    </clipPath>
    <image href="${biryaniUri}" x="0" y="0" width="68" height="68" clip-path="url(#itemBiryaniClip)" preserveAspectRatio="xMidYMid slice"/>
  </g>

  <text x="94" y="32" font-size="14" font-weight="800" fill="#0A2E20">Chicken Dum Biryani</text>
  <text x="94" y="52" font-size="13" font-weight="800" fill="#0A461E">₹140</text>
  <text x="94" y="70" font-size="10" font-weight="600" fill="#5C7A6D">14 portions remaining</text>

  <!-- Toggle Switch ON -->
  <g transform="translate(270, 32)">
    <rect width="50" height="28" rx="14" fill="#09431B"/>
    <circle cx="36" cy="14" r="11" fill="#FFFFFF" filter="url(#buttonShadow)"/>
  </g>
</g>

<!-- Item 2: Samosa (In Stock) -->
<g transform="translate(20, 335)">
  <rect width="335" height="96" rx="16" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
  
  <g transform="translate(14, 14)">
    <rect width="68" height="68" rx="12" fill="#0A2E20"/>
    <clipPath id="itemSamosaClip">
      <rect width="68" height="68" rx="12"/>
    </clipPath>
    <image href="${samosaUri}" x="0" y="0" width="68" height="68" clip-path="url(#itemSamosaClip)" preserveAspectRatio="xMidYMid slice"/>
  </g>

  <text x="94" y="32" font-size="14" font-weight="800" fill="#0A2E20">Crispy Veg Samosa (2 pcs)</text>
  <text x="94" y="52" font-size="13" font-weight="800" fill="#0A461E">₹15</text>
  <text x="94" y="70" font-size="10" font-weight="600" fill="#5C7A6D">32 pieces fresh ready</text>

  <!-- Toggle Switch ON -->
  <g transform="translate(270, 32)">
    <rect width="50" height="28" rx="14" fill="#09431B"/>
    <circle cx="36" cy="14" r="11" fill="#FFFFFF" filter="url(#buttonShadow)"/>
  </g>
</g>

<!-- Item 3: Fresh Chai (SOLD OUT) -->
<g transform="translate(20, 445)">
  <rect width="335" height="96" rx="16" fill="#EFF5EF" stroke="#CAD8D0" opacity="0.85"/>
  
  <g transform="translate(14, 14)">
    <rect width="68" height="68" rx="12" fill="#B4C7BC"/>
    <text x="34" y="42" font-size="24" text-anchor="middle">☕</text>
  </g>

  <text x="94" y="32" font-size="14" font-weight="800" fill="#0A2E20">Ginger Masala Chai</text>
  <text x="94" y="52" font-size="13" font-weight="800" fill="#5C7A6D">₹12</text>
  <text x="94" y="70" font-size="10" font-weight="700" fill="#EF4444">🔴 SOLD OUT • Next pot at 4:30 PM</text>

  <!-- Toggle Switch OFF -->
  <g transform="translate(270, 32)">
    <rect width="50" height="28" rx="14" fill="#BAC8C0"/>
    <circle cx="14" cy="14" r="11" fill="#FFFFFF" filter="url(#buttonShadow)"/>
  </g>
</g>

<!-- Item 4: Classic Salted Lays -->
<g transform="translate(20, 555)">
  <rect width="335" height="96" rx="16" fill="#EFF5EF" stroke="#C8D8CE" filter="url(#soft)"/>
  
  <g transform="translate(14, 14)">
    <rect width="68" height="68" rx="12" fill="#0A2E20"/>
    <clipPath id="itemLaysClip">
      <rect width="68" height="68" rx="12"/>
    </clipPath>
    <image href="${laysUri}" x="0" y="0" width="68" height="68" clip-path="url(#itemLaysClip)" preserveAspectRatio="xMidYMid slice"/>
  </g>

  <text x="94" y="32" font-size="14" font-weight="800" fill="#0A2E20">Lay's Classic Salted</text>
  <text x="94" y="52" font-size="13" font-weight="800" fill="#0A461E">₹20</text>
  <text x="94" y="70" font-size="10" font-weight="600" fill="#5C7A6D">8 packets on shelf</text>

  <!-- Toggle Switch ON -->
  <g transform="translate(270, 32)">
    <rect width="50" height="28" rx="14" fill="#09431B"/>
    <circle cx="36" cy="14" r="11" fill="#FFFFFF" filter="url(#buttonShadow)"/>
  </g>
</g>

<!-- Floating Add New Item Button (Unified 12px Radius) -->
<g transform="translate(210, 680)">
  <rect width="145" height="48" rx="12" fill="url(#orange)" filter="url(#warm)"/>
  <text x="72.5" y="29.5" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">+ Add New Dish</text>
</g>
</svg>`;
}

// -------------------------------------------------------------
// 12_access_login.svg
// -------------------------------------------------------------
function buildAccessLogin() {
  return `${svgHeader('Student & Vendor Access Login', 'YEMEMUNNAI campus authentication screen with role toggle, roll number / OTP input and tactile keypad.')}
<!-- Background Canvas -->
<rect width="375" height="812" fill="#E5EDE9"/>

<!-- Header & Mascot Avatar -->
<g transform="translate(20, 36)">
  <circle cx="18" cy="18" r="18" fill="#EFF5EF" stroke="#FFFFFF" filter="url(#buttonShadow)"/>
  <path d="M21 12 L15 18 L21 24" fill="none" stroke="#0A2E20" stroke-width="2" stroke-linecap="round"/>
  <text x="167.5" y="23" font-size="14" font-weight="800" fill="#0A2E20" text-anchor="middle">Campus Access</text>
</g>

<g transform="translate(187.5, 120)">
  <circle cx="0" cy="0" r="38" fill="#0A461E" filter="url(#buttonShadow)"/>
  <circle cx="0" cy="0" r="35" fill="#E5EDE9"/>
  <clipPath id="loginMascotClip">
    <circle cx="0" cy="0" r="33"/>
  </clipPath>
  <image href="${logoUri}" x="-33" y="-33" width="66" height="66" clip-path="url(#loginMascotClip)" preserveAspectRatio="xMidYMid meet"/>
</g>

<text x="187.5" y="180" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">Welcome to YEMEMUNNAI!</text>
<text x="187.5" y="198" font-size="11" font-weight="600" fill="#5C7A6D" text-anchor="middle">Instant food discovery for MITS students &amp; faculty</text>

<!-- Role Selector Tabs (Unified 12px Radius) -->
<g transform="translate(20, 215)">
  <rect width="335" height="42" rx="12" fill="#DDE7E1" stroke="#C8D8CE"/>
  <rect x="3" y="3" width="164" height="36" rx="10" fill="#09431B" filter="url(#buttonShadow)"/>
  <text x="85" y="25" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Student / Faculty</text>
  <text x="249" y="25" font-size="12" font-weight="700" fill="#5C7A6D" text-anchor="middle">Canteen Vendor</text>
</g>

<!-- Input Field: Campus ID / Roll Number (Unified 12px Radius) -->
<g transform="translate(20, 275)">
  <text x="4" y="0" font-size="10" font-weight="800" fill="#0A2E20" letter-spacing="0.8">CAMPUS ROLL NUMBER / MOBILE</text>
  
  <g transform="translate(0, 12)">
    <rect width="335" height="50" rx="12" fill="#EFF5EF" stroke="#09431B" stroke-width="1.8" filter="url(#inset)"/>
    <text x="18" y="31" font-size="15" font-weight="800" fill="#0A2E20" letter-spacing="1">22691A0589</text>
    <rect x="135" y="16" width="2" height="18" fill="#09431B"/>
    
    <!-- Verified Badge -->
    <g transform="translate(295, 14)">
      <circle cx="11" cy="11" r="11" fill="#10B981"/>
      <path d="M7 11 L10 14 L15 8" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>
</g>

<!-- OTP / PIN Code Digits (Unified 12px Radius) -->
<g transform="translate(20, 360)">
  <text x="4" y="0" font-size="10" font-weight="800" fill="#0A2E20" letter-spacing="0.8">CAMPUS SECURITY PIN</text>
  
  <g transform="translate(0, 12)">
    <rect x="0" y="0" width="74" height="50" rx="12" fill="#EFF5EF" stroke="#CAD8D0" filter="url(#inset)"/>
    <text x="37" y="32" font-size="20" font-weight="800" fill="#0A2E20" text-anchor="middle">4</text>

    <rect x="87" y="0" width="74" height="50" rx="12" fill="#EFF5EF" stroke="#CAD8D0" filter="url(#inset)"/>
    <text x="124" y="32" font-size="20" font-weight="800" fill="#0A2E20" text-anchor="middle">8</text>

    <rect x="174" y="0" width="74" height="50" rx="12" fill="#EFF5EF" stroke="#CAD8D0" filter="url(#inset)"/>
    <text x="211" y="32" font-size="20" font-weight="800" fill="#0A2E20" text-anchor="middle">2</text>

    <rect x="261" y="0" width="74" height="50" rx="12" fill="#EFF5EF" stroke="#09431B" stroke-width="1.8" filter="url(#inset)"/>
    <circle cx="298" cy="25" r="4" fill="#09431B"/>
  </g>
</g>

<!-- Tactile Numpad (Unified 12px Radius) -->
<g transform="translate(35, 445)">
  <!-- Row 1 -->
  <g transform="translate(0, 0)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">1</text>
  </g>
  <g transform="translate(107, 0)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">2</text>
  </g>
  <g transform="translate(214, 0)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">3</text>
  </g>

  <!-- Row 2 -->
  <g transform="translate(0, 60)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">4</text>
  </g>
  <g transform="translate(107, 60)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">5</text>
  </g>
  <g transform="translate(214, 60)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">6</text>
  </g>

  <!-- Row 3 -->
  <g transform="translate(0, 120)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">7</text>
  </g>
  <g transform="translate(107, 120)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">8</text>
  </g>
  <g transform="translate(214, 120)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">9</text>
  </g>

  <!-- Row 4 -->
  <g transform="translate(107, 180)">
    <rect width="90" height="52" rx="12" fill="#EFF5EF" stroke="#FFFFFF" stroke-opacity="0.9" filter="url(#buttonShadow)"/>
    <text x="45" y="32" font-size="18" font-weight="800" fill="#0A2E20" text-anchor="middle">0</text>
  </g>
  <g transform="translate(214, 180)">
    <rect width="90" height="52" rx="12" fill="#E2EDE6" stroke="#C4D8CB"/>
    <text x="45" y="32" font-size="16" font-weight="800" fill="#0A2E20" text-anchor="middle">⌫</text>
  </g>
</g>
</svg>`;
}

// Generate all remaining screens
const screens = [
  { file: '08_splash_onboarding.svg', generator: buildSplashOnboarding },
  { file: '09_location_permission.svg', generator: buildLocationPermission },
  { file: '10_food_item_detail.svg', generator: buildFoodItemDetail },
  { file: '11_menu_stock_management.svg', generator: buildMenuStockManagement },
  { file: '12_access_login.svg', generator: buildAccessLogin },
];

screens.forEach(s => {
  const content = sanitizeXml(s.generator());
  fs.writeFileSync(path.join(figmaDir, s.file), content, 'utf8');
  fs.writeFileSync(path.join(publicDir, s.file), content, 'utf8');
  console.log(`✓ Generated ${s.file} in figma_svgs and public/svgs`);
});

console.log('✨ All remaining screens (8, 9, 10, 11, 12) regenerated with 100% critique fixes and unified 12px button radius!');
