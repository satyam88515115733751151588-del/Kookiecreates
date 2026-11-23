/* Kalka Digital — header tone + account menu.
   Sets data-tone="dark" (white text) when the header sits over a dark background/photo,
   "light" (black text) over a light one. */
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  // ---- Account menu (injected so every page gets it) ----
  const controls = nav.querySelector('.navbar-controls');
  if (controls && !controls.querySelector('.nav-account')) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-account';
    wrap.innerHTML =
      '<button class="nav-account-btn" aria-label="Account options" aria-expanded="false">' +
      '<span class="material-symbols-outlined" style="font-size:1.35rem">person</span></button>' +
      '<div class="nav-account-menu">' +
      '<small>Account</small>' +
      '<a href="admin.html">Studio login</a>' +
      '<a href="shop/index.html">Shop</a>' +
      '<a href="contact.html">Contact us</a>' +
      '<a href="https://maps.app.goo.gl/UT1yKP69UiYti4FJ9" target="_blank" rel="noopener">Find the studio</a>' +
      '<a href="https://www.instagram.com/kalka.studio1999/" target="_blank" rel="noopener">Instagram</a>' +
      '</div>';
    controls.appendChild(wrap);
    const btn = wrap.querySelector('.nav-account-btn');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) wrap.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') wrap.classList.remove('open'); });
  }

  // ---- Tone detection ----
  const isDarkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark';
  function lum(cs) {
    const m = cs.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(parseFloat);
    const a = p.length > 3 ? p[3] : 1;
    if (a < 0.5) return null;                       // transparent: look further down the stack
    return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
  }
  function detect() {
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (overlay && overlay.classList.contains('open')) return isDarkTheme() ? 'dark' : 'light';
    const x = Math.round(window.innerWidth / 2), y = Math.round(nav.offsetHeight / 2);
    const els = document.elementsFromPoint(x, y).filter(el => !nav.contains(el));
    for (const el of els) {
      const hint = el.closest('[data-nav]');
      if (hint) return hint.getAttribute('data-nav');
      if (/^(IMG|VIDEO|IFRAME|CANVAS)$/.test(el.tagName)) return 'dark';
      const cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.indexOf('url(') > -1) return 'dark';
      const l = lum(cs.backgroundColor);
      if (l !== null) return l < 0.5 ? 'dark' : 'light';
    }
    return isDarkTheme() ? 'dark' : 'light';
  }
  let raf = 0;
  function update() {
    raf = 0;
    const t = detect();
    if (nav.getAttribute('data-tone') !== t) nav.setAttribute('data-tone', t);
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  document.addEventListener('click', () => setTimeout(update, 60));   // theme toggle / menu open-close
  setInterval(update, 500);                                           // hero slider changes the backdrop
  update();
})();
