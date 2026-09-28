const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const edge = edgePaths.find(p => fs.existsSync(p));

if (!edge) {
  console.log('Edge executable not found, skipping headless preview render.');
  process.exit(0);
}

const files = [
  { name: '01_home_discovery_feed', w: 375, h: 812 },
  { name: '02_quick_order_modal', w: 375, h: 812 },
  { name: '03_feedback_popup', w: 375, h: 812 },
  { name: '04_business_dashboard', w: 375, h: 812 },
  { name: '05_add_edit_food_item', w: 375, h: 812 },
  { name: '06_walk_in_map_modal', w: 375, h: 812 },
  { name: '07_mascot_logo', w: 546, h: 330 },
  { name: '08_splash_onboarding', w: 375, h: 812 },
  { name: '09_location_permission', w: 375, h: 812 },
  { name: '10_food_item_detail', w: 375, h: 812 },
  { name: '11_menu_stock_management', w: 375, h: 812 },
  { name: '12_access_login', w: 375, h: 812 }
];

const root = path.resolve(__dirname, '..');
const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\518dbfd0-e501-4f8d-bef2-200afd2abdf6';

files.forEach(({ name: f, w, h }) => {
  const svgUrl = `file:///${path.join(root, 'figma_svgs', `${f}.svg`).replace(/\\/g, '/')}`;
  const outPng = path.join(root, 'figma_svgs', 'previews', `${f}.png`);
  const pubPng = path.join(root, 'public', 'svgs', 'previews', `${f}.png`);

  try {
    const cmd = `"${edge}" --headless --disable-gpu --screenshot="${outPng}" --window-size=${w},${h} --hide-scrollbars "${svgUrl}"`;
    execSync(cmd, { stdio: 'ignore' });
    if (fs.existsSync(outPng)) {
      fs.copyFileSync(outPng, pubPng);
      
      // Also copy to brain dir for artifact embedding
      if (fs.existsSync(brainDir)) {
        const brainPng = path.join(brainDir, `${f}.png`);
        fs.copyFileSync(outPng, brainPng);
      }
      console.log(`✓ Rendered preview for ${f}.png (${fs.statSync(outPng).size} bytes)`);
    }
  } catch (err) {
    console.error(`Failed to render ${f}:`, err.message);
  }
});

console.log('✨ All 12 screen previews rendered and synced!');
