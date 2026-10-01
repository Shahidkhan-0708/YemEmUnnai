/**
 * YemEmUnnai — Full-Stack Supabase Backend Test
 * Tests: connection, tables, RLS, triggers, storage, realtime, auth
 * Run: node supabase/test_backend.mjs
 */

const SUPABASE_URL = 'https://hdwpaxgbdrmezwkwumwk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkd3BheGdiZHJtZXp3a3d1bXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTM5MzksImV4cCI6MjEwNjI2OTkzOX0.KFIYSNqzlSfzjSBUDJKJfRI-LqREWnvrr2LxSpWMP6w';

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

async function authRequest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method,
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
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

async function testVendorAuth() {
  console.log('\n━━━ 8. VENDOR AUTH (email/password login) ━━━');
  const { ok, status, data } = await authRequest('POST', 'token?grant_type=password', {
    email: 'vendor@yememunnai.app',
    password: 'yememunnai123',
  });
  if (ok && data.access_token) {
    log('✅', 'Vendor login successful', `user_id=${data.user?.id?.substring(0, 8)}...`);
    passed++;

    // Use the vendor's JWT to read orders (should see the order we inserted)
    const vendorHeaders = {
      ...headers,
      'Authorization': `Bearer ${data.access_token}`,
    };
    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id,item_name,status,customer_mobile&limit=5`, {
      headers: vendorHeaders,
    });
    const orders = await orderRes.json();
    if (orderRes.ok && Array.isArray(orders) && orders.length > 0) {
      log('✅', 'Vendor can read own orders (RLS)', `${orders.length} order(s) found`);
      passed++;
    } else {
      log('⚠️', 'Vendor order read', `status ${orderRes.status}, rows=${orders?.length || 0}`);
      failed++;
    }

    // Test vendor can update their shop's is_online status
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/vendors?name=eq.MITS Canteen`, {
      method: 'PATCH',
      headers: { ...vendorHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({ is_online: true }),
    });
    const updateData = await updateRes.json();
    if (updateRes.ok && updateData?.[0]?.is_online === true) {
      log('✅', 'Vendor update own shop (RLS)', 'set is_online=true');
      passed++;
    } else {
      log('❌', 'Vendor shop update failed', `status ${updateRes.status}`);
      failed++;
    }

    // Test vendor CANNOT update another vendor's shop
    const hackRes = await fetch(`${SUPABASE_URL}/rest/v1/vendors?name=eq.Royal Hotel`, {
      method: 'PATCH',
      headers: { ...vendorHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({ is_online: true }),
    });
    const hackData = await hackRes.json();
    if (hackRes.ok && (!hackData || hackData.length === 0)) {
      log('✅', 'Vendor CANNOT update other shops (RLS)', 'Royal Hotel untouched');
      passed++;
    } else {
      log('❌', 'Cross-vendor update NOT blocked!', JSON.stringify(hackData));
      failed++;
    }

    // Test vendor can add a menu item
    const addItemRes = await fetch(`${SUPABASE_URL}/rest/v1/food_items`, {
      method: 'POST',
      headers: { ...vendorHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        vendor_id: 'a0000000-0000-4000-8000-000000000001', // MITS Canteen
        name: 'Test Dosa',
        price: 30,
        category: 'cooked',
        action_type: 'walkin',
        in_stock: true,
      }),
    });
    const addItemData = await addItemRes.json();
    if (addItemRes.ok && addItemData?.[0]?.name === 'Test Dosa') {
      log('✅', 'Vendor add menu item', 'Test Dosa ₹30 added');
      passed++;

      // Clean up test item
      await fetch(`${SUPABASE_URL}/rest/v1/food_items?name=eq.Test Dosa&vendor_id=eq.a0000000-0000-4000-8000-000000000001`, {
        method: 'DELETE',
        headers: vendorHeaders,
      });
      log('✅', 'Test item cleaned up');
      passed++;
    } else {
      log('❌', 'Vendor menu item add failed', `status ${addItemRes.status}`);
      failed++;
    }
  } else {
    log('❌', 'Vendor login failed', `status ${status}, ${data?.error || data?.msg || JSON.stringify(data)}`);
    failed++;
  }
}

async function testStorageBucket() {
  console.log('\n━━━ 9. STORAGE BUCKET ━━━');
  // Try listing objects in the bucket (public bucket allows listing)
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkd3BheGdiZHJtZXp3a3d1bXdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDY5MzkzOSwiZXhwIjoyMTA2MjY5OTM5fQ.n6WxRcW_qWlCwVLXZFB8gjF-s1CUPTKH1iKUtwIHUvM';
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
  await testVendorAuth();
  await testStorageBucket();
  await testRealtimeEndpoint();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`║   ${failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests need attention'}`)
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
