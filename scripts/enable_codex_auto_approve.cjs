const fs = require('fs');
const os = require('os');
const path = require('path');

const configPath = path.join(os.homedir(), '.codex', 'config.toml');
let content = fs.readFileSync(configPath, 'utf8');

// Remove the unrecognized ask_for_approval
content = content.replace(/ask_for_approval\s*=\s*"never"\r?\n?/g, '');

// Set the exact recognized key
if (!content.includes('approval_policy')) {
  content = 'approval_policy = "never"\n' + content;
  fs.writeFileSync(configPath, content, 'utf8');
  console.log('Successfully set approval_policy = "never" in', configPath);
} else {
  console.log('approval_policy is already set in', configPath);
}
