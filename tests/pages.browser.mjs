import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = (process.env.CASE_STUDY_TEST_URL || 'http://127.0.0.1:4420/statoz-next-case-study/').replace(/\/?$/, '/');
const url = route => new URL(route, base).href;
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome', headless: true });
await fs.mkdir('test-results/pages', { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  context.setDefaultTimeout(45000);
  const errors = [], failed = [], escaped = [];
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(new URL(base).origin)) failed.push(response.status() + ' ' + response.url()); });
  });
  context.on('request', request => { const target = new URL(request.url()); if (['http:', 'https:'].includes(target.protocol) && target.origin === new URL(base).origin && !target.pathname.startsWith(new URL(base).pathname)) escaped.push(target.href); });
  await context.addInitScript(() => {
    // Demo bootstrapping and reset must leave other StatOz sites' data intact.
    try {
      localStorage.setItem('statoz.next.sports-web.auth.v2', 'preserve-sports');
      localStorage.setItem('statoz.next.games-web.auth.v2', 'preserve-games');
    } catch { /* Sandboxed srcdoc frames intentionally have no origin storage. */ }
  });
  for (const route of ['', 'present/', 'presenter/', 'data/', 'admin/', 'studio/', 'walkthrough/', 'data/statoz-by-the-numbers-nov-2026.pdf', 'assets/investor-demo.mp4']) {
    const response = await context.request.get(url(route));
    assert.equal(response.status(), 200, route);
  }
  const version = await (await context.request.get(url('version.json'))).json();
  assert.equal(version.repository, 'pai45/statoz-next-case-study');
  if (process.env.EXPECTED_COMMIT) assert.equal(version.commit, process.env.EXPECTED_COMMIT);
  assert.ok(version.bytes < 990_000_000);
  const home = await context.newPage();
  await home.goto(base);
  await home.locator('h1').filter({ hasText: 'A daily home.' }).waitFor();
  const controls = home.getByLabel('Presentation views');
  const presenterHref = await controls.getByRole('link', { name: 'Presenter view', exact: true }).getAttribute('href');
  const investorHref = await controls.getByRole('link', { name: 'Investor view', exact: true }).getAttribute('href');
  assert.equal(new URL(presenterHref, base).search, new URL(investorHref, base).search);
  await home.screenshot({ path: 'test-results/pages/home-desktop.png', fullPage: true });
  await home.setViewportSize({ width: 390, height: 844 });
  assert.ok(await home.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await home.screenshot({ path: 'test-results/pages/home-mobile.png', fullPage: true });
  const presenter = await context.newPage(), audience = await context.newPage();
  await presenter.goto(new URL(presenterHref, base).href);
  await audience.goto(new URL(investorHref, base).href);
  await presenter.getByText('Audience window connected', { exact: true }).waitFor();
  await presenter.getByRole('textbox', { name: /SPEAKER NOTES/ }).fill('PRIVATE PAGES CHECK');
  assert.ok(!(await audience.locator('body').innerText()).includes('PRIVATE PAGES CHECK'));
  await presenter.locator('.run-select').filter({ hasText: 'StatOz Sports' }).click();
  const sports = await (await audience.locator('.sports-product-frame').elementHandle()).contentFrame();
  await sports.getByRole('tab', { name: 'Football', exact: true }).waitFor();
  assert.ok(sports.url().startsWith(url('demos/sports/')));
  assert.deepEqual(await sports.evaluate(() => ({ width: innerWidth, height: innerHeight })), { width: 1024, height: 768 });
  await sports.getByRole('tab', { name: 'Football', exact: true }).press('Enter');
  await audience.screenshot({ path: 'test-results/pages/sports.png' });
  await presenter.locator('.run-select').filter({ hasText: 'StatOz Games' }).click();
  const games = await (await audience.locator('.games-product-frame').elementHandle()).contentFrame();
  await games.getByRole('button', { name: 'Game Library', exact: true }).first().waitFor();
  await games.getByRole('button', { name: 'Game Library', exact: true }).first().press('Enter');
  await games.getByRole('heading', { name: 'Game Library', exact: true }).waitFor();
  await audience.screenshot({ path: 'test-results/pages/games.png' });
  const beforeReset = await games.evaluate(() => performance.timeOrigin);
  await audience.evaluate(() => window.dispatchEvent(new Event('statoz-case-reset')));
  await games.waitForFunction(previous => performance.timeOrigin !== previous, beforeReset);
  await games.getByRole('heading', { name: 'Game Library', exact: true }).waitFor();
  assert.deepEqual(await audience.evaluate(() => [localStorage.getItem('statoz.next.sports-web.auth.v2'), localStorage.getItem('statoz.next.games-web.auth.v2')]), ['preserve-sports', 'preserve-games']);
  const launch = presenter.getByRole('tablist', { name: 'Launch a real game' });
  for (const [label, route] of [['Longbow', 'longbow'], ['Rally Dash', 'rally'], ['Yorker', 'yorker'], ['Hoop Legacy', 'hoop-legacy']]) {
    await launch.getByRole('tab', { name: label, exact: true }).click();
    await audience.waitForFunction(route => document.querySelector('.games-product-frame')?.getAttribute('src')?.includes('/play/' + route + '/'), route);
    const host = await (await audience.locator('.games-product-frame').elementHandle()).contentFrame();
    const engine = await (await host.locator('iframe').elementHandle()).contentFrame();
    // Some native title screens keep their playfield hidden until Start.
    await engine.locator('canvas').first().waitFor({ state: 'attached', timeout: 90000 });
    await engine.waitForFunction(() => document.body.innerText.trim().length > 20);
    console.log('PASS hosted native ' + label + ' engine loaded with its accepted artifact.');
  }
  await presenter.locator('.run-select').filter({ hasText: 'StatOz Admin' }).click();
  const admin = await (await audience.locator('.admin-product-frame').elementHandle()).contentFrame();
  await admin.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
  assert.ok(admin.url().startsWith(url('admin/')) || admin.url().startsWith(url('admin?')));
  await presenter.getByRole('button', { name: 'Blackout screen', exact: true }).click();
  await audience.locator('.blackout-screen').waitFor();
  await presenter.getByRole('button', { name: 'Restore audience', exact: true }).click();
  await audience.locator('.admin-product-frame').waitFor();
  const data = await context.newPage();
  await data.goto(url('data/'));
  assert.equal(await data.locator('.data-sheet>.data-table-wrap tbody tr').count(), 107);
  const downloadPromise = data.waitForEvent('download');
  await data.getByRole('button', { name: 'Download CSV' }).click();
  const download = await downloadPromise;
  await download.saveAs('test-results/pages/data.csv');
  assert.equal((await fs.readFile('test-results/pages/data.csv', 'utf8')).split('\r\n').length, 108);
  assert.deepEqual(errors, [], 'Browser errors');
  assert.deepEqual(failed, [], 'Failed resources');
  assert.deepEqual(escaped, [], 'Requests outside the project path');
  console.log('PASS published routes, build identity, desktop/mobile layout, linked presenter/audience views, embedded Sports/Games/Admin, isolated demo reset, evidence CSV and resource paths.');
  await fs.writeFile('test-results/pages/result.json', JSON.stringify({ base, commit: version.commit, status: 'passed' }, null, 2));
  await context.close();
} catch (error) {
  console.error(error.stack || error);
  for (const context of browser.contexts()) for (const [index, page] of context.pages().entries()) {
    console.error('Failure page:', page.url(), (await page.locator('body').innerText().catch(() => '')).slice(0, 500));
    for (const frame of page.frames().slice(1)) console.error('Frame:', frame.url(), (await frame.locator('body').innerText().catch(() => '')).slice(0, 600));
    await page.screenshot({ path: `test-results/pages/failure-${index}.png`, timeout: 5000 }).catch(() => {});
  }
  throw error;
} finally { await browser.close(); }
