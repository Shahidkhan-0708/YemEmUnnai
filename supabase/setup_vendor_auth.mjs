/**
 * Create the demo vendor user via Supabase Admin Auth API
 * and link them to MITS Canteen.
 */

const SUPABASE_URL = 'https://hdwpaxgbdrmezwkwumwk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkd3BheGdiZHJtZXp3a3d1bXdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDY5MzkzOSwiZXhwIjoyMTA2MjY5OTM5fQ.n6WxRcW_qWlCwVLXZFB8gjF-s1CUPTKH1iKUtwIHUvM';

async function main() {
  // Step 1: Create the vendor user via Admin API
  console.log('Creating vendor user via Admin Auth API...');
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'vendor@yememunnai.app',
      password: 'yememunnai123',
      email_confirm: true,
      user_metadata: {},
    }),
  });
  const userData = await createRes.json();
  
  if (createRes.ok) {
    console.log(`✅ Vendor user created: ${userData.id}`);
  } else if (userData?.msg?.includes('already') || userData?.message?.includes('already')) {
    console.log('⚠️ User already exists, fetching...');
    // List users and find the one
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    const listData = await listRes.json();
    const vendor = listData.users?.find(u => u.email === 'vendor@yememunnai.app');
    if (vendor) {
      console.log(`✅ Found existing vendor user: ${vendor.id}`);
      userData.id = vendor.id;
    } else {
      console.error('❌ Could not find vendor user');
      process.exit(1);
    }
  } else {
    console.error('❌ Failed to create user:', JSON.stringify(userData));
    process.exit(1);
  }

  const userId = userData.id;

  // Step 2: Link the vendor user to MITS Canteen
  console.log('Linking vendor to MITS Canteen...');
  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/vendors?name=eq.MITS Canteen`, {
    method: 'PATCH',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ owner_id: userId }),
  });
  const vendorData = await updateRes.json();
  if (updateRes.ok && vendorData?.[0]) {
    console.log(`✅ MITS Canteen linked to owner ${userId}`);
  } else {
    console.error('❌ Failed to link vendor:', JSON.stringify(vendorData));
  }

  // Step 3: Test login with the new user
  console.log('\nTesting login...');
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'vendor@yememunnai.app',
      password: 'yememunnai123',
    }),
  });
  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.access_token) {
    console.log(`✅ Login successful! Token: ${loginData.access_token.substring(0, 30)}...`);
  } else {
    console.error('❌ Login failed:', JSON.stringify(loginData));
  }

  console.log('\n✅ Done! Vendor demo account ready.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
