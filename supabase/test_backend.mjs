/**
 * YemEmUnnai — Full-Stack Supabase Backend Test
 * Tests: connection, tables, RLS, triggers, storage, realtime, auth
 * Run: node supabase/test_backend.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

let passed = 0;
let failed = 0;
const results = [];

function log(icon, test, detail = '') {
  const line = `${icon} ${test}${detail ? ` — ${detail}` : ''}`;
  console.log(line);
  results.push({ test, pass: icon === '✅', detail });
}

async function rest(method, path, body = null, extraHeaders = {}) {
  const opts = { method, headers: { ...headers, ...extraHeaders } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, ok: res.ok };
}


// ─────────────────────────────── TESTS ───────────────────────────────

async function testConnection() {
  console.log('\n━━━ 1. CONNECTION ━━━');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vendors?select=id&limit=1`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
    if (res.ok) { log('✅', 'Supabase connection', `status ${res.status}`); passed++; }
    else { log('❌', 'Supabase connection', `status ${res.status}`); failed++; }
  } catch (e) {
    log('❌', 'Supabase connection', e.message); failed++;
  }
}

async function testVendorsRead() {
  console.log('\n━━━ 2. VENDORS TABLE (anon read) ━━━');
  const { status, data, ok } = await rest('GET', 'vendors?select=id,name,is_active,is_online,latitude,longitude,location_landmark,is_on_campus&order=name');
  if (ok && Array.isArray(data) && data.length === 5) {
    log('✅', 'Vendors — 5 rows found', data.map(v => v.name).join(', '));
    passed++;
    // Check geo columns from migration
    const canteen = data.find(v => v.name === 'MITS Canteen');
    if (canteen && canteen.latitude && canteen.longitude) {
      log('✅', 'Geo migration applied', `lat=${canteen.latitude}, lon=${canteen.longitude}, landmark="${canteen.location_landmark}"`);
      passed++;
    } else {
      log('❌', 'Geo migration', 'latitude/longitude missing on MITS Canteen');
      failed++;
    }
  } else {
    log('❌', 'Vendors read', `status=${status}, rows=${Array.isArray(data) ? data.length : 'N/A'}`);
    failed++;
  }
}

async function testFoodItemsRead() {
  console.log('\n━━━ 3. FOOD_ITEMS TABLE (anon read) ━━━');
  const { data, ok } = await rest('GET', 'food_items?select=id,name,price,category,action_type,in_stock,likes_count,vendor_id&order=name');
  if (ok && Array.isArray(data) && data.length === 4) {
    log('✅', 'Food items — 4 rows found');
    passed++;
    for (const item of data) {
      const checks = item.name && item.price >= 0 && item.category && item.action_type;
      if (checks) { log('✅', `  ${item.name}`, `₹${item.price}, ${item.category}, ${item.action_type}`); passed++; }
      else { log('❌', `  ${item.name}`, 'missing fields'); failed++; }
    }
  } else {
    log('❌', 'Food items read', `rows=${Array.isArray(data) ? data.length : 'N/A'}`);
    failed++;
  }
}

async function testRLSAnonInsertBlocked() {
  console.log('\n━━━ 4. RLS — ANON BLOCKED FROM VENDOR INSERT ━━━');
  const { status, ok } = await rest('POST', 'vendors', { name: 'Hacker Shop', is_active: false });
  if (!ok && (status === 403 || status === 401)) {
    log('✅', 'Anon vendor insert blocked', `status ${status}`);
    passed++;
  } else {
    log('❌', 'Anon vendor insert NOT blocked', `status ${status}`);
    failed++;
    // Clean up if it somehow got in
    await rest('DELETE', "vendors?name=eq.Hacker Shop");
  }
}

async function testReactionsFlow() {
  console.log('\n━━━ 5. REACTIONS (anon insert + trigger counter) ━━━');
  // Get first food item
  const { data: items } = await rest('GET', 'food_items?select=id,name,likes_count&limit=1');
  if (!items || items.length === 0) { log('❌', 'No food items to test reactions'); failed++; return; }
  
  const item = items[0];
  const originalLikes = item.likes_count;
  const userKey = `anon:test-${Date.now()}`;

  // Insert a like
  const { ok: insertOk, status: insertStatus } = await rest('POST', 'reactions', {
    food_item_id: item.id,
    user_key: userKey,
    value: 'like'
  });
  if (insertOk) {
    log('✅', 'Anon reaction insert', `liked ${item.name}`);
    passed++;

    // Check trigger updated the counter
    await new Promise(r => setTimeout(r, 500)); // small delay for trigger
    const { data: updated } = await rest('GET', `food_items?id=eq.${item.id}&select=likes_count`);
    if (updated && updated[0] && updated[0].likes_count === originalLikes + 1) {
      log('✅', 'Trigger counter incremented', `${originalLikes} → ${updated[0].likes_count}`);
      passed++;
    } else {
      log('⚠️', 'Trigger counter check', `expected ${originalLikes + 1}, got ${updated?.[0]?.likes_count}`);
      failed++;
    }

    // Toggle to dislike (update)
    const { ok: updateOk } = await rest('PATCH', `reactions?food_item_id=eq.${item.id}&user_key=eq.${userKey}`, { value: 'dislike' });
    if (updateOk) { log('✅', 'Reaction update (like→dislike)'); passed++; }
    else { log('❌', 'Reaction update failed'); failed++; }

    // Clean up — delete the reaction
    const { ok: delOk } = await rest('DELETE', `reactions?food_item_id=eq.${item.id}&user_key=eq.${userKey}`);
    if (delOk) { log('✅', 'Reaction cleanup (delete)'); passed++; }
    else { log('❌', 'Reaction delete failed'); failed++; }
  } else {
    log('❌', 'Anon reaction insert failed', `status ${insertStatus}`);
    failed++;
  }
}

async function testReviewInsert() {
  console.log('\n━━━ 6. REVIEWS (anon insert) ━━━');
  const { data: items } = await rest('GET', 'food_items?select=id,name,reviews_count&limit=1');
  if (!items || !items.length) { log('❌', 'No food items for review test'); failed++; return; }

  const item = items[0];
  const { ok, status, data } = await rest('POST', 'reviews', {
    food_item_id: item.id,
    user_key: `anon:review-test-${Date.now()}`,
    rating: 4,
    is_liked: true,
    comment: 'Test review from backend test script'
  });
  if (ok) {
    log('✅', 'Anon review insert', `rated ${item.name} ⭐4`);
    passed++;

    // Verify review counter trigger
    await new Promise(r => setTimeout(r, 500));
    const { data: updated } = await rest('GET', `food_items?id=eq.${item.id}&select=reviews_count`);
    if (updated && updated[0] && updated[0].reviews_count === item.reviews_count + 1) {
      log('✅', 'Review counter trigger', `${item.reviews_count} → ${updated[0].reviews_count}`);
      passed++;
    } else {
      log('⚠️', 'Review counter', `expected ${item.reviews_count + 1}, got ${updated?.[0]?.reviews_count}`);
      failed++;
    }
  } else {
    log('❌', 'Review insert failed', `status ${status}, ${JSON.stringify(data)}`);
    failed++;
  }
}

async function testOrderInsert() {
  console.log('\n━━━ 7. ORDERS (anon insert) ━━━');
  const { data: items } = await rest('GET', 'food_items?select=id,name,price,vendor_id&limit=1');
  if (!items || !items.length) { log('❌', 'No food items for order test'); failed++; return; }

  const item = items[0];
  const { ok, status, data } = await rest('POST', 'orders', {
    vendor_id: item.vendor_id,
    food_item_id: item.id,
    item_name: item.name,
    unit_price: item.price,
    customer_mobile: '9876543210',
    delivery_address: 'Room 101, Boys Hostel'
  }, { 'Prefer': 'return=minimal' });
  if (ok) {
    log('✅', 'Order placed (anon)', `${item.name} for ₹${item.price}`);
    passed++;
  } else {
    log('❌', 'Order insert failed', `status ${status}, ${JSON.stringify(data)}`);
    failed++;
  }

  // Verify anon CANNOT read orders (RLS: only vendor owner can read)
  const { data: orderRead, status: readStatus } = await rest('GET', 'orders?select=id&limit=1');
  if (readStatus === 401 || readStatus === 403 || (Array.isArray(orderRead) && orderRead.length === 0)) {
    log('✅', 'Anon cannot read orders (RLS)', `status ${readStatus}, blocked or 0 rows`);
    passed++;
  } else {
    log('❌', 'Anon CAN read orders — RLS broken!', `status ${readStatus}, got ${orderRead?.length} rows`);
    failed++;
  }
}

// Cafe authentication checks live in test_vendor_pin.mjs.

async function testStorageBucket() {
  console.log('\n━━━ 9. STORAGE BUCKET ━━━');
  // Try listing objects in the bucket (public bucket allows listing)
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.');
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/food-photos`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (res.ok) {
    const bucket = await res.json();
    log('✅', 'Storage bucket exists', `name="${bucket.name}", public=${bucket.public}`);
    passed++;
  } else {
    const errText = await res.text();
    log('❌', 'Storage bucket missing', `status ${res.status}: ${errText}`);
    failed++;
  }
}

async function testRealtimeEndpoint() {
  console.log('\n━━━ 10. REALTIME ENDPOINT ━━━');
  try {
    const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/tenants/${SUPABASE_URL.split('//')[1].split('.')[0]}/health`, {
      headers: { 'apikey': SUPABASE_ANON_KEY },
    });
    // Realtime health check may return various codes, just check it's reachable
    if (res.status < 500) {
      log('✅', 'Realtime endpoint reachable', `status ${res.status}`);
      passed++;
    } else {
      log('⚠️', 'Realtime endpoint error', `status ${res.status}`);
      failed++;
    }
  } catch (e) {
    log('⚠️', 'Realtime endpoint', e.message);
    failed++;
  }
}

// ─────────────────────────────── RUN ALL ───────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   YemEmUnnai — Full-Stack Backend Test Suite                ║');
  console.log('║   Project: hdwpaxgbdrmezwkwumwk (ap-south-1)               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  await testConnection();
  await testVendorsRead();
  await testFoodItemsRead();
  await testRLSAnonInsertBlocked();
  await testReactionsFlow();
  await testReviewInsert();
  await testOrderInsert();

  await testStorageBucket();
  await testRealtimeEndpoint();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`║   ${failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests need attention'}`)
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
