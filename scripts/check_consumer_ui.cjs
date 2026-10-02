// Run: PLAYWRIGHT_PACKAGE=<path to playwright> node scripts/check_consumer_ui.cjs
// QA_ORIGIN defaults to the local Vite server. Backend writes are intercepted.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const vendorId = 'a0000000-0000-4000-8000-000000000001';
    const vendor = { id: vendorId, name: 'MITS Canteen', is_active: true, is_online: true, image_url: '/images/shop_mits_canteen.jpg', location_landmark: 'Food Court', latitude: 13.6288, longitude: 78.502, is_on_campus: true };
    const closedVendor = { ...vendor, id:'a0000000-0000-4000-8000-000000000006', name:'Closed Cafe', is_online:false };
    const row = { id: 'b0000000-0000-4000-8000-000000000001', vendor_id: vendorId, name: 'Samosa', price: 15, category: 'cooked', action_type: 'order', image_url: '/images/item_samosa_chicken.jpg', in_stock: true, likes_count: 3, dislikes_count: 0, reviews_count: 0, created_at: '2026-01-01', vendors: vendor, reviews: [] };
    let writes = 0;
    let menuOffline = false;
    await page.route('**/rest/v1/**', async route => {
      const url = new URL(route.request().url());
      const table = url.pathname.split('/').pop();
      if (table === 'food_items' && menuOffline) return route.fulfill({ status:503, contentType:'application/json', body:JSON.stringify({ message:'Test failure' }) });
      if (table === 'orders' && route.request().method() === 'POST') {
        writes++;
        await new Promise(resolve => setTimeout(resolve, 250));
        return route.fulfill({ status: writes === 1 ? 503 : 201, contentType: 'application/json', body: writes === 1 ? JSON.stringify({ message: 'Test failure' }) : '' });
      }
      const body = table === 'food_items' ? [row, { ...row, id: 'b0000000-0000-4000-8000-000000000002', name:'Packed snack', category:'packed', action_type:'walkin' }, { ...row, id:'b0000000-0000-4000-8000-000000000003', name:'Sold out snack', in_stock:false }, { ...row, id:'b0000000-0000-4000-8000-000000000004', vendor_id:closedVendor.id, vendors:closedVendor, name:'Closed shop snack' }] : table === 'vendors' ? [vendor,closedVendor] : [];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(origin);
    await page.getByRole('heading', { name: 'Good food. Between lectures.' }).waitFor();
    await page.waitForTimeout(500);
    const overflow = async label => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: horizontal overflow`);
    for (const width of [320,375,430,768,1280]) {
      await page.setViewportSize({ width, height: 812 });
      await overflow(`Home ${width}`);
      const bad = await page.locator('.consumer-ui button:visible').evaluateAll(nodes => nodes.filter(node => { const box = node.getBoundingClientRect(); return box.width < 43.9 || box.height < 43.9; }).map(node => node.textContent));
      assert.deepEqual(bad, [], `Small touch targets at ${width}`);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'node_modules/.tmp/consumer-home.png', fullPage: true });
    await page.getByLabel('Search food or shops').fill('zzzz');
    await page.getByRole('heading', { name: 'No matches for “zzzz”' }).waitFor();
    await page.getByRole('button', { name: 'Show the full menu' }).click();
    await page.getByRole('button', { name:'Closed Cafe Closed', exact:true }).click();
    assert(await page.getByRole('button', { name:'Shop closed', exact:true }).isDisabled());
    await page.getByRole('button', { name:'Show all shops' }).click();
    await page.getByRole('button', { name: 'Packed', exact: true }).click();
    await page.getByRole('button', { name: 'View Packed snack details', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cooked', exact: true }).click();
    assert(await page.getByRole('button', { name: 'Sold out', exact:true }).isDisabled());
    await page.getByRole('button', { name: 'Hot deals', exact: true }).click();
    await page.getByRole('heading', { name: 'No deals listed right now' }).waitFor();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name:'Review Samosa', exact:true }).click();
    const review = page.getByRole('dialog', { name:'Rate Samosa', exact:true });
    await review.waitFor();
    await page.setViewportSize({ width:320, height:400 });
    assert(await review.evaluate(node => node.scrollWidth <= node.clientWidth));
    await page.getByLabel('Review (optional)').fill('A useful campus bite.');
    await page.getByRole('button', { name:'Rate 4 stars' }).click();
    assert.equal(await page.getByRole('button', { name:'Rate 4 stars' }).getAttribute('aria-pressed'),'true');
    await page.getByRole('button', { name:'Send review' }).scrollIntoViewIfNeeded();
    await page.keyboard.press('Escape');
    const trigger = page.getByRole('button', { name: 'View Samosa details', exact: true });
    await trigger.focus(); await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Samosa', exact: true }).waitFor();
    for (const width of [320,375,640]) { await page.setViewportSize({ width, height: 568 }); await overflow(`Detail ${width}`); }
    await page.getByRole('button', { name: 'Find shop' }).click();
    const map = page.getByRole('dialog', { name: 'Find MITS Canteen' });
    await map.waitFor();
    await page.getByRole('link', { name: /Open Google Maps/ }).scrollIntoViewIfNeeded();
    assert((await page.getByRole('link', { name: /Open Google Maps/ }).getAttribute('href')).includes('travelmode=walking'));
    assert(await map.evaluate(node => node.scrollWidth <= node.clientWidth));
    await page.keyboard.press('Escape');
    // App returns to discovery when opening the map from a detail.
    await page.getByRole('button', { name: 'Quick order', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Grab your next bite' });
    await dialog.waitFor();
    assert(await page.locator('#campus-search').evaluate(node => !!node.closest('[inert]')));
    for (const size of [[320,568],[375,400],[640,812]]) {
      await page.setViewportSize({ width:size[0], height:size[1] });
      assert(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth));
      await page.getByRole('button', { name: 'Send order · ₹15' }).scrollIntoViewIfNeeded();
    }
    await page.getByLabel('Mobile number', { exact:true }).fill('9876543210');
    await page.getByLabel('Campus location', { exact:true }).fill('Main block 204');
    await page.getByRole('button', { name: 'Send order · ₹15' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(writes,1);
    await page.getByRole('button', { name: 'Send order · ₹15' }).click();
    await page.getByRole('heading', { name: 'Token pinned' }).waitFor();
    assert.equal(writes,2);
    await page.waitForTimeout(1800);
    assert(await page.getByRole('heading', { name: 'Token pinned' }).isVisible(), 'Token must stay visible');
    await page.getByRole('button', { name: 'Back to the menu' }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Dismiss order tracking' }).waitFor();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; }); await overflow('RTL');
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.fontSize = '32px'; }); await overflow('200% text');
    menuOffline = true;
    await page.reload();
    await page.getByRole('button', { name:'Retry menu' }).waitFor();
    assert.equal(await page.getByRole('button', { name:'Quick order', exact:true }).count(),0, 'No sample orders after a live catalog failure');
    menuOffline = false;
    await page.getByRole('button', { name:'Retry menu' }).click();
    await page.getByRole('button', { name:'Quick order', exact:true }).waitFor();
    await page.evaluate(() => {
      window.__yemDeferredInstall = { prompt:async () => {}, userChoice:Promise.resolve({ outcome:'accepted' }) };
      window.dispatchEvent(new Event('yem-install-available'));
    });
    const install = page.getByRole('dialog', { name:'Install YEMUNNAI', exact:true });
    await install.waitFor();
    await page.getByRole('button', { name:'Install app', exact:true }).click();
    await install.waitFor({ state:'hidden' });
    await page.goto(`${origin}/?flow=location`);
    await page.getByRole('heading', { name:'Food around you' }).waitFor();
    await page.setViewportSize({ width:320, height:568 }); await overflow('Campus welcome');
    await page.getByRole('button', { name:'Browse the campus menu' }).focus(); await page.keyboard.press('Enter');
    await page.getByRole('heading', { name:'Good food. Between lectures.' }).waitFor();
    assert.deepEqual(errors,[]);
    console.log('PASS: consumer responsive layouts, 44px targets, keyboard details, map handoff, inert background, order error/retry/token, persistence, RTL and text resize. No real orders sent.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
