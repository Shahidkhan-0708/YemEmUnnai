const { execSync } = require('child_process');

const candidates = [
  'approval_policy',
  'approval',
  'approvals',
  'sandbox.approval',
  'sandbox.approval_policy',
  'ask_for_approval',
  'policy'
];

for (const key of candidates) {
  try {
    const out = execSync(`codex doctor -c "${key}=\\"never\\""`, { encoding: 'utf8' });
    const match = out.match(/approval policy\s+([A-Za-z]+)/);
    const ignored = out.includes(`\`${key}\` is ignored`);
    console.log(`${key}: ignored=${ignored}, policy=${match ? match[1] : 'unknown'}`);
  } catch (e) {
    console.log(`${key}: error: ${e.message.split('\n')[0]}`);
  }
}
