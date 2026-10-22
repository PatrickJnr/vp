(function () {
  'use strict';
  var gallery = document.getElementById('gallery');
  if (!gallery) return;

  var links = Array.prototype.slice.call(gallery.querySelectorAll('.shot a'));
  if (!links.length) return;

  var MAX_SCALE = 8;
  var viewer, stage, img, counter, infoBox, infoName, infoDims, infoCaption, infoFull;
  var btnZoomIn, btnZoomOut, btnFull, btnDownload, btnPrev, btnNext, btnClose, btnInfo;
  var index = -1, opener = null, pushed = false, idleTimer = 0;
  var s = 1, tx = 0, ty = 0;
  var pointers = {}, gesture = null;
  var fullLoaded = {}, zoomSent = false;

  function emit(type, detail) {
    document.dispatchEvent(new CustomEvent('viewer:' + type, { detail: detail }));
  }
  function currentId() { return index < 0 ? '' : links[index].dataset.id; }

  function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }
  function button(cls, label, ic, extra) {
    return '<button type="button" class="vbtn ' + cls + '" aria-label="' + label + '" title="' + label + '"' + (extra || '') + '>' + icon(ic) + '</button>';
  }

  function build() {
    viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Screenshot viewer');
    viewer.tabIndex = -1;
    viewer.hidden = true;
    viewer.innerHTML =
      '<div class="viewer-bar">' +
        '<span class="viewer-count" aria-live="polite"></span>' +
        '<div class="viewer-tools">' +
          button('v-out', 'Zoom out', 'zoom_out', ' disabled') +
          button('v-in', 'Zoom in', 'zoom_in') +
          button('v-info', 'Photo details', 'info', ' aria-expanded="false"') +
          '<a class="vbtn v-dl hide-small" aria-label="Download full size" title="Download full size" download>' + icon('download') + '</a>' +
          button('v-fs hide-small', 'Fullscreen', 'fullscreen') +
          button('v-close', 'Close', 'close') +
        '</div>' +
      '</div>' +
      '<div class="viewer-stage"><img class="viewer-img" alt="" draggable="false"></div>' +
      button('viewer-nav prev', 'Previous screenshot', 'chevron_left') +
      button('viewer-nav next', 'Next screenshot', 'chevron_right') +
      '<div class="viewer-info" hidden>' +
        '<strong></strong><span class="v-dims"></span>' +
        '<p class="v-caption" hidden></p>' +
        '<p><a class="v-open" target="_blank" rel="noopener">Open full size</a></p>' +
      '</div>';
    document.body.appendChild(viewer);

    stage = viewer.querySelector('.viewer-stage');
    img = viewer.querySelector('.viewer-img');
    counter = viewer.querySelector('.viewer-count');
    infoBox = viewer.querySelector('.viewer-info');
    infoName = infoBox.querySelector('strong');
    infoDims = infoBox.querySelector('.v-dims');
    infoCaption = infoBox.querySelector('.v-caption');
    infoFull = infoBox.querySelector('.v-open');
    btnZoomIn = viewer.querySelector('.v-in');
    btnZoomOut = viewer.querySelector('.v-out');
    btnFull = viewer.querySelector('.v-fs');
    btnDownload = viewer.querySelector('.v-dl');
    btnPrev = viewer.querySelector('.prev');
    btnNext = viewer.querySelector('.next');
    btnClose = viewer.querySelector('.v-close');
    btnInfo = viewer.querySelector('.v-info');

    if (!document.fullscreenEnabled) btnFull.style.display = 'none';

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { go(-1); });
    btnNext.addEventListener('click', function () { go(1); });
    btnZoomIn.addEventListener('click', function () { zoomBy(1.5); });
    btnZoomOut.addEventListener('click', function () { zoomBy(1 / 1.5); });
    btnFull.addEventListener('click', toggleFullscreen);
    btnDownload.addEventListener('click', function () { emit('download', { id: currentId() }); });
    btnInfo.addEventListener('click', function () {
      var open = infoBox.hidden;
      infoBox.hidden = !open;
      btnInfo.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('fullscreenchange', function () {
      var on = !!document.fullscreenElement;
      btnFull.innerHTML = icon(on ? 'fullscreen_exit' : 'fullscreen');
      btnFull.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen');
      btnFull.title = btnFull.getAttribute('aria-label');
      if (on && document.fullscreenElement === viewer) emit('fullscreen', { id: currentId() });
      fit();
    });

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('dblclick', onDouble);
    viewer.addEventListener('mousemove', wake);
    viewer.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () { if (!viewer.hidden) fit(); });
  }


  function dataFor(i) {
    var a = links[i], t = a.querySelector('img');
    return {
      id: a.dataset.id, name: a.dataset.name, w: +a.dataset.w, h: +a.dataset.h,
      full: a.dataset.full, caption: a.dataset.caption || '',
      srcset: t.getAttribute('srcset'), alt: t.alt, thumb: t.currentSrc || t.src
    };
  }

  function show(i, instant, how) {
    index = (i + links.length) % links.length;
    var d = dataFor(index);
    zoomSent = false;
    resetZoom(true);
    img.classList.add('fading');
    var token = {};
    show.token = token;
    var next = new Image();
    next.sizes = '100vw';
    next.srcset = d.srcset;
    var apply = function () {
      if (show.token !== token) return;
      img.srcset = d.srcset;
      img.sizes = '100vw';
      img.src = next.currentSrc || next.src;
      img.alt = d.alt;
      img.width = d.w;
      img.height = d.h;
      fit();
      img.classList.remove('fading');
    };
    img.removeAttribute('srcset');
    img.src = d.thumb;
    img.alt = d.alt;
    fit();
    img.classList.remove('fading');
    if (next.decode) { next.src = d.thumb; next.decode().catch(function () {}).then(apply); }
    else { next.onload = apply; next.src = d.thumb; }

    counter.textContent = (index + 1) + ' of ' + links.length;
    infoName.textContent = d.name;
    infoDims.textContent = d.w + ' x ' + d.h + ' px';
    infoCaption.hidden = !d.caption;
    infoCaption.textContent = d.caption;
    infoFull.href = d.full;
    btnDownload.href = d.full;
    btnDownload.setAttribute('download', d.id + '.webp');
    btnPrev.disabled = btnNext.disabled = links.length < 2;
    preload(index + 1); preload(index - 1);
    if (!instant) setHash(d.id, false);
    emit('view', { id: d.id, name: d.name, how: how || 'nav' });
  }

  function preload(i) {
    var d = dataFor((i + links.length) % links.length);
    var p = new Image();
    p.sizes = '100vw';
    p.srcset = d.srcset;
    p.src = d.thumb;
  }

  function fullSrc() {
    var d = dataFor(index);
    if (fullLoaded[d.id]) return;
    var big = new Image();
    big.onload = function () {
      fullLoaded[d.id] = true;
      if (links[index] && links[index].dataset.id === d.id) { img.removeAttribute('srcset'); img.src = d.full; }
    };
    big.src = d.full;
  }


  function stageSize() { return { w: stage.clientWidth, h: stage.clientHeight }; }

  function fit() {
    var st = stageSize(), d = dataFor(index);
    var k = Math.min(st.w / d.w, st.h / d.h);
    img.style.width = Math.round(d.w * k) + 'px';
    img.style.height = Math.round(d.h * k) + 'px';
    clamp(); apply();
  }

  function clamp() {
    var st = stageSize(), iw = img.offsetWidth * s, ih = img.offsetHeight * s;
    var baseX = (st.w - img.offsetWidth) / 2, baseY = (st.h - img.offsetHeight) / 2;
    var minX = Math.min(0, st.w - iw) - baseX, maxX = Math.max(0, st.w - iw) - baseX;
    var minY = Math.min(0, st.h - ih) - baseY, maxY = Math.max(0, st.h - ih) - baseY;
    if (iw <= st.w) { tx = (st.w - iw) / 2 - baseX; } else { tx = Math.min(maxX, Math.max(minX, tx)); }
    if (ih <= st.h) { ty = (st.h - ih) / 2 - baseY; } else { ty = Math.min(maxY, Math.max(minY, ty)); }
  }

  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    stage.classList.toggle('zoomed', s > 1.001);
    btnZoomOut.disabled = s <= 1.001;
    btnZoomIn.disabled = s >= MAX_SCALE - 0.001;
    var a = document.activeElement;
    if ((a === btnZoomIn || a === btnZoomOut) && a.disabled) viewer.focus();
  }

  function resetZoom(instant) {
    s = 1; tx = 0; ty = 0;
    img.classList.toggle('smooth', !instant);
    if (!instant) setTimeout(function () { img.classList.remove('smooth'); }, 260);
    if (img.src) { fit(); }
  }

  function zoomAt(ns, cx, cy, smooth) {
    ns = Math.min(MAX_SCALE, Math.max(1, ns));
    var baseX = (stageSize().w - img.offsetWidth) / 2, baseY = (stageSize().h - img.offsetHeight) / 2;
    var px = (cx - baseX - tx) / s, py = (cy - baseY - ty) / s;
    s = ns;
    tx = cx - baseX - px * s; ty = cy - baseY - py * s;
    if (smooth) { img.classList.add('smooth'); setTimeout(function () { img.classList.remove('smooth'); }, 260); }
    clamp(); apply();
    if (s > 1.4) fullSrc();
    if (s > 1.2 && !zoomSent) { zoomSent = true; emit('zoom', { id: currentId() }); }
  }

  function zoomBy(f) { var st = stageSize(); zoomAt(s * f, st.w / 2, st.h / 2, true); }

  function stagePoint(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  function onWheel(e) {
    e.preventDefault();
    var p = stagePoint(e);
    var f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018));
    zoomAt(s * f, p.x, p.y, false);
  }

  function onDouble(e) {
    var p = stagePoint(e);
    if (s > 1.001) { resetZoom(false); } else { zoomAt(2.5, p.x, p.y, true); }
  }


  function count() { return Object.keys(pointers).length; }
  function dist() { var k = Object.keys(pointers); var a = pointers[k[0]], b = pointers[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid() { var k = Object.keys(pointers); var a = pointers[k[0]], b = pointers[k[1]]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

  function onDown(e) {
    stage.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = stagePoint(e);
    img.classList.remove('smooth');
    if (count() === 1) {
      gesture = { type: 'pan', sx: pointers[e.pointerId].x, sy: pointers[e.pointerId].y, tx: tx, ty: ty, t: Date.now(), moved: false };
    } else if (count() === 2) {
      gesture = { type: 'pinch', d: dist(), s: s, m: mid(), tx: tx, ty: ty };
    }
  }

  function onMove(e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = stagePoint(e);
    if (!gesture) return;
    if (gesture.type === 'pinch' && count() >= 2) {
      var m = mid();
      zoomAt(gesture.s * dist() / gesture.d, m.x, m.y, false);
    } else if (gesture.type === 'pan') {
      var p = pointers[e.pointerId], dx = p.x - gesture.sx, dy = p.y - gesture.sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) gesture.moved = true;
      if (s > 1.001) {
        stage.classList.add('panning');
        tx = gesture.tx + dx; ty = gesture.ty + dy;
        clamp(); apply();
      }
    }
  }

  function onUp(e) {
    var p = pointers[e.pointerId];
    delete pointers[e.pointerId];
    stage.classList.remove('panning');
    if (!gesture) return;
    if (gesture.type === 'pan' && p) {
      var dx = p.x - gesture.sx, dy = p.y - gesture.sy, dt = Date.now() - gesture.t;
      if (s <= 1.001 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 700) { go(dx < 0 ? 1 : -1); }
      else if (s <= 1.001 && dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.4 && dt < 700) { close(); }
      else if (!gesture.moved && e.pointerType !== 'mouse') { wake(true); }
    }
    if (count() === 0) gesture = null;
    else if (count() === 1) {
      var k = Object.keys(pointers)[0];
      gesture = { type: 'pan', sx: pointers[k].x, sy: pointers[k].y, tx: tx, ty: ty, t: Date.now(), moved: true };
    }
  }


  function go(step) { if (links.length > 1) show(index + step); }

  function wake(toggle) {
    clearTimeout(idleTimer);
    if (toggle === true) viewer.classList.toggle('idle');
    else viewer.classList.remove('idle');
    idleTimer = setTimeout(function () {
      if (!viewer.hidden && !infoBox.matches(':hover') && (document.activeElement === document.body || document.activeElement === viewer)) viewer.classList.add('idle');
    }, 3500);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (viewer.requestFullscreen) viewer.requestFullscreen().catch(function () {});
  }

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'Escape': if (!document.fullscreenElement) { e.preventDefault(); close(); } break;
      case 'ArrowLeft': e.preventDefault(); go(-1); break;
      case 'ArrowRight': e.preventDefault(); go(1); break;
      case 'Home': e.preventDefault(); show(0, false, 'nav'); break;
      case 'End': e.preventDefault(); show(links.length - 1, false, 'nav'); break;
      case '+': case '=': zoomBy(1.5); break;
      case '-': case '_': zoomBy(1 / 1.5); break;
      case '0': resetZoom(false); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'i': case 'I': btnInfo.click(); break;
      case 'Tab': trap(e); break;
    }
    wake();
  }

  function trap(e) {
    var f = Array.prototype.filter.call(viewer.querySelectorAll('button, a[href]'), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function setHash(id, push) {
    var url = location.pathname + location.search + '#' + id;
    try {
      if (push) { history.pushState({ viewer: true }, '', url); pushed = true; }
      else history.replaceState(history.state, '', url);
    } catch (err) {}
  }

  function open(i, how) {
    if (!viewer) build();
    opener = document.activeElement;
    viewer.hidden = false;
    document.body.classList.add('viewer-open');
    var site = document.getElementById('site');
    if (site) site.setAttribute('inert', '');
    show(i, true, how);
    if (how === 'click') setHash(links[index].dataset.id, true);
    btnClose.focus();
    wake();
  }

  function close() {
    if (!viewer || viewer.hidden) return;
    if (document.fullscreenElement) document.exitFullscreen();
    viewer.hidden = true;
    document.body.classList.remove('viewer-open');
    var site = document.getElementById('site');
    if (site) site.removeAttribute('inert');
    if (pushed) { pushed = false; history.back(); }
    else { try { history.replaceState(history.state, '', location.pathname + location.search); } catch (err) {} }
    if (opener && opener.focus) opener.focus();
  }


  gallery.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('.shot a');
    if (!a) return;
    e.preventDefault();
    open(links.indexOf(a), 'click');
  });

  function fromHash(how) {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) { if (viewer && !viewer.hidden) { pushed = false; close(); } return; }
    for (var i = 0; i < links.length; i++) {
      if (links[i].dataset.id === id) { if (!viewer || viewer.hidden) open(i, how); else show(i, true, how); return; }
    }
  }
  window.addEventListener('popstate', function () {
    pushed = false;
    fromHash('pop');
  });
  fromHash('hash');
})();
