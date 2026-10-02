// Run with PLAYWRIGHT_PACKAGE pointing to an installed Playwright package.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const vendor = { id: 'a0000000-0000-4000-8000-000000000001', name: 'MITS Canteen', is_active: true, is_online: true, location_landmark: 'Food Court', image_url: '/images/shop_mits_canteen.jpg' };
    const item = { id: 'b0000000-0000-4000-8000-000000000001', vendor_id: vendor.id, name: 'Samosa', price: 15, category: 'cooked', action_type: 'order', in_stock: true, vendors: vendor, image_url: '/images/item_samosa_chicken.jpg', likes_count: 3, reviews: [] };
    await page.route('**/rest/v1/**', route => {
      const table = new URL(route.request().url()).pathname.split('/').pop();
      assert.equal(route.request().method(), 'GET', 'Smoke check must not write to the backend');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(table === 'vendors' ? [vendor] : table === 'food_items' ? [item] : []) });
    });
    await page.goto(process.env.QA_ORIGIN || 'http://127.0.0.1:5173');
    await page.getByLabel('Search food and canteens').waitFor();
    assert.equal(await page.locator('.consumer-ui').count(), 0, 'Redesign theme removed');
    assert.equal(await page.getByLabel('Search food and canteens').evaluate(node => getComputedStyle(node.closest('.min-h-205')).backgroundColor), 'rgb(232, 236, 239)');
    for (const width of [320, 375, 430, 768, 1280]) {
      await page.setViewportSize({ width, height: 812 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByLabel('View Samosa details').click();
    await page.getByText('Item Details', { exact: true }).waitFor();
    await page.goto(process.env.QA_ORIGIN || 'http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Open business portal' }).click();
    await page.getByLabel('SECURITY PIN (4 DIGITS)').waitFor();
    assert.equal(await page.getByLabel('SECURITY PIN (4 DIGITS)').getAttribute('type'), 'password');
    assert.deepEqual(errors, []);
    console.log('PASS: earlier light interface, responsive widths, detail screen, and secure PIN entry.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
