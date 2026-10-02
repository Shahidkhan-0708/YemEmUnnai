/**
 * Seed the real menus for MITS Canteen and MITS Cafe.
 * Prices from the canteen committee list. Idempotent — safe to re-run.
 *
 * Run: node supabase/seed_menus.mjs
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.');

const HEADERS = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const CANTEEN = 'a0000000-0000-4000-8000-000000000001';
const CAFE = 'a0000000-0000-4000-8000-000000000006';
const EKDANT = 'a0000000-0000-4000-8000-000000000007';
const LICKIES = 'a0000000-0000-4000-8000-000000000008';
const NEWCAFE = 'a0000000-0000-4000-8000-000000000009';

// MITS Canteen: Tea ₹10 · Coffee ₹10 · Samosa ₹15
// MITS Cafe: Tea ₹15 · Coffee ₹20 · Black coffee ₹30 · Sonti coffee ₹30 · Milk ₹15 · Batanees ₹20/pack
// Ekdant's Cafe: Tea ₹10 · Coffee ₹10 · Samosa ₹15 · Mirchi bajji 3 for ₹20
// Lickies: Tea ₹10 · Coffee ₹10 · Samosa ₹15 · Popsicles from ₹10
// New Cafe: Tea ₹10 · Coffee ₹10 · Samosa ₹15
const MENU = [
  // --- MITS Canteen ---
  { vendor_id: CANTEEN, name: 'Tea', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_tea.jpg', liked: 64, disliked: 0, reviews: 21, rating: 4.6 },
  { vendor_id: CANTEEN, name: 'Coffee', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_coffee.jpg', liked: 71, disliked: 0, reviews: 25, rating: 4.7 },
  { vendor_id: CANTEEN, name: 'Dosa', price: 35, category: 'cooked', action_type: 'order', image_url: '/images/item_dosa.png', liked: 82, disliked: 0, reviews: 29, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Masala Dosa', price: 40, category: 'cooked', action_type: 'order', image_url: '/images/item_masala_dosa.png', liked: 91, disliked: 0, reviews: 38, rating: 4.9 },
  { vendor_id: CANTEEN, name: 'Onion Dosa', price: 50, category: 'cooked', action_type: 'order', image_url: '/images/item_onion_dosa.png', liked: 77, disliked: 0, reviews: 26, rating: 4.7 },
  { vendor_id: CANTEEN, name: 'Pongal', price: 40, category: 'cooked', action_type: 'order', image_url: '/images/item_pongal.jpg', liked: 85, disliked: 0, reviews: 31, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Poori', price: 40, category: 'cooked', action_type: 'order', image_url: '/images/item_poori.png', liked: 88, disliked: 0, reviews: 34, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Meals', price: 60, category: 'cooked', action_type: 'order', image_url: '/images/item_meals.png', liked: 95, disliked: 0, reviews: 42, rating: 4.9 },
  { vendor_id: CANTEEN, name: 'Chapathi', price: 40, category: 'cooked', action_type: 'order', image_url: '/images/item_chapathi.png', liked: 80, disliked: 0, reviews: 28, rating: 4.7 },
  { vendor_id: CANTEEN, name: 'Chicken Fried Rice', price: 60, category: 'cooked', action_type: 'order', image_url: '/images/item_chicken_fried_rice.png', liked: 94, disliked: 0, reviews: 45, rating: 4.9 },
  { vendor_id: CANTEEN, name: 'Egg Fried Rice', price: 60, category: 'cooked', action_type: 'order', image_url: '/images/item_egg_fried_rice.png', liked: 89, disliked: 0, reviews: 37, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Veg Fried Rice', price: 60, category: 'cooked', action_type: 'order', image_url: '/images/item_veg_fried_rice.png', liked: 86, disliked: 0, reviews: 33, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Curd Rice', price: 40, category: 'cooked', action_type: 'order', image_url: '/images/item_curd_rice.png', liked: 79, disliked: 0, reviews: 25, rating: 4.7 },
  { vendor_id: CANTEEN, name: 'Special Chicken Rice', price: 90, category: 'cooked', action_type: 'order', image_url: '/images/item_special_chicken_rice.png', liked: 96, disliked: 0, reviews: 48, rating: 4.9 },
  { vendor_id: CANTEEN, name: 'Egg Omelette', price: 25, category: 'cooked', action_type: 'order', image_url: '/images/item_egg_omelette.png', liked: 84, disliked: 0, reviews: 30, rating: 4.8 },
  { vendor_id: CANTEEN, name: 'Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_chicken.jpg', liked: 88, disliked: 0, reviews: 34, rating: 4.8 },
  // --- MITS Cafe ---
  { vendor_id: CAFE, name: 'Tea', price: 15, category: 'cooked', action_type: 'walkin', image_url: '/images/item_tea.jpg', liked: 52, disliked: 0, reviews: 18, rating: 4.5 },
  { vendor_id: CAFE, name: 'Coffee', price: 20, category: 'cooked', action_type: 'walkin', image_url: '/images/item_coffee.jpg', liked: 60, disliked: 0, reviews: 22, rating: 4.6 },
  { vendor_id: CAFE, name: 'Black Coffee', price: 30, category: 'cooked', action_type: 'walkin', image_url: '/images/item_black_coffee.jpg', liked: 34, disliked: 0, reviews: 11, rating: 4.4 },
  { vendor_id: CAFE, name: 'Sonti Coffee', price: 30, category: 'cooked', action_type: 'walkin', image_url: '/images/item_sonti_coffee.jpg', liked: 41, disliked: 0, reviews: 14, rating: 4.7 },
  { vendor_id: CAFE, name: 'Milk', price: 0, category: 'cooked', action_type: 'walkin', image_url: '/images/item_milk.jpg', liked: 29, disliked: 0, reviews: 9, rating: 4.3 },
  { vendor_id: CAFE, name: 'Batanees', price: 0, category: 'packed', action_type: 'order', image_url: '/images/item_batanees.jpg', liked: 55, disliked: 0, reviews: 19, rating: 4.6 },
  { vendor_id: CAFE, name: 'Gobi Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_gobi.jpg', liked: 58, disliked: 0, reviews: 24, rating: 4.8 },
  { vendor_id: CAFE, name: 'Corn Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_corn.jpg', liked: 62, disliked: 0, reviews: 28, rating: 4.9 },
  { vendor_id: CAFE, name: 'Chicken Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_chicken.jpg', liked: 79, disliked: 0, reviews: 36, rating: 4.9 },
  // --- Ekdant's Cafe ---
  { vendor_id: EKDANT, name: 'Tea', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_tea.jpg', liked: 47, disliked: 0, reviews: 15, rating: 4.5 },
  { vendor_id: EKDANT, name: 'Coffee', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_coffee.jpg', liked: 51, disliked: 0, reviews: 17, rating: 4.5 },
  { vendor_id: EKDANT, name: 'Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_ekdant_samosa.jpg', liked: 66, disliked: 0, reviews: 23, rating: 4.7 },
  { vendor_id: EKDANT, name: 'Gobi Manchurian', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_gobi_manchurian.png', liked: 74, disliked: 0, reviews: 29, rating: 4.8 },
  { vendor_id: EKDANT, name: 'Mirchi Bajji (3 pcs)', price: 0, category: 'cooked', action_type: 'walkin', image_url: '/images/item_mirchi_bajji.png', liked: 73, disliked: 0, reviews: 27, rating: 4.8 },
  // --- Lickies ---
  { vendor_id: LICKIES, name: 'Tea', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_tea.jpg', liked: 39, disliked: 0, reviews: 12, rating: 4.4 },
  { vendor_id: LICKIES, name: 'Coffee', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_coffee.jpg', liked: 44, disliked: 0, reviews: 14, rating: 4.5 },
  { vendor_id: LICKIES, name: 'Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_chicken.jpg', liked: 58, disliked: 0, reviews: 20, rating: 4.6 },
  { vendor_id: LICKIES, name: 'Popsicle', price: 0, category: 'packed', action_type: 'walkin', image_url: '/images/item_popsicle.svg', liked: 82, disliked: 0, reviews: 31, rating: 4.8 },
  { vendor_id: LICKIES, name: 'Cone-Ice', price: 0, category: 'packed', action_type: 'walkin', image_url: '/images/item_cone_ice.jpg', liked: 76, disliked: 0, reviews: 28, rating: 4.8 },
  { vendor_id: LICKIES, name: 'Choco-Bar', price: 0, category: 'packed', action_type: 'walkin', image_url: '/images/item_choco_bar.jpg', liked: 85, disliked: 0, reviews: 32, rating: 4.9 },
  { vendor_id: LICKIES, name: 'Juice', price: 0, category: 'packed', action_type: 'walkin', image_url: '/images/item_juice.jpg', liked: 68, disliked: 0, reviews: 25, rating: 4.7 },
  { vendor_id: LICKIES, name: 'Kurkure', price: 0, category: 'packed', action_type: 'walkin', image_url: '/images/item_kurkure.jpg', liked: 92, disliked: 0, reviews: 35, rating: 4.8 },
  // --- New Cafe ---
  { vendor_id: NEWCAFE, name: 'Tea', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_tea.jpg', liked: 36, disliked: 0, reviews: 11, rating: 4.4 },
  { vendor_id: NEWCAFE, name: 'Coffee', price: 10, category: 'cooked', action_type: 'walkin', image_url: '/images/item_coffee.jpg', liked: 40, disliked: 0, reviews: 13, rating: 4.4 },
  { vendor_id: NEWCAFE, name: 'Samosa', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_chicken.jpg', liked: 54, disliked: 0, reviews: 18, rating: 4.6 },
  { vendor_id: NEWCAFE, name: 'Chicken Puff', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_chicken_puff.jpg', liked: 72, disliked: 0, reviews: 26, rating: 4.8 },
  { vendor_id: NEWCAFE, name: 'Veg Puff', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_veg_puff.jpg', liked: 68, disliked: 0, reviews: 22, rating: 4.7 },
  { vendor_id: NEWCAFE, name: 'Egg Puff', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_egg_puff.jpg', liked: 81, disliked: 0, reviews: 31, rating: 4.9 },
  { vendor_id: NEWCAFE, name: 'Veg Pizza', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_veg_pizza.jpg', liked: 87, disliked: 0, reviews: 36, rating: 4.9 },
  { vendor_id: NEWCAFE, name: 'French Fries', price: 0, category: 'cooked', action_type: 'order', image_url: '/images/item_french_fries.jpg', liked: 93, disliked: 0, reviews: 40, rating: 4.8 },
];

const ITEM_IDS = {
  'MITS Canteen|Tea': 'b0000000-0000-4000-8000-000000000001',
  'MITS Canteen|Coffee': 'b0000000-0000-4000-8000-000000000002',
  'MITS Canteen|Samosa': 'b0000000-0000-4000-8000-000000000003',
  'MITS Canteen|Dosa': 'b0000000-0000-4000-8000-000000000004',
  'MITS Canteen|Masala Dosa': 'b0000000-0000-4000-8000-000000000005',
  'MITS Canteen|Onion Dosa': 'b0000000-0000-4000-8000-000000000006',
  'MITS Canteen|Pongal': 'b0000000-0000-4000-8000-000000000007',
  'MITS Canteen|Poori': 'b0000000-0000-4000-8000-000000000008',
  'MITS Canteen|Meals': 'b0000000-0000-4000-8000-000000000009',
  'MITS Canteen|Chapathi': 'b0000000-0000-4000-8000-000000000010',
  'MITS Canteen|Chicken Fried Rice': 'b0000000-0000-4000-8000-000000000048',
  'MITS Canteen|Egg Fried Rice': 'b0000000-0000-4000-8000-000000000049',
  'MITS Canteen|Veg Fried Rice': 'b0000000-0000-4000-8000-000000000050',
  'MITS Canteen|Curd Rice': 'b0000000-0000-4000-8000-000000000051',
  'MITS Canteen|Special Chicken Rice': 'b0000000-0000-4000-8000-000000000052',
  'MITS Canteen|Egg Omelette': 'b0000000-0000-4000-8000-000000000053',
  'MITS Cafe|Tea': 'b0000000-0000-4000-8000-000000000011',
  'MITS Cafe|Coffee': 'b0000000-0000-4000-8000-000000000012',
  'MITS Cafe|Black Coffee': 'b0000000-0000-4000-8000-000000000013',
  'MITS Cafe|Sonti Coffee': 'b0000000-0000-4000-8000-000000000014',
  'MITS Cafe|Milk': 'b0000000-0000-4000-8000-000000000015',
  'MITS Cafe|Batanees': 'b0000000-0000-4000-8000-000000000016',
  'MITS Cafe|Gobi Samosa': 'b0000000-0000-4000-8000-000000000017',
  'MITS Cafe|Corn Samosa': 'b0000000-0000-4000-8000-000000000018',
  'MITS Cafe|Chicken Samosa': 'b0000000-0000-4000-8000-000000000019',
  "Ekdant's Cafe|Tea": 'b0000000-0000-4000-8000-000000000021',
  "Ekdant's Cafe|Coffee": 'b0000000-0000-4000-8000-000000000022',
  "Ekdant's Cafe|Samosa": 'b0000000-0000-4000-8000-000000000023',
  "Ekdant's Cafe|Gobi Manchurian": 'b0000000-0000-4000-8000-000000000025',
  "Ekdant's Cafe|Mirchi Bajji (3 pcs)": 'b0000000-0000-4000-8000-000000000024',
  'Lickies|Tea': 'b0000000-0000-4000-8000-000000000031',
  'Lickies|Coffee': 'b0000000-0000-4000-8000-000000000032',
  'Lickies|Samosa': 'b0000000-0000-4000-8000-000000000033',
  'Lickies|Popsicle': 'b0000000-0000-4000-8000-000000000034',
  'Lickies|Cone-Ice': 'b0000000-0000-4000-8000-000000000035',
  'Lickies|Choco-Bar': 'b0000000-0000-4000-8000-000000000036',
  'Lickies|Juice': 'b0000000-0000-4000-8000-000000000037',
  'Lickies|Kurkure': 'b0000000-0000-4000-8000-000000000038',
  'New Cafe|Tea': 'b0000000-0000-4000-8000-000000000041',
  'New Cafe|Coffee': 'b0000000-0000-4000-8000-000000000042',
  'New Cafe|Samosa': 'b0000000-0000-4000-8000-000000000043',
  'New Cafe|Chicken Puff': 'b0000000-0000-4000-8000-000000000044',
  'New Cafe|Veg Puff': 'b0000000-0000-4000-8000-000000000045',
  'New Cafe|Egg Puff': 'b0000000-0000-4000-8000-000000000046',
  'New Cafe|Veg Pizza': 'b0000000-0000-4000-8000-000000000047',
  'New Cafe|French Fries': 'b0000000-0000-4000-8000-000000000054',
};

const VENDOR_NAMES = {
  [CANTEEN]: 'MITS Canteen',
  [CAFE]: 'MITS Cafe',
  [EKDANT]: "Ekdant's Cafe",
  [LICKIES]: 'Lickies',
  [NEWCAFE]: 'New Cafe',
};

async function main() {
  // 1. Retire the old demo rows (QA Paneer Roll placeholder, old Biryani/Lays demo items)
  const listRes = await fetch(`${SUPABASE_URL}/rest/v1/food_items?select=id,name,vendor_id`, { headers: HEADERS });
  const existing = await listRes.json();
  const retire = existing.filter(
    r => r.name === 'QA Paneer Roll' || r.name === 'Biryani' || r.name === 'Lays'
  );
  for (const row of retire) {
    const del = await fetch(`${SUPABASE_URL}/rest/v1/food_items?id=eq.${row.id}`, {
      method: 'DELETE', headers: HEADERS,
    });
    if (del.ok) console.log(`🗑️  Retired demo item: ${row.name} (${VENDOR_NAMES[row.vendor_id] ?? row.vendor_id})`);
  }

  // 2. Seed each menu item: PATCH when (vendor_id, name) already exists,
  //    POST with a fixed UUID otherwise (reactions/orders stay stable).
  const fields = m => ({
    price: m.price,
    category: m.category,
    action_type: m.action_type,
    image_url: m.image_url,
    in_stock: true,
    likes_count: m.liked,
    dislikes_count: m.disliked,
    reviews_count: m.reviews,
  });

  let created = 0, updated = 0;
  for (const m of MENU) {
    const match = existing.find(r => r.vendor_id === m.vendor_id && r.name === m.name);
    if (match) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/food_items?id=eq.${match.id}`, {
        method: 'PATCH', headers: HEADERS, body: JSON.stringify(fields(m)),
      });
      if (!res.ok) { console.error(`❌ PATCH ${m.name} failed:`, res.status, await res.text()); process.exit(1); }
      updated++;
      console.log(`♻️  Updated: ${VENDOR_NAMES[m.vendor_id]} · ${m.name} → ₹${m.price}`);
    } else {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/food_items`, {
        method: 'POST',
        headers: { ...HEADERS, Prefer: 'return=representation' },
        body: JSON.stringify({
          id: ITEM_IDS[`${VENDOR_NAMES[m.vendor_id]}|${m.name}`],
          vendor_id: m.vendor_id,
          name: m.name,
          ...fields(m),
        }),
      });
      if (!res.ok) { console.error(`❌ POST ${m.name} failed:`, res.status, await res.text()); process.exit(1); }
      created++;
      console.log(`➕ Created: ${VENDOR_NAMES[m.vendor_id]} · ${m.name} — ₹${m.price}`);
    }
  }
  console.log(`\n✅ ${created} created, ${updated} updated`);

  // 3. Show the final menu by canteen
  const listRes2 = await fetch(`${SUPABASE_URL}/rest/v1/food_items?select=name,price,category,action_type,vendor_id&order=vendor_id,name`, { headers: HEADERS });
  const finalItems = await listRes2.json();
  console.log('\nFinal menu:');
  let lastVendor = '';
  for (const item of finalItems) {
    if (item.vendor_id !== lastVendor) {
      lastVendor = item.vendor_id;
      console.log(`\n${VENDOR_NAMES[item.vendor_id] ?? item.vendor_id}:`);
    }
    console.log(`  • ${item.name} — ₹${item.price} (${item.category}, ${item.action_type})`);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
