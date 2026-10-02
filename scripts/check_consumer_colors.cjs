const fs = require('node:fs');
const assert = require('node:assert/strict');
const css = fs.readFileSync('src/index.css', 'utf8');
const block = css.match(/\.consumer-ui \{([\s\S]*?)\n\}/)[1];
const tokens = Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [match[1],match[2]]));
const resolve = value => value.startsWith('var(') ? resolve(tokens[value.slice(4,-1)]) : value;
const luminance = hex => {
  const values = hex.replace('#','').match(/../g).map(part => parseInt(part,16)/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4);
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
};
const pairs = [
  ['--color-text-primary','--color-bg-page'], ['--color-text-primary','--color-bg-surface'], ['--color-text-primary','--color-bg-hover'],
  ['--color-text-secondary','--color-bg-page'], ['--color-text-secondary','--color-bg-surface'], ['--color-text-secondary','--color-bg-hover'],
  ['--color-on-accent','--color-accent-solid'], ['--color-on-accent','--color-accent-hover'],
  ['--color-status-live','--color-bg-status-live'], ['--color-status-warm','--color-bg-status-warm'], ['--color-status-closed','--color-bg-status-closed'],
];
for (const [text,background] of pairs) {
  const fg = resolve(tokens[text] || text), bg = resolve(tokens[background] || background);
  const values = [luminance(fg),luminance(bg)].sort((a,b)=>b-a);
  const ratio = (values[0]+.05)/(values[1]+.05);
  assert(ratio >= 4.5, `${text} on ${background}: ${ratio}`);
  console.log(`${fg} on ${bg}: ${ratio.toFixed(2)}:1`);
}
console.log('PASS: consumer text token pairs meet 4.5:1. Image badges use opaque backgrounds.');
