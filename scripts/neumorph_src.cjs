#!/usr/bin/env node
/**
 * Neumorphism codemod for src/ React components.
 * Mirrors scripts/neumorph_svgs.cjs so the app matches the restyled SVGs:
 *   - Surfaces -> #E8ECEF (canvas == surface), deep variant #DDE2E8
 *   - Inline green-tinted shadows -> neumorphic dual shadows
 *   - Hairline borders #C4D2CB etc -> #D6DCE2
 *   - Old surface greens that no longer exist in the palette -> neumorphic surfaces
 * Accent colors (brand green/orange, star gold) are kept.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(path.join(__dirname, '..', 'src')).filter(f => !f.includes('node_modules'));

const SURFACE_MAP = {
  '#EFF5EF': '#E8ECEF',
  '#E5EDE9': '#E8ECEF',
  '#DCE5E0': '#E8ECEF',
  '#DDE7E1': '#E8ECEF',
  '#E2EDE6': '#DDE2E8',
  '#D5E0DA': '#DDE2E8',
  '#D5E5DA': '#DDE2E8',
  '#D9E8DF': '#D6DCE2',
  '#D9EADA': '#D6DCE2',
  '#DCE7E1': '#DDE2E8',
  '#DCEAE1': '#D6DCE2',
  '#DDECE3': '#D6DCE2',
  '#C5B16D': '#C9D0D8', // gold avatar rings -> soft gray ring (neumorphism avoids metallic accents on surface)
};

const BORDER_MAP = {
  '#C4D2CB': '#D6DCE2',
  '#CAD8D0': '#D6DCE2',
  '#C8DACE': '#D6DCE2',
  '#C8D8CE': '#D6DCE2',
  '#C8D7CF': '#D6DCE2',
  '#BACFC2': '#C9D0D8',
  '#ACC2AA': '#C9D0D8',
  '#CCD9D1': '#D6DCE2',
  '#C4D8CB': '#D6DCE2',
  '#BAC8C0': '#C9D0D8',
  '#CBD8D0': '#D6DCE2',
  '#9BAFA3': '#C2C9D1',
  '#ABB8B0': '#AEB8C2',
  '#7C9588': '#8B98A6',
  '#71867A': '#8B98A6',
};

// Old soft single green shadows -> neumorphic dual shadows
const SHADOW_MAP = {
  "boxShadow: '0 5px 12px rgba(9, 59, 30, 0.12)'":
    "boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)'",
  "boxShadow: '0 2px 4px rgba(9, 59, 30, 0.16)'":
    "boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'",
  "boxShadow: '0 3px 6px rgba(242, 106, 0, 0.23)'":
    "boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)'",
  "boxShadow: '0 1px 3px rgba(9, 59, 30, 0.10)'":
    "boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(163,174,187,0.35)'",
  "boxShadow: '0 5px 12px rgba(9, 59, 30, 0.12), border: 1px solid #C4D2CB'":
    "boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)', border: '1px solid #D6DCE2'",
  "boxShadow: 'inset 0 2px 2px rgba(100, 130, 115, 0.18)'":
    "boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)'",
  "boxShadow: '0 -5px 12px rgba(9, 59, 30, 0.12)'":
    "boxShadow: '0 -6px 12px rgba(255,255,255,0.7), 0 6px 12px rgba(163,174,187,0.4)'",
};

// Backgrounds that were tinted surfaces -> neumorphic surface/deep
const BG_CLASS_MAP = {
  'bg-[#EFF5EF]': 'bg-[#E8ECEF]',
  'bg-[#E5EDE9]': 'bg-[#E8ECEF]',
  'bg-[#DCE5E0]': 'bg-[#E8ECEF]',
  'bg-[#DDE7E1]': 'bg-[#E8ECEF]',
  'bg-[#D5E0DA]': 'bg-[#DDE2E8]',
  'bg-[#DCE7E1]': 'bg-[#DDE2E8]',
  'bg-[#D9E8DF]': 'bg-[#D6DCE2]',
  'bg-[#DDECE3]': 'bg-[#D6DCE2]',
  'bg-[#E2EDE6]': 'bg-[#DDE2E8]',
  'bg-[#D9EADA]': 'bg-[#D6DCE2]',
  'bg-[#DCEAE1]': 'bg-[#D6DCE2]',
};

const BORDER_CLASS_MAP = {
  'border-[#C4D2CB]': 'border-[#D6DCE2]',
  'border-[#CAD8D0]': 'border-[#D6DCE2]',
  'border-[#C8DACE]': 'border-[#D6DCE2]',
  'border-[#C8D8CE]': 'border-[#D6DCE2]',
  'border-[#C8D7CF]': 'border-[#D6DCE2]',
  'border-[#BACFC2]': 'border-[#C9D0D8]',
  'border-[#ACC2AA]': 'border-[#C9D0D8]',
  'border-[#CCD9D1]': 'border-[#D6DCE2]',
  'border-[#C4D8CB]': 'border-[#D6DCE2]',
  'border-[#BAC8C0]': 'border-[#C9D0D8]',
  'border-[#CBD8D0]': 'border-[#D6DCE2]',
  'border-[#9BAFA3]': 'border-[#C2C9D1]',
};

let totalChanges = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  for (const [from, to] of Object.entries(SHADOW_MAP)) src = src.split(from).join(to);
  for (const [from, to] of Object.entries(BG_CLASS_MAP)) src = src.split(from).join(to);
  for (const [from, to] of Object.entries(BORDER_CLASS_MAP)) src = src.split(from).join(to);
  for (const [from, to] of Object.entries(SURFACE_MAP)) {
    src = src.split(`'${from}'`).join(`'${to}'`);
    src = src.split(`"${from}"`).join(`"${to}"`);
  }
  for (const [from, to] of Object.entries(BORDER_MAP)) {
    src = src.split(`'${from}'`).join(`'${to}'`);
    src = src.split(`"${from}"`).join(`"${to}"`);
  }

  // border-white/[0.85] raised-sheet strokes -> softer neumorphic edge
  src = src.split('border-white/[0.85]').join('border-white/60');

  if (src !== before) {
    fs.writeFileSync(file, src);
    const n = before.split('\n').filter((l, i) => l !== src.split('\n')[i]).length;
    totalChanges += n;
    console.log(`✓ ${path.relative(process.cwd(), file)} (~${n} lines)`);
  }
}
console.log(`\nDone. ${totalChanges} lines changed.`);
