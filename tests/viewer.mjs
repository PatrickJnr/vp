import { pathToFileURL } from 'node:url';
import { startServer } from './serve.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const server = await startServer(4174);
const b = await chromium.launch();
const out = [];
const ok = (n, c, x = '') => out.push((c ? 'PASS ' : 'FAIL ') + n + ' ' + x);
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
const B = 'http://localhost:4174';
await p.goto(B + '/Fallout-4/');
const n = await p.locator('.shot a').count();
await p.locator('.shot a').nth(1).click();
await p.waitForSelector('.viewer:not([hidden])');
ok('opens', true);
const h1 = await p.evaluate(() => location.hash); ok('hash set', h1.length > 1, h1);
await p.mouse.click(683, 400);
await p.keyboard.press('ArrowRight');
const c1 = await p.textContent('.viewer-count'); ok('arrow after stage click', c1.startsWith('3 '), c1);
await p.keyboard.press('ArrowLeft');
const c2 = await p.textContent('.viewer-count'); ok('arrow back', c2.startsWith('2'), c2);
await p.keyboard.press('Home'); ok('Home', (await p.textContent('.viewer-count')).startsWith('1 '));
await p.keyboard.press('ArrowLeft'); ok('wrap first->last', (await p.textContent('.viewer-count')).startsWith(n + ' '), await p.textContent('.viewer-count'));
await p.keyboard.press('End'); ok('End', (await p.textContent('.viewer-count')).startsWith(n + ' '));
await p.keyboard.press('ArrowRight'); ok('wrap last->first', (await p.textContent('.viewer-count')).startsWith('1 '));
for (let i = 0; i < 12; i++) await p.keyboard.press('Tab');
ok('focus stays in viewer', await p.evaluate(() => !!document.activeElement.closest('.viewer')));
await p.keyboard.press('+'); await p.keyboard.press('+');
const tr = await p.evaluate(() => document.querySelector('.viewer-img').style.transform); ok('zoom', /scale\(2\.25\)/.test(tr), tr);
await p.keyboard.press('0'); await p.waitForTimeout(400);
await p.mouse.click(683, 400);
await p.keyboard.press('Escape');
ok('escape closes (after stage click)', await p.evaluate(() => document.querySelector('.viewer').hidden));
ok('hash cleared', (await p.evaluate(() => location.hash)) === '', await p.evaluate(() => location.href));
ok('focus restored', await p.evaluate(() => document.activeElement.closest('.shot') !== null));
await p.locator('.shot a').nth(2).click(); await p.waitForSelector('.viewer:not([hidden])');
await p.goBack(); await p.waitForTimeout(200);
ok('back closes', await p.evaluate(() => document.querySelector('.viewer').hidden));
await p.goForward(); await p.waitForTimeout(200);
ok('forward reopens', await p.evaluate(() => !document.querySelector('.viewer').hidden));
await p.keyboard.press('Escape');
const id = await p.locator('.shot a').nth(4).getAttribute('data-id');
await p.goto(B + '/Fallout-4/#' + id); await p.waitForSelector('.viewer:not([hidden])');
ok('deep link opens right one', (await p.textContent('.viewer-count')).startsWith('5 '), await p.textContent('.viewer-count'));
await p.reload(); await p.waitForSelector('.viewer:not([hidden])');
ok('refresh with hash', (await p.textContent('.viewer-count')).startsWith('5 '));
await p.keyboard.press('Escape'); await p.waitForTimeout(100);
ok('esc after deep link closes', await p.evaluate(() => document.querySelector('.viewer').hidden), await p.evaluate(() => location.href));
await p.goto('about:blank');
await p.goto(B + '/Fallout-4/#nonsense'); await p.waitForTimeout(200);
ok('unknown hash does not open the viewer', await p.evaluate(() => !document.querySelector('.viewer')));
for (const [name, vp] of [['desk', { width: 1366, height: 768 }], ['mobile', { width: 390, height: 844 }]]) {
  await p.setViewportSize(vp);
  await p.goto(B + '/Fallout-4/');
  for (const i of [0, n - 1]) {
    await p.locator('.shot a').nth(i).click(); await p.waitForSelector('.viewer:not([hidden])'); await p.waitForTimeout(600);
    const r = await p.evaluate(() => { const e = document.querySelector('.viewer-img'), i = e.getBoundingClientRect(), s = document.querySelector('.viewer-stage').getBoundingClientRect(); return { iw: i.width, ih: i.height, sw: s.width, sh: s.height, ar: i.width / i.height, nat: e.naturalWidth / e.naturalHeight, src: e.currentSrc.split('/').pop() }; });
    ok(`fit ${name} #${i}`, r.iw <= r.sw + 1 && r.ih <= r.sh + 1 && Math.abs(r.ar - r.nat) < 0.02, JSON.stringify(r));
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  }
}
ok('no console errors', errs.length === 0, errs.join('|'));
console.log(out.join('\n'));
await b.close();

server.close();
process.exit(out.some(l => l.startsWith("FAIL")) ? 1 : 0);
