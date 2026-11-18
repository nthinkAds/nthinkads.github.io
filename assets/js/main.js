/* =====================================================================
   N Think — page behaviour (plain JavaScript, no libraries)
   Sections: theme · nav · clock · hero · marquee · manifesto · featured
             disciplines · work grid · viewer · stats · contact form
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Fully stop a film and cancel its download (pausing alone keeps it downloading in the background)
  function unloadVideo(v) { if (!v) return; v.pause(); v.removeAttribute('src'); v.load(); if (v.parentNode) v.parentNode.removeChild(v); }
  // If a film freezes while playing, nudge it the way a manual pause and play would
  function watchStalls(v) {
    var timer = null;
    function check() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!v.isConnected || v.paused || v.readyState >= 3) return;
        var t = v.currentTime;                       // still stuck after 2.5 s: reload from the same spot
        v.load(); v.currentTime = t; v.play().catch(function () {});
      }, 2500);
    }
    v.addEventListener('waiting', check);
    v.addEventListener('stalled', check);
    v.addEventListener('playing', function () { clearTimeout(timer); });
  }
  var root = document.documentElement;
  root.classList.add('js'); // lets CSS hide things that JS animates in

  /* ---------- Theme: follow the device, remember the visitor's choice ---------- */
  var toggle = $('.theme-toggle');
  function setTheme(t, save) {
    root.dataset.theme = t;
    toggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('nthink-theme', t); } catch (e) {} }
  }
  setTheme(root.dataset.theme, false);
  toggle.addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
  // Keep following the device (e.g. auto dark at sunset) until the visitor picks one
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var saved = null; try { saved = localStorage.getItem('nthink-theme'); } catch (err) {}
    if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ---------- Nav: hide on scroll down, theme-coloured pills after the hero, progress bar ---------- */
  var nav = $('.nav'), bar = $('.progress'), hero = $('#hero'), lastY = 0;
  function onScroll() {
    var y = window.scrollY, max = document.body.scrollHeight - innerHeight;
    nav.classList.toggle('past', y > hero.offsetHeight - 80);
    nav.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('locked'));
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Underline the menu link of the section on screen
  var navLinks = $$('[data-nav]');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('active', a.hash === '#' + en.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['featured', 'disciplines', 'studio', 'contact'].forEach(function (id) { spy.observe(document.getElementById(id)); });

  // Mobile menu
  var menuBtn = $('.menu-btn'), menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open;
    document.body.classList.toggle('locked', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Live Colombo clock in the centre pill ---------- */
  var clock = $('#clock');
  function tick() {
    clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 15000);

  /* ---------- Hero: the page-load sequence ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('loaded'); }); });

  /* ---------- Client marquee: names separated by ✦, doubled for a seamless loop ---------- */
  var names = CLIENTS.map(function (n) { return '<span>' + esc(n) + '</span><i aria-hidden="true">✦</i>'; }).join('');
  $('#clientTrack').innerHTML = names + '<span aria-hidden="true" style="display:contents">' + names + '</span>';

  /* ---------- Manifesto: words light up as it scrolls past (keeps the italic accent) ---------- */
  var st = $('#manifestoText');
  Array.prototype.slice.call(st.childNodes).forEach(function (node) {
    if (node.nodeType === 3) { // plain text: wrap each word
      var frag = document.createElement('span'); frag.style.display = 'contents';
      frag.innerHTML = node.textContent.split(/(\s+)/).map(function (w) { return /\S/.test(w) ? '<span class="w">' + esc(w) + '</span>' : w; }).join('');
      st.replaceChild(frag, node);
    } else { node.classList.add('w'); } // the <em> counts as one word
  });
  var words = $$('.w', st);
  function lightWords() {
    var r = st.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .3)));
    var n = reduceMotion ? words.length : Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }
  addEventListener('scroll', lightWords, { passive: true }); lightWords();

  /* ---------- Featured projects: three cards ---------- */
  var byId = {}; PROJECTS.forEach(function (p) { byId[p.id] = p; });
  $('#featuredList').innerHTML = PROJECTS.filter(function (p) { return p.featured; }).map(function (p, i) {
    return '<button class="fcard" type="button" data-open="' + p.id + '">' +
      '<div class="fcard-media"><img src="' + p.media[0].src + '" alt="' + esc(p.client + ', ' + p.title) + '" loading="lazy"></div>' +
      '<div class="fcard-row"><h3 class="fcard-title">' + esc(p.title) + '</h3><span class="fcard-idx">0' + (i + 1) + '</span></div>' +
      '<div class="fcard-meta">' + esc(p.client) + '<span class="dot">✦</span>' + esc(CATEGORIES[p.cat]) + '</div></button>';
  }).join('');

  /* ---------- Disciplines: a row of cards moved with the arrow buttons ---------- */
  var track = $('#discStack'), discBar = $('#discBar'), discCount = $('#discCount');
  track.innerHTML = DISCIPLINES.map(function (d, i) {
    var n = String(i + 1).padStart(2, '0');
    return '<article class="scard">' +
      '<div class="scard-body"><div class="scard-top"><span><b>( ' + n + ' )</b></span><span>Discipline</span></div>' +
      '<h3>' + esc(d.name) + '</h3><p>' + esc(d.text) + '</p>' +
      '<ul class="tags">' + d.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="scard-img"><img src="' + d.img + '" alt="" loading="lazy"></div></article>';
  }).join('');
  var total = DISCIPLINES.length, prevBtn = $('.harrow.prev'), nextBtn = $('.harrow.next');
  function cardStep() { var c = track.firstElementChild; return c ? c.offsetWidth + 22 : track.clientWidth; } // one card + gap
  function updateDisc() {
    var max = track.scrollWidth - track.clientWidth;
    var cur = Math.min(total, Math.round(track.scrollLeft / cardStep()) + 1);
    if (track.scrollLeft >= max - 4) cur = total;               // at the end, show the last number
    discCount.textContent = String(cur).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    discBar.style.width = (cur / total * 100) + '%';
    prevBtn.disabled = track.scrollLeft <= 4;                    // fade the arrow that can't go further
    nextBtn.disabled = track.scrollLeft >= max - 4;
  }
  prevBtn.addEventListener('click', function () { track.scrollBy({ left: -cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
  nextBtn.addEventListener('click', function () { track.scrollBy({ left: cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
  track.addEventListener('scroll', updateDisc, { passive: true });
  // Ignore sideways wheel/trackpad swipes over the cards; normal up/down page scrolling still works
  track.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) e.preventDefault(); }, { passive: false });
  addEventListener('resize', updateDisc);
  updateDisc();

  /* ---------- Selected work: masonry grid, films spread between stills ---------- */
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
      '</div><span class="tile-title">' + esc(p.title) + '</span>' +
      '<span class="tile-meta">' + esc(p.client) + '<span class="dot">✦</span>' + esc(CATEGORIES[p.cat]) + '</span></button>';
  }).join('');
  $('#workCount').textContent = rest.length + ' projects';

  // Filter chips: "All" plus each category that has work
  var counts = {}; rest.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  var filters = $('#filters');
  filters.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">All<sup>' + rest.length + '</sup></button>' +
    Object.keys(CATEGORIES).filter(function (k) { return counts[k]; }).map(function (k) {
      return '<button class="chip" type="button" data-f="' + k + '" aria-pressed="false">' + CATEGORIES[k] + '<sup>' + counts[k] + '</sup></button>';
    }).join('');

  var mWrap = $('#masonryWrap'), expandBtn = $('#expandBtn');
  function setExpanded(open) {
    mWrap.classList.toggle('expanded', open);
    expandBtn.parentNode.hidden = open;
  }
  expandBtn.addEventListener('click', function () { setExpanded(true); });

  filters.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip) return;
    var f = chip.dataset.f, shown = 0;
    $$('.chip', filters).forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    $$('.tile', grid).forEach(function (t) {
      var show = f === 'all' || t.dataset.cat === f;
      t.classList.toggle('hidden', !show); t.classList.remove('enter');
      if (show) { void t.offsetWidth; t.style.animationDelay = Math.min(shown++, 12) * 30 + 'ms'; t.classList.add('enter'); }
    });
    // A single category is short, so show it in full; "All" goes back to the faded preview
    setExpanded(f !== 'all');
  });

  // Films preview silently on hover (desktop only); the preview is removed when the mouse leaves
  if (matchMedia('(hover: hover)').matches && !reduceMotion) {
    $$('.tile', grid).forEach(function (t) {
      var m = byId[t.dataset.open].media[0]; if (!m.video) return;
      var v = null, timer = null;
      t.addEventListener('mouseenter', function () {
        timer = setTimeout(function () {             // short delay so sweeping the mouse across doesn't start downloads
          v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = m.video;
          $('.tile-media', t).appendChild(v);
          v.play().then(function () { t.classList.add('playing'); }).catch(function () {});
        }, 250);
      });
      t.addEventListener('mouseleave', function () {
        clearTimeout(timer); t.classList.remove('playing'); unloadVideo(v); v = null;
      });
    });
  }

  /* ---------- Viewer (lightbox): every image of one project ---------- */
  var viewer = $('#viewer'), stage = $('#viewerStage'), thumbs = $('#viewerThumbs');
  var current = null, idx = 0, opener = null;

  function show(i, dir) {
    var list = current.media;
    idx = (i + list.length) % list.length;
    var m = list[idx];
    stage.style.setProperty('--from', (dir || 0) * 40 + 'px');
    unloadVideo($('video', stage));                  // cancel the previous film's download first
    stage.innerHTML = m.video
      ? '<video src="' + m.video + '" poster="' + m.thumb + '" controls autoplay playsinline preload="auto"></video>'
      : '<img src="' + m.src + '" alt="' + esc(current.client + ', ' + current.title + ', image ' + (idx + 1)) + '">';
    var film = $('video', stage); if (film) watchStalls(film);
    $('#viewerCount').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    $$('button', thumbs).forEach(function (b, j) { b.setAttribute('aria-current', String(j === idx)); });
    var active = thumbs.children[idx]; if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    var next = list[(idx + 1) % list.length]; if (next && next.src) { var im = new Image(); im.src = next.src; } // preload the next one
  }
  function openViewer(id, trigger) {
    current = byId[id]; opener = trigger;
    $('#viewerTitle').textContent = current.title;
    $('#viewerClient').textContent = current.client + ' ✦ ' + CATEGORIES[current.cat];
    var many = current.media.length > 1;
    thumbs.hidden = !many; $$('.viewer-nav', viewer).forEach(function (b) { b.hidden = !many; });
    thumbs.innerHTML = current.media.map(function (m, j) { return '<button type="button" aria-label="Show item ' + (j + 1) + '"><img src="' + m.thumb + '" alt="" loading="lazy"></button>'; }).join('');
    $$('.tile-media video').forEach(unloadVideo); $$('.tile.playing').forEach(function (t) { t.classList.remove('playing'); });
    viewer.hidden = false; viewer.classList.add('open'); document.body.classList.add('locked');
    show(0, 0); $('.viewer-close').focus();
  }
  function closeViewer() {
    unloadVideo($('video', stage));
    viewer.hidden = true; viewer.classList.remove('open'); stage.innerHTML = '';
    document.body.classList.remove('locked');
    if (opener) opener.focus();
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-open]'); if (t) openViewer(t.dataset.open, t); });
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
  var sx = null; // swipe on phones
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && current.media.length > 1) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  /* ---------- Studio stats: count up once when visible ---------- */
  var figs = $('#figures');
  figs.innerHTML = FIGURES.map(function (f) {
    var num = f[0].replace(/[^\d]/g, ''), suf = f[0].replace(/^\d+/, '');
    return '<div><dt data-n="' + num + '" data-pad="' + (f[0][0] === '0' ? 2 : 0) + '"><span>' + num + '</span>' + (suf ? '<sup>' + suf + '</sup>' : '') + '</dt><dd>' + esc(f[1]) + '</dd></div>';
  }).join('');
  var counted = false;
  new IntersectionObserver(function (en, obs) {
    if (!en[0].isIntersecting || counted) return; counted = true; obs.disconnect();
    if (reduceMotion) return;
    $$('dt', figs).forEach(function (dt) {
      var n = +dt.dataset.n, pad = +dt.dataset.pad, out = $('span', dt), t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        out.textContent = String(Math.round(n * e)).padStart(pad, '0');
        if (p < 1) requestAnimationFrame(step);
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
