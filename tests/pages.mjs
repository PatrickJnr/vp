import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { startServer } from './serve.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const server = await startServer(4174);
const B = 'http://localhost:4174';
const shots = process.env.SHOTS;
if (shots) fs.mkdirSync(shots, { recursive: true });

const sizes = [[3440, 1440], [2560, 1440], [1920, 1080], [1366, 768], [1024, 768], [820, 1180], [768, 1024], [430, 932], [390, 844], [360, 800], [320, 700]];
const pages = ['/', '/albums/', '/Fallout-4/', '/about', '/contact', '/privacy', '/changelog', '/404.html'];

const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };

const errors = [];
const c = await browser.newContext();
await c.route(/googletagmanager\.com|google-analytics\.com|doubleclick\.net/, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await c.addInitScript(() => { try { if (!localStorage.getItem('vp-consent')) localStorage.setItem('vp-consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
const p = await c.newPage();
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });

for (const [w, h] of sizes) {
  await p.setViewportSize({ width: w, height: h });
  for (const u of pages) {
    await p.goto(B + u, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const m = await p.evaluate(() => {
      const f = document.querySelector('.site-footer').getBoundingClientRect();
      const main = document.getElementById('main').getBoundingClientRect();
      const de = document.documentElement;
      return { footerBottom: f.bottom + scrollY, footerTop: f.top + scrollY, mainBottom: main.bottom + scrollY, docH: de.scrollHeight, vh: innerHeight, sw: de.scrollWidth, cw: de.clientWidth };
    });
    const tag = `${u} ${w}x${h}`;
    ok(m.sw <= m.cw, `${tag} horizontal scroll ${m.sw}>${m.cw}`);
    ok(m.footerTop >= m.mainBottom - 0.5, `${tag} footer overlaps main`);
    ok(Math.abs(m.footerBottom - m.docH) <= 1, `${tag} footer not at end of document (${m.footerBottom} vs ${m.docH})`);
    if (m.docH <= m.vh) ok(m.docH === m.vh, `${tag} short page leaves gap (${m.docH} vs ${m.vh})`);
    if (['/about', '/contact', '/privacy', '/404.html'].includes(u)) {
      console.log(`${tag}: ${m.docH <= m.vh ? 'short' : 'long'} doc ${m.docH} vh ${m.vh}`);
      if (shots) await p.screenshot({ path: `${shots}/${u.replace(/\W+/g, '_')}-${w}.png`, fullPage: false });
    }
  }
}

await p.setViewportSize({ width: 1366, height: 768 });
await p.goto(B + '/privacy');
const status = () => p.textContent('[data-privacy-status]');
ok((await status()) === 'Off', 'privacy status Off when rejected');
await p.focus('[data-privacy]');
await p.keyboard.press('Enter');
ok(await p.isVisible('.consent'), 'button opens consent banner by keyboard');
await p.click('.consent [data-choice=granted]');
ok((await status()) === 'On', 'status On after accept');
await p.reload();
ok((await status()) === 'On', 'status On after reload');
await p.click('[data-privacy]');
await p.click('.consent [data-choice=denied]');
ok((await status()) === 'Off', 'status Off after reject');

await p.setViewportSize({ width: 390, height: 844 });
await p.goto(B + '/privacy');
await p.tap('[data-privacy]').catch(() => p.click('[data-privacy]'));
ok(await p.isVisible('.consent'), 'button works at 390');
const box = await p.locator('[data-privacy]').boundingBox();
ok(box.height >= 44, 'preference button is at least 44px tall');

await p.goto(B + '/contact');
const links = await p.$$eval('.link-list a', a => a.map(x => [x.textContent.trim(), x.target, x.rel]));
ok(links.length === 4 && links.every(l => l[1] === '_blank' && /noopener/.test(l[2])), 'social links open safely: ' + JSON.stringify(links));
ok((await p.getAttribute('.contact-mail a', 'href')) === 'mailto:admin@grimtech.co.uk', 'email link');

ok(errors.length === 0, 'console errors: ' + errors.join(' | '));
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
await browser.close();
server.close();
process.exit(fails ? 1 : 0);
