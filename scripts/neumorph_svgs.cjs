#!/usr/bin/env node
/**
 * Neumorphism restyle codemod for figma_svgs/*.svg
 *
 * Transforms the flat "tactile mint" design language into neumorphism:
 *   - Surfaces #E5EDE9 / #EBF2EE / #EFF5EF / #E0EAE4 -> #E8ECEF (canvas == surface,
 *     the defining trait of neumorphism)
 *   - Filter #soft -> dual neumorphic shadow: white -6,-6 blur 12 + #A3AEBB 6,6 blur 12
 *   - Filter #warm -> orange dual shadow (keeps CTA warmth, soft edges)
 *   - Filter #buttonShadow -> subtler dual shadow for buttons
 *   - Filter #inset -> true neumorphic inset well (inner light bottom-right,
 *     inner dark top-left)
 *   - Strokes: #FFFFFF/.85 -> none (surfaces melt into background)
 *               #C4D2CB / #C8DACE / #CAD8D0 / #C8D8CE / #ACC2AA / #BACFC2 -> #D6DCE2
 *   - Inset input fills #DCE5E0 / #DDE7E1 -> #E8ECEF (with inset filter they read as wells)
 *   - Dark green fills (#09431B / #0A461E) keep brand color: on neumorphism primary
 *     buttons stay solid accent (the style allows colored accent on raised surface)
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'figma_svgs');

const SOFT_NEU =
  '<filter id="soft" x="-25%" y="-25%" width="150%" height="160%" color-interpolation-filters="sRGB">' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blurD"/><feOffset in="blurD" dx="6" dy="6" result="offD"/>' +
  '<feFlood flood-color="#A3AEBB" flood-opacity="0.55" result="colD"/><feComposite in="colD" in2="offD" operator="in" result="shadowD"/>' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blurL"/><feOffset in="blurL" dx="-6" dy="-6" result="offL"/>' +
  '<feFlood flood-color="#FFFFFF" flood-opacity="0.9" result="colL"/><feComposite in="colL" in2="offL" operator="in" result="shadowL"/>' +
  '<feMerge><feMergeNode in="shadowD"/><feMergeNode in="shadowL"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

const WARM_NEU =
  '<filter id="warm" x="-30%" y="-50%" width="160%" height="210%" color-interpolation-filters="sRGB">' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blurD"/><feOffset in="blurD" dx="4" dy="4" result="offD"/>' +
  '<feFlood flood-color="#C77B3A" flood-opacity="0.4" result="colD"/><feComposite in="colD" in2="offD" operator="in" result="shadowD"/>' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blurL"/><feOffset in="blurL" dx="-4" dy="-4" result="offL"/>' +
  '<feFlood flood-color="#FFFFFF" flood-opacity="0.85" result="colL"/><feComposite in="colL" in2="offL" operator="in" result="shadowL"/>' +
  '<feMerge><feMergeNode in="shadowD"/><feMergeNode in="shadowL"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

const BUTTON_NEU =
  '<filter id="buttonShadow" x="-25%" y="-40%" width="150%" height="190%">' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blurD"/><feOffset in="blurD" dx="3" dy="3" result="offD"/>' +
  '<feFlood flood-color="#A3AEBB" flood-opacity="0.5" result="colD"/><feComposite in="colD" in2="offD" operator="in" result="shadowD"/>' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blurL"/><feOffset in="blurL" dx="-3" dy="-3" result="offL"/>' +
  '<feFlood flood-color="#FFFFFF" flood-opacity="0.85" result="colL"/><feComposite in="colL" in2="offL" operator="in" result="shadowL"/>' +
  '<feMerge><feMergeNode in="shadowD"/><feMergeNode in="shadowL"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

// True inset well: dark inner top-left, light inner bottom-right
const INSET_NEU =
  '<filter id="inset" x="-10%" y="-30%" width="120%" height="160%" color-interpolation-filters="sRGB">' +
  '<feOffset dx="2" dy="2"/><feGaussianBlur stdDeviation="3" result="innerD"/><feComposite in2="SourceAlpha" operator="out" result="maskD"/>' +
  '<feFlood flood-color="#9AA6B3" flood-opacity="0.5"/><feComposite in2="maskD" operator="in" result="shadowD"/>' +
  '<feOffset dx="-2" dy="-2"/><feGaussianBlur stdDeviation="3" result="innerL"/><feComposite in2="SourceAlpha" operator="out" result="maskL"/>' +
  '<feFlood flood-color="#FFFFFF" flood-opacity="0.9"/><feComposite in2="maskL" operator="in" result="shadowL"/>' +
  '<feMerge><feMergeNode in="shadowD"/><feMergeNode in="shadowL"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

const FILTERS = {
  soft: SOFT_NEU,
  warm: WARM_NEU,
  buttonShadow: BUTTON_NEU,
  inset: INSET_NEU
};

function replaceFilterDef(svg, id, replacement) {
  // Match the whole <filter id="...">...</filter> block (non-greedy, no nesting inside these defs)
  const re = new RegExp(`<filter id="${id}"[\\s\\S]*?</filter>`);
  if (!re.test(svg)) {
    console.warn(`  ! filter #${id} not found`);
    return svg;
  }
  return svg.replace(re, replacement);
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.svg'));
for (const file of files) {
  const p = path.join(DIR, file);
  let svg = fs.readFileSync(p, 'utf8');
  const before = svg;

  // 1. Swap the four shadow/filter defs (skip 07_mascot_logo which uses feDropShadow)
  for (const [id, def] of Object.entries(FILTERS)) {
    svg = replaceFilterDef(svg, id, def);
  }

  // 2. Surface unification — canvas == surface == wells
  svg = svg
    .replace(/#EBF2EE/g, '#E8ECEF')
    .replace(/#EFF5EF/g, '#E8ECEF')
    .replace(/#E5EDE9/g, '#E8ECEF')
    .replace(/#DCE5E0/g, '#E8ECEF')
    .replace(/#DDE7E1/g, '#E8ECEF')
    .replace(/#E0ECE4/g, '#DDE2E8');

  // 3. Kill raised-surface white strokes (neumorphism melts into the bg)
  svg = svg.replace(/<rect ([^>]*?)stroke="#FFFFFF" stroke-opacity="0.85"\s*\/>/g, '<rect $1/>');
  svg = svg.replace(/stroke="#FFFFFF" stroke-opacity="0.9"/g, 'stroke="#F3F5F8"');
  svg = svg.replace(/stroke="#FFFFFF" stroke-opacity="0\.9"/g, 'stroke="#F3F5F8"');

  // 4. Soften hairlines / borders
  for (const c of ['#C4D2CB', '#C8DACE', '#CAD8D0', '#C8D8CE', '#ACC2AA', '#BACFC2', '#CCD9D1', '#C4D8CB', '#9BAFA3', '#BAC8C0']) {
    svg = svg.split(`stroke="${c}"`).join('stroke="#D6DCE2"');
    svg = svg.split(`fill="${c}"`).join('fill="#D6DCE2"');
  }
  svg = svg.replace(/stroke="#F3F5F8"/g, 'stroke="#F5F7FA"');

  // 5. Grab handles / muted chips
  svg = svg.split('#BAC8C0').join('#C9D0D8');

  if (svg !== before) {
    fs.writeFileSync(p, svg);
    console.log(`✓ ${file}`);
  } else {
    console.log(`· ${file} (no changes)`);
  }
}
console.log('\nDone. Render previews to verify: scripts/render_previews.cjs');
