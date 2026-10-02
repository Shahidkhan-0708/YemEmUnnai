const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const windows = process.platform === 'win32';
let running = false, pending = false, timer;
async function check() {
  if (running) { pending = true; return; }
  running = true;
  const start = Date.now();
  try {
    for (const [tool,args] of [['npx',['--no-install','tsc','--noEmit']], ['npx',['--no-install','oxlint']], ['npm',['run','build']]]) {
      const status = await new Promise((resolve,reject) => {
        const child = windows
          ? spawn('cmd.exe',['/d','/s','/c',`${tool}.cmd ${args.join(' ')}`],{ stdio:'inherit' })
          : spawn(tool,args,{ stdio:'inherit' });
        child.on('error',reject); child.on('close',resolve);
      });
      if (status !== 0) throw new Error(`${tool} ${args.join(' ')} failed (${status})`);
    }
    const chunks = fs.readdirSync('dist/assets').filter(name => /\.(js|css)$/.test(name)).map(name => ({ name, bytes:fs.statSync(path.join('dist/assets',name)).size }));
    const oversize = chunks.filter(chunk => chunk.bytes >= 500000);
    if (oversize.length) throw new Error(`Chunks at or above 500 kB: ${JSON.stringify(oversize)}`);
    console.log(`PASS: types, lint, build and ${chunks.length} chunks under 500 kB. Largest ${Math.max(...chunks.map(chunk => chunk.bytes))} bytes. Checks took ${((Date.now()-start)/1000).toFixed(1)}s.`);
  } catch (error) { console.error(error.message); if (!process.argv.includes('--watch')) process.exitCode=1; }
  finally { running=false; if (pending) { pending=false; void check(); } }
}
if (process.argv.includes('--watch')) {
  const watched = name => /^(src[\\/]|scripts[\\/]|supabase[\\/]).*\.(tsx?|m?js|cjs|css|json|toml|sql)$/.test(name) || /^(package(?:-lock)?|tsconfig(?:\.app|\.node)?)\.json$|^index\.html$|^vite\.config\.ts$/.test(name);
  const hashes = new Map();
  const hash = name => { try { return createHash('sha256').update(fs.readFileSync(name)).digest('hex'); } catch { return null; } };
  for (const dir of ['src','scripts','supabase']) {
    for (const name of fs.readdirSync(dir,{ recursive:true })) {
      const file = path.join(dir,name);
      if (watched(file)) hashes.set(file,hash(file));
    }
  }
  for (const name of fs.readdirSync('.')) if (watched(name)) hashes.set(name,hash(name));
  fs.watch('.', { recursive:true }, (_,name) => {
    if (!name || !watched(name)) return;
    const value = hash(name);
    if (hashes.get(name) === value) return;
    hashes.set(name,value);
    clearTimeout(timer); timer=setTimeout(check,400);
  });
  console.log('Watching source and build configuration for changes.');
}
void check();
