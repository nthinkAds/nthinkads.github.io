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
  ['featured', 'films', 'disciplines', 'studio', 'contact'].forEach(function (id) { spy.observe(document.getElementById(id)); });

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

  /* ---------- Client marquee: each logo on a white card, doubled for a seamless loop ---------- */
  var logos = CLIENTS.map(function (c) {
    return '<span class="client"><img src="assets/clients/' + c[1] + '.webp" alt="' + esc(c[0]) + '" loading="lazy"></span>';
  }).join('');
  // The second copy is hidden from screen readers so each brand is only read out once
  $('#clientTrack').innerHTML = logos + '<span aria-hidden="true" style="display:contents">' + logos.replace(/alt="[^"]*"/g, 'alt=""') + '</span>';

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
      '<div class="scard-body"><div class="scard-top"><span><b>( ' + n + ' )</b></span><span>Service</span></div>' +
      '<h3>' + esc(d.name) + '</h3><p>' + esc(d.text) + '</p>' +
      '<ul class="tags">' + d.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="scard-img"><img src="' + d.img + '" alt="" loading="lazy"></div></article>';
  }).join('');
  /* Reusable sideways row with arrow buttons (used by Disciplines and Films).
     onMove(current, total) runs whenever the row moves, so a section can show its own counter. */
  function carousel(track, onMove) {
    var prev = $('.harrow.prev[data-for="' + track.id + '"]'), next = $('.harrow.next[data-for="' + track.id + '"]');
    function step() { var c = track.firstElementChild; return c ? c.offsetWidth + 22 : track.clientWidth; } // one card + gap
    function update() {
      var max = track.scrollWidth - track.clientWidth, total = track.children.length;
      var cur = Math.min(total, Math.round(track.scrollLeft / step()) + 1);
      if (track.scrollLeft >= max - 4) cur = total;             // at the end, show the last number
      prev.disabled = track.scrollLeft <= 4;                     // fade the arrow that can't go further
      next.disabled = track.scrollLeft >= max - 4;
      if (onMove) onMove(cur, total);
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    // Ignore sideways wheel/trackpad swipes over the cards; normal up/down page scrolling still works
    track.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) e.preventDefault(); }, { passive: false });
    addEventListener('resize', update);
    addEventListener('load', update);                            // images change the row width once loaded
    update();
  }
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  carousel(track, function (cur, total) {
    discCount.textContent = pad2(cur) + ' / ' + pad2(total);
    discBar.style.width = (cur / total * 100) + '%';
  });

  /* ---------- Films: every motion project as a big preview card in its own row ---------- */
  var filmList = PROJECTS.filter(function (p) { return p.cat === 'motion'; });
  var filmTrack = $('#filmTrack');
  filmTrack.innerHTML = filmList.map(function (p, i) {
    var m = p.media[0];
    return '<button class="film" type="button" data-open="' + p.id + '" style="--ratio:' + m.w + '/' + m.h + '">' +
      '<div class="tile-media film-media">' +
        '<img src="' + m.thumb + '" alt="' + esc(p.client + ', ' + p.title) + '" loading="lazy" width="' + m.w + '" height="' + m.h + '">' +
        '<span class="tile-play" aria-hidden="true"></span>' +
        (p.media.length > 1 ? '<span class="tile-badge">' + p.media.length + ' films</span>' : '') +
      '</div><span class="film-row"><span class="tile-title">' + esc(p.title) + '</span><span class="fcard-idx">' + pad2(i + 1) + '</span></span>' +
      '<span class="tile-meta">' + esc(p.client) + '</span></button>';
  }).join('');
  carousel(filmTrack, function (cur, total) { $('#filmCount').textContent = pad2(cur) + ' / ' + pad2(total); });

  /* ---------- Logos: equal tiles; clicking one opens the identities viewer at that logo ---------- */
  $('#logoGrid').innerHTML = LOGOS.map(function (l) {
    return '<button class="logo-tile" type="button" data-open="identities" data-index="' + l.index + '">' +
      '<span class="logo-box"><img src="' + l.img + '" alt="' + esc(l.name + ' logo') + '" loading="lazy"></span>' +
      '<span class="tile-title">' + esc(l.name) + '</span><span class="tile-meta">' + esc(l.sector) + '</span></button>';
  }).join('');
  $('#logoCount').textContent = pad2(LOGOS.length) + ' marks';

  /* ---------- Selected work: masonry grid of stills ---------- */
  // Films and logos have their own sections; featured work is shown here too so every category is complete
  var rest = PROJECTS.filter(function (p) { return p.cat !== 'motion' && p.cat !== 'identity'; });

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
    $$('.tile, .film').forEach(function (t) {
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
    if (m.cap) stage.insertAdjacentHTML('beforeend', '<p class="viewer-cap">' + esc(m.cap) + '</p>'); // optional caption, e.g. product → recipe
    var film = $('video', stage); if (film) watchStalls(film);
    $('#viewerCount').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    $$('button', thumbs).forEach(function (b, j) { b.setAttribute('aria-current', String(j === idx)); });
    var active = thumbs.children[idx]; if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    var next = list[(idx + 1) % list.length]; if (next && next.src) { var im = new Image(); im.src = next.src; } // preload the next one
  }
  function openViewer(id, trigger, start) {
    current = byId[id]; opener = trigger;
    $('#viewerTitle').textContent = current.title;
    $('#viewerClient').textContent = current.client + ' ✦ ' + CATEGORIES[current.cat];
    var many = current.media.length > 1;
    thumbs.hidden = !many; $$('.viewer-nav', viewer).forEach(function (b) { b.hidden = !many; });
    thumbs.innerHTML = current.media.map(function (m, j) { return '<button type="button" aria-label="Show item ' + (j + 1) + '"><img src="' + m.thumb + '" alt="" loading="lazy"></button>'; }).join('');
    $$('.tile-media video').forEach(unloadVideo); $$('.tile.playing').forEach(function (t) { t.classList.remove('playing'); });
    viewer.hidden = false; viewer.classList.add('open'); document.body.classList.add('locked');
    show(start || 0, 0); $('.viewer-close').focus();
  }
  function closeViewer() {
    unloadVideo($('video', stage));
    viewer.hidden = true; viewer.classList.remove('open'); stage.innerHTML = '';
    document.body.classList.remove('locked');
    if (opener) opener.focus();
  }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-open]'); if (t) openViewer(t.dataset.open, t, +(t.dataset.index || 0)); });
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

  /* ---------- Team: one portrait card per person ---------- */
  $('#teamGrid').innerHTML = TEAM.map(function (t) {
    var label = t.name ? t.name + ', ' + t.role : 'N Think ' + t.role;
    return '<figure class="member"><img src="' + t.img + '" alt="' + esc(label) + '" width="800" height="1000" loading="lazy">' +
      '<figcaption>' + (t.name ? '<span class="member-name">' + esc(t.name) + '</span>' : '') +
      '<span class="member-role">' + esc(t.role) + '</span></figcaption></figure>';
  }).join('');

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
    location.href = 'mailto:nthink925@gmail.com?subject=' + encodeURIComponent('New project enquiry from ' + name) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- Custom cursor: red dot + trailing ring, "View"/"Play" bubble over the work ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {   // real mouse only; phones keep normal touch
    var cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    root.classList.add('has-cursor');
    var mx = -100, my = -100, rx = mx, ry = my;
    var ease = reduceMotion ? 1 : 0.2;             // how quickly the ring catches up (1 = no trailing)
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      cur.classList.remove('is-away');
    }, { passive: true });
    (function loop() {                              // the ring glides after the dot
      rx += (mx - rx) * ease; ry += (my - ry) * ease;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();
    // Decide the cursor style from what's under the mouse
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var work = t.closest('.fcard, .tile, .film, .logo-tile');
      var text = t.closest('input, textarea, select');
      var link = t.closest('a, button, .chip, label');
      cur.classList.toggle('is-text', !!text);
      cur.classList.toggle('is-label', !!work && !text);
      cur.classList.toggle('is-link', !work && !text && !!link);
      if (work) label.textContent = work.querySelector('.tile-play') ? 'Play' : 'View';
    });
    addEventListener('mousedown', function () { cur.classList.add('is-down'); });
    addEventListener('mouseup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { cur.classList.add('is-away'); });
  }

  $('#year').textContent = new Date().getFullYear();
})();
