(function () {
  'use strict';
  var cfg = window.VP_ANALYTICS;
  if (!cfg || !cfg.id) return;

  var ID = cfg.id, KEY = 'vp-consent', OFF = 'vp-analytics-off', TTL = 365 * 864e5;
  var d = document, w = window;
  var on = false, started = false, albumSent = false, banner = null;
  var last = '', view = null;

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  var q = /[?&]analytics=(on|off)\b/.exec(location.search);
  if (q) write(OFF, q[1] === 'off' ? '1' : null);
  if (read(OFF)) return;

  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  function stored() {
    try {
      var r = JSON.parse(read(KEY));
      if (r && Date.now() - r.t < TTL && (r.v === 'granted' || r.v === 'denied')) return r.v;
    } catch (e) {}
    return null;
  }

  function status() {
    var t = on ? 'On' : 'Off';
    Array.prototype.forEach.call(d.querySelectorAll('[data-privacy-status]'), function (el) { el.textContent = t; });
  }

  var EVENTS = {
    screenshot_view: ['game_name', 'album_slug', 'screenshot_id', 'screenshot_name', 'view_source'],
    screenshot_zoom: ['game_name', 'album_slug', 'screenshot_id'],
    screenshot_fullscreen: ['game_name', 'album_slug', 'screenshot_id'],
    screenshot_download: ['game_name', 'album_slug', 'screenshot_id', 'file_format'],
    album_view: ['game_name', 'album_slug', 'screenshot_count'],
    outbound_click: ['platform', 'destination_category', 'link_location']
  };

  function send(name, params) {
    if (!on || !EVENTS[name]) return;
    var out = {};
    EVENTS[name].forEach(function (k) {
      var v = params[k];
      if (typeof v === 'number' && isFinite(v)) out[k] = v;
      else if (typeof v === 'string' && v) out[k] = v.slice(0, 100);
    });
    try { gtag('event', name, out); } catch (e) {}
  }

  var gal = d.getElementById('gallery');
  var game = gal ? gal.dataset.game : '', album = gal ? gal.dataset.album : '';

  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  function shot(id) {
    var key = album + '/' + id;
    if (key.length > 100) key = key.slice(0, 91) + '-' + hash(key);
    return { game_name: game, album_slug: album, screenshot_id: key };
  }

  function sendAlbum() {
    if (!gal || albumSent || !on) return;
    albumSent = true;
    send('album_view', { game_name: game, album_slug: album, screenshot_count: +gal.dataset.count });
  }

  function cookies() {
    var host = location.hostname;
    ['_ga', '_ga_' + ID.replace(/^G-/, '')].forEach(function (n) {
      d.cookie = n + '=; Max-Age=0; path=/';
      d.cookie = n + '=; Max-Age=0; path=/; domain=' + host;
    });
  }

  function loadScript() {
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    d.head.appendChild(s);
  }

  function start() {
    on = true;
    w['ga-disable-' + ID] = false;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (!started) {
      started = true;
      gtag('js', new Date());
      gtag('config', ID, { cookie_domain: location.hostname, allow_google_signals: false, allow_ad_personalization_signals: false });
      var defer = function () { setTimeout(loadScript, 1500); };
      if (d.readyState === 'complete') defer(); else w.addEventListener('load', defer);
    }
    sendAlbum();
    status();
  }

  function stop() {
    var was = on;
    on = false;
    w['ga-disable-' + ID] = true;
    if (was || started) gtag('consent', 'update', { analytics_storage: 'denied' });
    cookies();
    status();
  }

  function choose(v) {
    write(KEY, JSON.stringify({ v: v, t: Date.now() }));
    if (v === 'granted') start(); else stop();
    if (banner) {
      var inside = banner.contains(d.activeElement);
      banner.remove();
      banner = null;
      if (inside) { var m = d.getElementById('main'); if (m) { m.tabIndex = -1; m.focus(); } }
    }
  }

  function showBanner() {
    if (banner) { banner.querySelector('button').focus(); return; }
    banner = d.createElement('section');
    banner.className = 'consent';
    banner.setAttribute('aria-label', 'Analytics preferences');
    banner.innerHTML =
      '<p>Allow Google Analytics to count visits and which screenshots are viewed? Nothing is sent to Google unless you accept. <a href="' + cfg.privacy + '">Privacy</a></p>' +
      '<div class="consent-actions"><button type="button" data-choice="denied">Reject</button><button type="button" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-choice]');
      if (b) choose(b.dataset.choice);
    });
    d.body.insertBefore(banner, d.getElementById('site'));
  }

  function hashSource() {
    try {
      var r = new URL(d.referrer);
      if (r.origin === location.origin && r.pathname === cfg.home) return 'home';
    } catch (e) {}
    return 'direct';
  }

  function reloaded() {
    var n = w.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    return !!n && n.type === 'reload';
  }

  d.addEventListener('viewer:view', function (e) {
    var x = e.detail || {};
    view = { id: x.id, zoomed: false };
    if (x.how === 'pop' && x.id === last) return;
    if (x.how === 'hash' && reloaded()) return;
    last = x.id;
    var p = shot(x.id);
    p.screenshot_name = x.name;
    p.view_source = x.how === 'click' ? 'album' : x.how === 'hash' ? hashSource() : 'navigation';
    send('screenshot_view', p);
  });

  d.addEventListener('viewer:zoom', function (e) {
    var x = e.detail || {};
    if (!view || view.id !== x.id || view.zoomed) return;
    view.zoomed = true;
    send('screenshot_zoom', shot(x.id));
  });

  d.addEventListener('viewer:fullscreen', function (e) { send('screenshot_fullscreen', shot((e.detail || {}).id)); });

  d.addEventListener('viewer:download', function (e) {
    var p = shot((e.detail || {}).id);
    p.file_format = 'webp';
    send('screenshot_download', p);
  });

  var PLATFORMS = {
    'x.com': ['x', 'social'], 'twitter.com': ['x', 'social'], 'flickr.com': ['flickr', 'photo_sharing'],
    'steamcommunity.com': ['steam', 'gaming'], 'steampowered.com': ['steam', 'gaming'],
    'github.com': ['github', 'code'], 'reddit.com': ['reddit', 'social'], 'creativecommons.org': ['creativecommons', 'license']
  };

  function outbound(e) {
    if (e.button > 1 || (e.type === 'auxclick' && e.button !== 1)) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var u;
    try { u = new URL(a.href); } catch (err) { return; }
    if ((u.protocol !== 'http:' && u.protocol !== 'https:') || u.hostname === location.hostname) return;
    var host = u.hostname.replace(/^www\./, ''), p = PLATFORMS[host];
    send('outbound_click', {
      platform: p ? p[0] : host,
      destination_category: p ? p[1] : 'other',
      link_location: a.closest('footer') ? 'footer' : a.closest('header') ? 'header' : 'content'
    });
  }
  d.addEventListener('click', outbound);
  d.addEventListener('auxclick', outbound);

  d.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-privacy]')) showBanner();
  });

  function init() {
    var v = stored();
    if (v === null && (navigator.globalPrivacyControl === true || navigator.doNotTrack === '1')) v = 'denied';
    if (v === 'granted') start();
    else { stop(); if (v === null) showBanner(); }
    status();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
