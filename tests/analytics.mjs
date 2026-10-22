import { pathToFileURL } from 'node:url';
import { startServer } from './serve.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const server = await startServer(4173);
const B = 'http://localhost:4173';

const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

async function ctx({ block = false, init } = {}) {
  const c = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const google = [];
  await c.route(/googletagmanager\.com|google-analytics\.com|doubleclick\.net/, route => {
    google.push(route.request().url());
    if (block) return route.abort();
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  if (init) await c.addInitScript(init);
  const page = await c.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { c, page, google, errors };
}
const events = page => page.evaluate(() => (window.dataLayer || []).filter(a => a[0] === 'event').map(a => ({ name: a[1], ...a[2] })));
const named = async (page, n) => (await events(page)).filter(e => e.name === n);
const grantInit = () => localStorage.setItem('vp-consent', JSON.stringify({ v: 'granted', t: Date.now() }));
const open = async (page, n = 0) => {
  await page.locator('.shot a').nth(n).click();
  await page.waitForSelector('.viewer:not([hidden])');
  await page.waitForTimeout(250);
};

console.log('-- consent');
{
  const { c, page, google } = await ctx();
  await page.goto(B + '/Fallout-4/');
  await page.waitForSelector('.consent');
  await page.waitForTimeout(600);
  ok(google.length === 0, 'no Google request before choice');
  ok((await events(page)).length === 0, 'no events before choice');
  ok(await page.evaluate(() => !document.cookie.includes('_ga')), 'no _ga cookie before choice');
  const r = await page.evaluate(() => [...document.querySelectorAll('.consent button')].map(b => [b.textContent, getComputedStyle(b).borderRadius]));
  ok(r.length === 2 && r[0][0] === 'Reject' && r[1][0] === 'Accept' && r.every(x => parseFloat(x[1]) <= 4), 'Reject and Accept present, radius <= 4px');
  await page.locator('.consent button', { hasText: 'Reject' }).click();
  await page.waitForTimeout(600);
  ok(!(await page.$('.consent')), 'banner removed after reject');
  await open(page);
  ok(google.length === 0 && (await events(page)).length === 0, 'reject: viewer works, no events, no Google request');
  await page.reload();
  await page.waitForTimeout(500);
  ok(!(await page.$('.consent')) && google.length === 0, 'reject persists across reload');
  await page.goto(B + '/privacy');
  ok((await page.textContent('[data-privacy-status]')) === 'Off', 'privacy page status Off');
  await page.click('[data-privacy]');
  await page.waitForSelector('.consent');
  await page.locator('.consent button', { hasText: 'Accept' }).click();
  await page.waitForTimeout(800);
  ok(!google.some(u => u.includes('gtag/js')), 'gtag.js waits before loading');
  await page.waitForTimeout(1500);
  ok(google.some(u => u.includes('googletagmanager.com/gtag/js?id=G-XXPKD9SFHL')), 'accept loads gtag.js');
  ok((await page.textContent('[data-privacy-status]')) === 'On', 'privacy page status On');
  const pv = await page.evaluate(() => (window.dataLayer || []).map(a => [...a]));
  ok(pv.some(a => a[0] === 'consent' && a[1] === 'default' && a[2].ad_storage === 'denied' && a[2].ad_user_data === 'denied' && a[2].ad_personalization === 'denied' && a[2].analytics_storage === 'denied'), 'consent default denied (v2 signals)');
  ok(pv.some(a => a[0] === 'consent' && a[1] === 'update' && a[2].analytics_storage === 'granted'), 'consent update granted');
  const cfg = pv.find(a => a[0] === 'config');
  ok(cfg && cfg[1] === 'G-XXPKD9SFHL' && cfg[2].allow_google_signals === false && cfg[2].allow_ad_personalization_signals === false, 'config disables signals and ad personalisation');
  await page.click('[data-privacy]');
  await page.locator('.consent button', { hasText: 'Reject' }).click();
  ok((await page.textContent('[data-privacy-status]')) === 'Off', 'revoke: status Off');
  ok(await page.evaluate(() => window['ga-disable-G-XXPKD9SFHL'] === true), 'revoke sets ga-disable flag');
  await page.goto(B + '/Fallout-4/');
  await open(page);
  ok((await named(page, 'screenshot_view')).length === 0, 'revoked: no events on later page');
  await c.close();
}
{
  const { c, page, google } = await ctx({ init: grantInit });
  await page.goto(B + '/');
  await page.waitForTimeout(2200);
  ok(!(await page.$('.consent')), 'stored grant: no banner');
  ok(google.some(u => u.includes('gtag/js')), 'stored grant: gtag loads');
  await c.close();
}
{
  const { c, page } = await ctx({ init: () => localStorage.setItem('vp-consent', JSON.stringify({ v: 'granted', t: Date.now() - 400 * 864e5 })) });
  await page.goto(B + '/');
  ok(!!(await page.waitForSelector('.consent')), 'expired consent asks again');
  await c.close();
}
{
  const c = await browser.newContext();
  await c.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
  const google = [];
  await c.route(/google/, r => { google.push(r.request().url()); r.fulfill({ body: '' }); });
  const page = await c.newPage();
  await page.goto(B + '/');
  await page.waitForTimeout(500);
  ok(!(await page.$('.consent')) && google.length === 0, 'GPC: treated as reject, no banner, no request');
  await c.close();
}
{
  const { c, page, google } = await ctx();
  await page.goto(B + '/?analytics=off');
  await page.waitForTimeout(400);
  ok(!(await page.$('.consent')) && google.length === 0, '?analytics=off disables everything');
  await page.goto(B + '/?analytics=on');
  ok(!!(await page.waitForSelector('.consent')), '?analytics=on restores banner');
  await c.close();
}
{
  const { c, page } = await ctx();
  await page.goto(B + '/Fallout-4/');
  await page.waitForSelector('.consent');
  await page.focus('.consent button[data-choice=denied]');
  ok(await page.evaluate(() => document.activeElement.textContent === 'Reject'), 'banner buttons are keyboard focusable');
  await page.keyboard.press('Enter');
  ok(!(await page.$('.consent')), 'Reject works from keyboard');
  ok(await page.evaluate(() => document.activeElement === document.getElementById('main')), 'focus moves to main after choosing');
  const p2 = await c.newPage();
  await p2.goto(B + '/privacy');
  await p2.waitForSelector('[data-privacy]');
  await p2.evaluate(() => localStorage.clear());
  await p2.reload();
  await p2.waitForSelector('.consent');
  ok((await p2.getAttribute('.consent', 'aria-label')) === 'Analytics preferences', 'banner has accessible name');
  await c.close();
}

console.log('-- events (consent granted)');
{
  const { c, page, errors } = await ctx({ init: grantInit });
  await page.goto(B + '/Fallout-4/');
  await page.waitForTimeout(400);
  const av = await named(page, 'album_view');
  ok(av.length === 1 && av[0].album_slug === 'Fallout-4' && av[0].game_name === 'Fallout 4' && av[0].screenshot_count === 40, 'one album_view with params');
  await open(page, 3);
  let sv = await named(page, 'screenshot_view');
  const id3 = await page.evaluate(() => document.querySelectorAll('.shot a')[3].dataset.id);
  ok(sv.length === 1 && sv[0].screenshot_id === 'Fallout-4/' + id3 && sv[0].view_source === 'album' && sv[0].album_slug === 'Fallout-4' && sv[0].game_name === 'Fallout 4' && !!sv[0].screenshot_name, 'open emits exactly one screenshot_view');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  sv = await named(page, 'screenshot_view');
  ok(sv.length === 2 && sv[1].view_source === 'navigation' && sv[1].screenshot_id !== sv[0].screenshot_id, 'next emits one more view, source navigation');
  const before = sv.length;
  await page.click('.v-in'); await page.click('.v-in'); await page.click('.v-in');
  await page.mouse.move(600, 400);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -120);
  await page.waitForTimeout(300);
  ok((await named(page, 'screenshot_view')).length === before, 'zoom adds no screenshot_view');
  ok((await named(page, 'screenshot_zoom')).length === 1, 'repeated zoom emits one screenshot_zoom');
  await page.keyboard.press('ArrowRight');
  await page.click('.v-in');
  await page.waitForTimeout(200);
  ok((await named(page, 'screenshot_zoom')).length === 2, 'zoom on next screenshot counts again');
  await page.keyboard.press('Home');
  await page.waitForTimeout(100);
  await page.keyboard.press('End');
  await page.waitForTimeout(100);
  ok((await named(page, 'screenshot_view')).length === before + 3, 'next, Home and End emit one view each');
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await page.waitForTimeout(200);
  ok((await named(page, 'screenshot_view')).length === before + 3, 'resize does not re-emit');
  await page.evaluate(() => { HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error('denied')); });
  const fsBefore = (await named(page, 'screenshot_fullscreen')).length;
  await page.click('.v-fs');
  await page.waitForTimeout(300);
  ok((await named(page, 'screenshot_fullscreen')).length === fsBefore, 'failed fullscreen request emits nothing');
  await c.close();
  ok(errors.length === 0, 'no page errors (' + errors.join('|') + ')');
}
{
  const { c, page } = await ctx({ init: grantInit });
  await page.goto(B + '/Fallout-4/');
  await open(page);
  await page.click('.v-fs');
  await page.waitForTimeout(500);
  const real = await page.evaluate(() => !!document.fullscreenElement);
  if (!real) {
    await page.evaluate(() => {
      const v = document.querySelector('.viewer');
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => v });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
  }
  ok((await named(page, 'screenshot_fullscreen')).length === 1, 'successful fullscreen emits one screenshot_fullscreen (' + (real ? 'real' : 'simulated') + ')');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  ok((await named(page, 'screenshot_fullscreen')).length === 1, 'remaining in fullscreen emits no more');
  if (real) await page.evaluate(() => document.exitFullscreen());
  else await page.evaluate(() => { delete document.fullscreenElement; document.dispatchEvent(new Event('fullscreenchange')); });
  await page.waitForTimeout(300);
  ok((await named(page, 'screenshot_fullscreen')).length === 1, 'exiting fullscreen emits nothing');
  ok((await named(page, 'screenshot_download')).length === 0, 'no download event from loading images');
  await page.evaluate(() => document.querySelector('.v-dl').addEventListener('click', e => e.preventDefault()));
  await page.click('.v-dl');
  const dn = await named(page, 'screenshot_download');
  ok(dn.length === 1 && dn[0].file_format === 'webp' && dn[0].screenshot_id.startsWith('Fallout-4/'), 'download click emits one screenshot_download');
  await c.close();
}
{
  const { c, page } = await ctx({ init: grantInit });
  await page.goto(B + '/');
  await page.waitForTimeout(300);
  ok((await named(page, 'album_view')).length === 0, 'homepage emits no album_view');
  const href = await page.getAttribute('.gallery--home .shot:nth-child(2) a', 'href');
  await page.locator('.gallery--home .shot a').nth(1).click();
  await page.waitForSelector('.viewer:not([hidden])');
  await page.waitForTimeout(500);
  const sv = await named(page, 'screenshot_view');
  ok((await named(page, 'album_view')).length === 1, 'album_view fires once on arrival from home');
  ok(sv.length === 1 && sv[0].view_source === 'home' && href.endsWith('#' + sv[0].screenshot_id.split('/')[1]), 'home click gives one view, source home');
  await c.close();
}
{
  const { c, page } = await ctx({ init: grantInit });
  await page.goto(B + '/Fallout-4/');
  const id = await page.evaluate(() => document.querySelectorAll('.shot a')[5].dataset.id);
  const p2 = await c.newPage();
  await p2.goto(B + '/Fallout-4/#' + id);
  await p2.waitForSelector('.viewer:not([hidden])');
  await p2.waitForTimeout(300);
  const sv = await named(p2, 'screenshot_view');
  ok(sv.length === 1 && sv[0].view_source === 'direct' && sv[0].screenshot_id === 'Fallout-4/' + id, 'direct link emits one view, source direct');
  await p2.reload();
  await p2.waitForSelector('.viewer:not([hidden])');
  await p2.waitForTimeout(300);
  ok((await named(p2, 'screenshot_view')).length === 0, 'reload with hash does not re-count the view');

  const p3 = await c.newPage();
  await p3.goto(B + '/Fallout-4/');
  await open(p3, 2);
  await p3.keyboard.press('ArrowRight');
  await p3.waitForTimeout(200);
  const base = (await named(p3, 'screenshot_view')).length;
  await p3.goBack(); await p3.waitForTimeout(250);
  await p3.goForward(); await p3.waitForTimeout(300);
  const after = (await named(p3, 'screenshot_view')).length;
  ok(after === base, 'Back then Forward to same screenshot adds no duplicate (' + base + ' to ' + after + ')');
  await c.close();
}
{
  const { c, page } = await ctx({ init: grantInit });
  await page.goto(B + '/contact');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.addEventListener('click', e => e.preventDefault());
  });
  for (const name of ['X', 'Flickr', 'Steam', 'GitHub']) await page.locator('footer a', { hasText: new RegExp('^' + name + '$') }).click();
  const ob = await named(page, 'outbound_click');
  ok(ob.length === 4 && ob.map(e => e.platform).join() === 'x,flickr,steam,github' && ob.every(e => e.link_location === 'footer'), 'footer outbound clicks: one event each with platform');
  ok(ob.every(e => Object.keys(e).every(k => ['name', 'platform', 'destination_category', 'link_location'].includes(k))), 'outbound events carry no URL or query');
  await page.click('main a[href^="mailto"]');
  await page.click('footer a[href$="/changelog"]');
  ok((await named(page, 'outbound_click')).length === 4, 'mailto and internal links not tracked');
  const all = JSON.stringify(await events(page));
  ok(!/@|\?|https?:/.test(all), 'no URLs, emails or query strings in any event');
  await c.close();
}
{
  const { c, page, errors } = await ctx({ init: grantInit, block: true });
  await page.goto(B + '/Fallout-4/');
  await open(page);
  await page.keyboard.press('ArrowRight');
  await page.click('.v-in');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelector('.viewer').hidden), 'viewer works with Google blocked');
  ok(errors.length === 0, 'no errors with Google blocked (' + errors.join('|') + ')');
  await c.close();
}
{
  const c = await browser.newContext();
  await c.route(/analytics\.js/, r => r.abort());
  const page = await c.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(B + '/Fallout-4/');
  await open(page);
  await page.keyboard.press('ArrowRight');
  ok(errors.length === 0 && (await page.textContent('.viewer-count')) === '2 of 40', 'viewer works when analytics.js fails to load');
  await c.close();
}
{
  const { c, page } = await ctx({ init: grantInit });
  await page.goto(B + '/albums/');
  const urls = await page.evaluate(() => [...document.querySelectorAll('.tile a')].map(a => new URL(a.href).pathname));
  ok(urls.length === 16, '16 albums listed');
  const ids = [];
  for (const u of urls) {
    const p = await c.newPage();
    await p.goto(B + u);
    const r = await p.evaluate(() => ({ g: document.getElementById('gallery').dataset.album, ids: [...document.querySelectorAll('.shot a')].map(a => a.dataset.id) }));
    r.ids.forEach(i => ids.push({ album: r.g, id: i, url: u }));
    await p.close();
  }
  ok(ids.length === 179 && new Set(ids.map(x => x.album + '/' + x.id)).size === 179, '179 screenshots, 179 unique gallery ids');
  const long = ids.filter(x => (x.album + '/' + x.id).length > 100);
  ok(long.length === 2, 'two over-length ids found (' + long.length + ')');
  const seen = [];
  for (const x of long) {
    const got = [];
    for (let run = 0; run < 2; run++) {
      const p = await c.newPage();
      await p.goto(B + x.url + '#' + x.id);
      await p.waitForSelector('.viewer:not([hidden])');
      await p.waitForTimeout(250);
      got.push((await named(p, 'screenshot_view'))[0].screenshot_id);
      await p.close();
    }
    ok(got[0] === got[1] && got[0].length === 100 && /-[0-9a-f]{8}$/.test(got[0]), 'long id shortened deterministically to 100 chars: ' + got[0]);
    seen.push(got[0]);
    const link = await (await c.newPage()).goto(B + x.url + '#' + x.id);
    ok(link.status() === 200, 'gallery URL keeps the full id');
  }
  ok(seen[0] !== seen[1], 'shortened ids do not collide');
  const p = await c.newPage();
  await p.goto(B + '/Fallout-4/');
  const first = await p.evaluate(() => document.querySelector('.shot a').dataset.id);
  await p.goto(B + '/Fallout-4/#' + first);
  await p.waitForTimeout(300);
  ok((await named(p, 'screenshot_view'))[0].screenshot_id === 'Fallout-4/' + first, 'short ids are unchanged');
  await c.close();
}

