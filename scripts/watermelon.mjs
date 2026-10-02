import https from 'node:https';

/**
 * Watermelon MCP CLI Client
 * Directly invokes tools from https://mcp.watermelon.sh/mcp
 *
 * Usage:
 *   node scripts/watermelon.mjs search "button"
 *   node scripts/watermelon.mjs summary
 *   node scripts/watermelon.mjs categories
 *   node scripts/watermelon.mjs inspiration "food delivery card"
 *   node scripts/watermelon.mjs component "<component-slug>"
 */

async function callWatermelonTool(toolName, args = {}) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request('https://mcp.watermelon.sh/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        const match = raw.match(/data:\s*(.*)/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            if (parsed.error) {
              reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
            } else {
              resolve(parsed.result);
            }
          } catch (e) {
            resolve(raw);
          }
        } else {
          resolve(raw);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const [,, command, ...rest] = process.argv;
const query = rest.join(' ');

async function main() {
  try {
    switch (command) {
      case 'summary': {
        const res = await callWatermelonTool('catalog_summary');
        console.log(JSON.stringify(res, null, 2));
        break;
      }
      case 'categories': {
        const res = await callWatermelonTool('list_categories');
        console.log(JSON.stringify(res, null, 2));
        break;
      }
      case 'inspiration': {
        if (!query) {
          console.error('Usage: node scripts/watermelon.mjs inspiration <design goal>');
          process.exit(1);
        }
        const res = await callWatermelonTool('get_inspiration', { goal: query });
        console.log(JSON.stringify(res, null, 2));
        break;
      }
      case 'component': {
        if (!query) {
          console.error('Usage: node scripts/watermelon.mjs component <slug>');
          process.exit(1);
        }
        const res = await callWatermelonTool('get_component', { slug: query });
        console.log(JSON.stringify(res, null, 2));
        break;
      }
      case 'search':
      default: {
        const term = query || command || 'button';
        const res = await callWatermelonTool('search', { query: term });
        console.log(JSON.stringify(res, null, 2));
        break;
      }
    }
  } catch (err) {
    console.error('Error querying Watermelon MCP:', err.message);
    process.exit(1);
  }
}

main();
