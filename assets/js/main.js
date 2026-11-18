/* =====================================================================
   N Think — page behaviour (plain JavaScript, no libraries)
   Sections: theme · header · hero · clients · manifesto · work · viewer
             disciplines · figures · contact form
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('js'); // lets CSS hide things that JS will animate in

  /* ---------- Theme: follow the device, remember the visitor's choice ---------- */
  var toggle = $('.theme-toggle');
  function setTheme(t, save) {
    root.dataset.theme = t;
    toggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('nthink-theme', t); } catch (e) {} }
  }
  setTheme(root.dataset.theme, false);
  toggle.addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
  // If the visitor never chose, keep following the device when it changes (e.g. sunset auto-dark)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null; try { saved = localStorage.getItem('nthink-theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- Header: border after scrolling, hide when scrolling down, progress bar ---------- */
  var nav = $('.nav'), bar = $('.progress'), lastY = 0;
  function onScroll() {
    var y = window.scrollY, max = document.body.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 10);
    nav.classList.toggle('hide', y > lastY && y > 600 && !document.body.classList.contains('locked'));
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Highlight the menu link of the section currently on screen
  var navLinks = $$('[data-nav]');
  var sectionSpy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('active', a.hash === '#' + en.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'disciplines', 'studio', 'contact'].forEach(function (id) { sectionSpy.observe(document.getElementById(id)); });

  // Mobile menu
  var menuBtn = $('.menu-btn'), menu = $('#mobile-menu');
  function closeMenu() { menuBtn.setAttribute('aria-expanded', 'false'); menu.hidden = true; document.body.classList.remove('locked'); }
  menuBtn.addEventListener('click', function () {
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open;
    document.body.classList.toggle('locked', open);
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Hero: the single page-load sequence ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('loaded'); }); });
  var heroVideo = $('#heroVideo'), reelBtn = $('.reel-toggle');
  if (reduceMotion) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); reelBtn.textContent = 'Play'; reelBtn.setAttribute('aria-label', 'Play background film'); }
  reelBtn.addEventListener('click', function () {
    var paused = heroVideo.paused; paused ? heroVideo.play() : heroVideo.pause();
    reelBtn.textContent = paused ? 'Pause' : 'Play';
    reelBtn.setAttribute('aria-label', (paused ? 'Pause' : 'Play') + ' background film');
  });

  /* ---------- Clients: fill the marquee twice so it loops seamlessly ---------- */
  var track = $('#clientTrack');
  var names = CLIENTS.map(function (n) { return '<span>' + n + '</span>'; }).join('');
  track.innerHTML = names + names.replace(/<span>/g, '<span aria-hidden="true">');

  /* ---------- Manifesto: words light up as the paragraph scrolls past ---------- */
  var mt = $('#manifestoText');
  mt.innerHTML = mt.textContent.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  var words = $$('.w', mt);
  function lightWords() {
    var r = mt.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    var n = reduceMotion ? words.length : Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }
  addEventListener('scroll', lightWords, { passive: true }); lightWords();

  /* ---------- Work: featured projects ---------- */
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var byId = {}; PROJECTS.forEach(function (p) { byId[p.id] = p; });

  $('#featured').innerHTML = PROJECTS.filter(function (p) { return p.featured; }).map(function (p) {
    var first = p.media[0];
    // Tall artwork reads better as a strip of three than as one tight crop
    var media = first.h > first.w
      ? '<div class="feat-strip">' + p.media.slice(0, 3).map(function (m) { return '<img src="' + m.thumb + '" alt="" loading="lazy">'; }).join('') + '</div>'
      : '<img src="' + first.src + '" alt="" loading="lazy">';
    return '<button class="feat" type="button" data-open="' + p.id + '">' +
      '<div class="feat-media">' + media + '</div>' +
      '<div class="feat-info"><p class="feat-client">' + esc(p.client) + '</p>' +
      '<h3 class="feat-title">' + esc(p.title) + '</h3><p class="feat-text">' + esc(p.text) + '</p>' +
      '<span class="feat-more">View ' + p.media.length + ' images</span></div></button>';
  }).join('');

  /* ---------- Work: archive grid + filters ---------- */
  // Spread films between the still work so they don't all stack in one column
  var stills = PROJECTS.filter(function (p) { return !p.featured && p.cat !== 'motion'; });
  var films = PROJECTS.filter(function (p) { return !p.featured && p.cat === 'motion'; });
  var rest = [], step = Math.max(1, Math.round(stills.length / (films.length || 1)));
  stills.forEach(function (p, i) { rest.push(p); if (i % step === step - 1 && films.length) rest.push(films.shift()); });
  rest = rest.concat(films);
  var grid = $('#grid');
  grid.innerHTML = rest.map(function (p) {
    var m = p.media[0], isFilm = !!m.video;
    return '<button class="tile" type="button" data-open="' + p.id + '" data-cat="' + p.cat + '">' +
      '<div class="tile-media" style="aspect-ratio:' + m.w + '/' + m.h + '">' +
        '<img src="' + m.thumb + '" alt="' + esc(p.client + ', ' + p.title) + '" loading="lazy" width="' + m.w + '" height="' + m.h + '">' +
        (isFilm ? '<span class="tile-play" aria-hidden="true"></span>' : '') +
        (p.media.length > 1 ? '<span class="tile-badge">' + p.media.length + (isFilm ? ' films' : ' images') + '</span>' : '') +
      '</div>' +
      '<div class="tile-meta"><b>' + esc(p.title) + '</b><span>' + esc(p.client) + '</span></div></button>';
  }).join('');

  // Filter chips: "All" plus every category that actually has work, with a count
  var counts = {}; rest.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  var filters = $('#filters');
  filters.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">All<sup>' + rest.length + '</sup></button>' +
    Object.keys(CATEGORIES).filter(function (k) { return counts[k]; }).map(function (k) {
      return '<button class="chip" type="button" data-f="' + k + '" aria-pressed="false">' + CATEGORIES[k] + '<sup>' + counts[k] + '</sup></button>';
    }).join('');
  filters.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip) return;
    var f = chip.dataset.f;
    $$('.chip', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    $$('.tile', grid).forEach(function (t, i) {
      var show = f === 'all' || t.dataset.cat === f;
      t.classList.toggle('hidden', !show);
      t.classList.remove('enter');
      if (show) { void t.offsetWidth; t.style.animationDelay = Math.min(i, 12) * 30 + 'ms'; t.classList.add('enter'); }
    });
  });

  // Films preview silently on hover (desktop only)
  if (matchMedia('(hover: hover)').matches && !reduceMotion) {
    $$('.tile', grid).forEach(function (t) {
      var p = byId[t.dataset.open], m = p.media[0]; if (!m.video) return;
      var v;
      t.addEventListener('mouseenter', function () {
        if (!v) { v = document.createElement('video'); v.src = m.video; v.muted = true; v.loop = true; v.playsInline = true; $('.tile-media', t).appendChild(v); }
        v.play().then(function () { t.classList.add('playing'); }).catch(function () {});
      });
      t.addEventListener('mouseleave', function () { if (v) { v.pause(); t.classList.remove('playing'); } });
    });
  }

  /* ---------- Viewer (lightbox): all images of one project ---------- */
  var viewer = $('#viewer'), stage = $('#viewerStage'), thumbs = $('#viewerThumbs');
  var current = null, idx = 0, opener = null;

  function show(i, dir) {
    var list = current.media;
    idx = (i + list.length) % list.length;
    var m = list[idx];
    stage.style.setProperty('--from', (dir || 0) * 40 + 'px');
    stage.innerHTML = m.video
      ? '<video src="' + m.video + '" poster="' + m.thumb + '" controls autoplay playsinline></video>'
      : '<img src="' + m.src + '" alt="' + esc(current.client + ', ' + current.title + ', image ' + (idx + 1)) + '">';
    $('#viewerCount').textContent = (idx + 1) + ' / ' + list.length;
    $$('button', thumbs).forEach(function (b, j) { b.setAttribute('aria-current', String(j === idx)); });
    var active = thumbs.children[idx]; if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    // Preload the next image so arrowing feels instant
    var next = list[(idx + 1) % list.length]; if (next && next.src) { var im = new Image(); im.src = next.src; }
  }
  function openViewer(id, trigger) {
    current = byId[id]; opener = trigger;
    $('#viewerTitle').textContent = current.title;
    $('#viewerClient').textContent = current.client;
    var many = current.media.length > 1;
    thumbs.hidden = !many; $$('.viewer-nav', viewer).forEach(function (b) { b.hidden = !many; });
    thumbs.innerHTML = current.media.map(function (m, j) { return '<button type="button" aria-label="Show item ' + (j + 1) + '"><img src="' + m.thumb + '" alt="" loading="lazy"></button>'; }).join('');
    viewer.hidden = false; viewer.classList.add('open'); document.body.classList.add('locked');
    if (heroVideo && !heroVideo.paused) heroVideo.pause();
    show(0, 0);
    $('.viewer-close').focus();
  }
  function closeViewer() {
    viewer.hidden = true; viewer.classList.remove('open'); stage.innerHTML = '';
    document.body.classList.remove('locked');
    if (!reduceMotion && reelBtn.textContent === 'Pause') heroVideo.play().catch(function () {});
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]'); if (t) openViewer(t.dataset.open, t);
  });
  $('.viewer-close').addEventListener('click', closeViewer);
  $('.viewer-nav.prev').addEventListener('click', function () { show(idx - 1, -1); });
  $('.viewer-nav.next').addEventListener('click', function () { show(idx + 1, 1); });
  thumbs.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var j = Array.prototype.indexOf.call(thumbs.children, b); show(j, j > idx ? 1 : -1);
  });
  document.addEventListener('keydown', function (e) {
    if (viewer.hidden) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowRight') show(idx + 1, 1);
    if (e.key === 'ArrowLeft') show(idx - 1, -1);
    if (e.key === 'Tab') { // keep keyboard focus inside the viewer
      var f = $$('button:not([hidden]), video', viewer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // Swipe left/right on phones
  var sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && current.media.length > 1) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  /* ---------- Disciplines: accordion, first one open ---------- */
  $('#discList').innerHTML = DISCIPLINES.map(function (d, i) {
    var n = String(i + 1).padStart(2, '0');
    return '<div class="disc"><button class="disc-btn" type="button" aria-expanded="' + (i === 0) + '" aria-controls="disc-' + i + '">' +
      '<span class="sec-no">' + n + '</span><span class="disc-name">' + esc(d.name) + '</span><span class="disc-sign" aria-hidden="true"></span></button>' +
      '<div class="disc-panel" id="disc-' + i + '"><div class="disc-inner"><p>' + esc(d.text) + '</p><ul class="tags">' +
      d.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div></div></div>';
  }).join('');
  $('#discList').addEventListener('click', function (e) {
    var b = e.target.closest('.disc-btn'); if (!b) return;
    b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true'));
  });

  /* ---------- Figures: count up once when they come into view ---------- */
  var figs = $('#figures');
  figs.innerHTML = FIGURES.map(function (f) { return '<div><dt data-v="' + f[0] + '">' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');
  var counted = false;
  new IntersectionObserver(function (en, obs) {
    if (!en[0].isIntersecting || counted) return; counted = true; obs.disconnect();
    if (reduceMotion) return;
    $$('dt', figs).forEach(function (dt) {
      var raw = dt.dataset.v, num = parseInt(raw, 10), suffix = raw.replace(/^\d+/, ''), pad = raw.match(/^0/) ? 2 : 0;
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        dt.textContent = String(Math.round(num * e)).padStart(pad, '0') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .4 }).observe(figs);

  /* ---------- Contact form: builds an email in the visitor's mail app ---------- */
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target.elements, err = $('#formError');
    var name = f.name.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
    var problem = !name ? 'Add your name so we know who to reply to.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Check the email address — it needs an @ and a domain.'
      : !msg ? 'Tell us a little about what you need.' : '';
    err.hidden = !problem; err.textContent = problem;
    if (problem) return;
    var body = msg + '\n\n— ' + name + (f.company.value.trim() ? ', ' + f.company.value.trim() : '') + '\n' + email;
    location.href = 'mailto:info@nthink.lk?subject=' + encodeURIComponent('New project enquiry from ' + name) + '&body=' + encodeURIComponent(body);
  });

  $('#year').textContent = new Date().getFullYear();
})();