console.log('-- cookie scope');
{
  const { c, page } = await ctx();
  const H = 'http://vp.example.localhost:4173';
  await c.addCookies([
    { name: '_ga', value: 'parent', domain: '.example.localhost', path: '/' },
    { name: '_ga_XXPKD9SFHL', value: 'parent', domain: '.example.localhost', path: '/' },
    { name: '_ga', value: 'host', domain: 'vp.example.localhost', path: '/' },
    { name: '_ga_XXPKD9SFHL', value: 'host', domain: 'vp.example.localhost', path: '/' },
    { name: '_ga', value: 'sibling', domain: 'other.example.localhost', path: '/' },
    { name: '_ga', value: 'shared', domain: 'example.localhost', path: '/' }
  ]);
  const vals = async () => (await c.cookies()).filter(k => k.name.startsWith('_ga')).map(k => k.name + '=' + k.value + '@' + k.domain).sort();
  const before = await vals();
  ok(before.length === 6, 'seeded 6 cookies (' + before.length + ')');
  await page.goto(H + '/');
  await page.waitForSelector('.consent');
  const after = await vals();
  ok(!after.some(v => v.endsWith('=host@vp.example.localhost')), 'this host cookies deleted when not consented');
  ok(after.includes('_ga=sibling@other.example.localhost'), 'sibling subdomain cookie untouched');
  ok(after.includes('_ga=parent@.example.localhost') && after.includes('_ga=shared@example.localhost'), 'parent-domain cookies untouched');
  await page.locator('.consent button', { hasText: 'Accept' }).click();
  await page.waitForTimeout(500);
  const cfg = await page.evaluate(() => [...window.dataLayer].map(a => [...a]).find(a => a[0] === 'config'));
  ok(cfg[2].cookie_domain === 'vp.example.localhost', 'config pins cookie_domain to this hostname');
  await c.addCookies([{ name: '_ga', value: 'host2', domain: 'vp.example.localhost', path: '/' }]);
  await page.goto(H + '/privacy');
  await page.click('[data-privacy]');
  await page.locator('.consent button', { hasText: 'Reject' }).click();
  const rev = await vals();
  ok(!rev.some(v => v.endsWith('@vp.example.localhost')) && rev.includes('_ga=sibling@other.example.localhost') && rev.includes('_ga=parent@.example.localhost'), 'revoke removes only this host and leaves parent and sibling');
  await c.close();
}

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
