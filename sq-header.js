/* ============================================================
   JORDY'S CASUARINA — SITEWIDE HEADER + NAV + CART
   Squarespace 7.0 (Brine). Goes in:
     Settings → Advanced → Code Injection → FOOTER

   WHY THE FOOTER AND NOT A CODE BLOCK:
   /cart and /checkout are system pages and cannot host a Code
   Block. If the CSS hides Squarespace's header and ours only
   lives in per-page blocks, the cart page ends up with no header
   and no way back into the site. Footer injection runs on every
   page, so the header exists everywhere.

   WHAT IT DOES
   1. Hides Brine's chrome (.Header, .Mobile-bar, .Mobile-overlay).
   2. Draws our fixed header: burger, centred logo, Order, Cart.
   3. Mirrors the cart count Squarespace already maintains in
      .sqs-cart-quantity. We never call the cart API and never
      track state, so there is nothing to drift out of sync.
   4. Builds the overlay nav and hides whichever item points at
      the page you are on, renumbering the rest. One nav, correct
      on every page, no per-page editing.
   5. Sits below the announcement bar while that bar is in view,
      then rises to the top as it scrolls away.
   6. On the homepage only, starts transparent over the hero and
      turns solid on scroll. Everywhere else it is solid and the
      page content is offset to clear it.

   VERIFIED ON THE LIVE SITE 21 Aug 2026
     .Header             120px, static, in flow
     .sqs-announcement-bar-dropzone  36px, static
     .sqs-cart-quantity  live-updated by Squarespace
     body.homepage       present on the home page only
============================================================ */
(function () {
  'use strict';
  if (window.__jordysHeader) return;          // never double-init
  window.__jordysHeader = true;

  var LOGO = 'https://images.squarespace-cdn.com/content/v1/5ee715c4af5f2c14ccec67c1/1592207833018-G8H3X5S01GZ4XRCR5S3D/Jordy%27s_logo_orange.png?format=300w';

  /* ★LINKS — every destination on the site, in nav order.
     `match` is what marks an item as "the page you are on" so it
     can be hidden. Leave it undefined for offsite links. */
  var NAV = [
    { label: 'Home',       href: '/',                                                      match: '/' },
    { label: 'Menu',       href: '/menu',                                                  match: '/menu' },
    { label: 'Order',      href: 'https://www.meandu.app/jordys/pickup',                   ext: true },
    { label: 'Book',       href: 'https://bookings.nowbookit.com/?accountid=933ec4b6-ecbc-4f71-bb42-cd00e0176c00', ext: true },
    { label: 'Find us',    href: '/#j-where' },
    { label: 'Gift cards', href: 'https://app.gift-it.com.au/buy/jordyspizza',             ext: true },
    { label: 'Merch',      href: '/jordys-merch',                                          match: '/jordys-merch' },
    { label: 'Instagram',  href: 'https://www.instagram.com/jordys.casuarina/',            ext: true }
  ];

  var ORDER_URL = 'https://www.meandu.app/jordys/pickup';
  var EMAIL     = 'relax@jordyscasuarina.com';

  /* ---------------- styles ---------------- */
  var css = [
    /* hide Brine's chrome. Visually only — .sqs-cart-quantity must
       stay in the DOM because we read the count from it. */
    '.Header,.Header--top,.Header--bottom,.Mobile-bar,.Mobile-overlay{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;opacity:0!important;pointer-events:none!important}',

    '#jHead{--jp:#fff;--ji:#241B12;--jt:#C2724C;--jtD:#A2532F;--jtDD:#8A431F;',
    'position:fixed;left:0;right:0;top:var(--jTop,0px);z-index:9000;',
    'display:flex;align-items:center;justify-content:space-between;',
    'padding:14px clamp(14px,2.6vw,36px);',
    "font-family:'Jost','Clarika Geometric',Arial,sans-serif;",
    'transition:background .3s ease,box-shadow .3s ease,top .2s linear}',
    '#jHead.is-solid{background:var(--jp);box-shadow:0 1px 0 rgba(36,27,18,.14)}',
    '#jHead *{box-sizing:border-box}',
    '#jHead a{text-decoration:none;color:inherit}',
    '#jHead a:focus-visible,#jHead button:focus-visible{outline:3px solid var(--jt);outline-offset:3px;border-radius:6px}',

    '#jBurger{display:inline-flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;width:50px;height:50px;border:0;border-radius:10px;background:var(--jp);cursor:pointer;box-shadow:0 8px 24px rgba(36,27,18,.18);transition:transform .2s ease;flex:none}',
    '#jBurger:hover{transform:scale(1.06)}',
    '#jBurger span{display:block;height:2.5px;width:26px;background:var(--ji);border-radius:2px}',

    '#jLogo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);line-height:0}',
    '#jLogo img{height:44px;width:auto;transition:height .3s ease,transform .25s ease}',
    '#jLogo:hover img{transform:rotate(-4deg) scale(1.05)}',

    '#jActions{display:flex;align-items:center;gap:10px;margin-left:auto}',
    '.jBtn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.6em;font-weight:600;text-transform:uppercase;letter-spacing:.14em;font-size:12.5px;padding:14px 22px;border-radius:6px;min-height:50px;white-space:nowrap;cursor:pointer;border:0;box-shadow:0 8px 24px rgba(36,27,18,.18);transition:background .22s ease,color .22s ease}',
    '.jBtn--terra{background:var(--jtD);color:#fff}',
    '.jBtn--terra:hover{background:var(--ji);color:#fff}',
    '.jBtn--ghost{background:var(--jp);color:var(--ji)}',
    '.jBtn--ghost:hover{background:var(--ji);color:#fff}',
    '#jCartN{min-width:21px;height:21px;padding:0 6px;border-radius:999px;background:var(--jtD);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;letter-spacing:0}',
    '.jBtn--ghost:hover #jCartN{background:var(--jt)}',
    '#jCart[data-empty="1"] #jCartN{display:none}',

    /* overlay nav */
    '#jOvl{position:fixed;inset:0;background:var(--jt,#C2724C);color:#fff;z-index:9500;display:flex;flex-direction:column;padding:24px;transform:translateY(-103%);transition:transform .38s cubic-bezier(.22,.9,.3,1);overflow:auto;',
    "font-family:'Jost','Clarika Geometric',Arial,sans-serif}",
    '#jOvl.open{transform:none}',
    '#jOvl a{text-decoration:none;color:inherit}',
    '#jOvlTop{display:flex;justify-content:space-between;align-items:center;margin-bottom:6vh}',
    '#jOvlTop img{height:44px;width:auto;filter:brightness(0) invert(1)}',
    '#jOvlClose{background:none;border:0;color:#fff;font-weight:600;letter-spacing:.2em;text-transform:uppercase;font-size:12px;cursor:pointer;padding:12px}',
    '#jOvlNav{display:flex;flex-direction:column}',
    "#jOvlNav a{font-family:'Fraunces',Georgia,serif;font-weight:660;font-variation-settings:'opsz' 144,'SOFT' 88,'WONK' 1;text-transform:uppercase;font-size:clamp(32px,7.4vw,54px);line-height:1.14;letter-spacing:-.01em;display:flex;align-items:baseline;gap:14px}",
    '#jOvlNav a i{font-style:normal;font-weight:500;font-size:11px;letter-spacing:.24em;opacity:.75;',
    "font-family:'Jost',Arial,sans-serif}",
    '#jOvlSub{margin-top:auto;padding-top:4vh;display:flex;flex-direction:column;gap:12px}',
    '#jOvlSub a{font-weight:500;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:rgba(255,255,255,.85)}',

    /* content offset. Brine's .Header was 120px and in flow, so
       hiding it pulls everything up; we put back our own height.
       The homepage opts out so the hero runs under the header. */
    'body:not(.homepage) .Site-inner{padding-top:var(--jH,78px)}',

    '@media (prefers-reduced-motion:reduce){#jHead,#jOvl,#jBurger,.jBtn,#jLogo img{transition:none}}'
  ].join('');

  var style = document.createElement('style');
  style.id = 'jHeadCSS';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  /* ---------------- markup ---------------- */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  var head = el('div', { id: 'jHead' });
  head.appendChild(el('button', {
    id: 'jBurger', type: 'button', 'aria-label': 'Open menu',
    'aria-expanded': 'false', 'aria-controls': 'jOvl'
  }, '<span></span><span></span><span></span>'));
  head.appendChild(el('a', { id: 'jLogo', href: '/', 'aria-label': "Jordy's Casuarina, home" },
    '<img src="' + LOGO + '" alt="Jordy\'s" width="120" height="85">'));

  var actions = el('div', { id: 'jActions' });
  actions.appendChild(el('a', { class: 'jBtn jBtn--terra', id: 'jOrder', href: ORDER_URL }, 'Order'));
  actions.appendChild(el('a', {
    class: 'jBtn jBtn--ghost', id: 'jCart', href: '/cart',
    'data-empty': '1', 'aria-label': 'Cart'
  }, 'Cart <span id="jCartN">0</span>'));
  head.appendChild(actions);
  document.body.appendChild(head);

  /* overlay */
  var ovl = el('div', { id: 'jOvl', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menu' });
  var top = el('div', { id: 'jOvlTop' },
    '<img src="' + LOGO + '" alt="Jordy\'s">' +
    '<button id="jOvlClose" type="button">Close &#10005;</button>');
  ovl.appendChild(top);

  var path = location.pathname.replace(/\/+$/, '') || '/';
  var nav = el('nav', { id: 'jOvlNav', 'aria-label': 'Site' });
  var n = 0;
  NAV.forEach(function (item) {
    // hide the item that points at the page we are on
    if (item.match && item.match.replace(/\/+$/, '') === (path === '/' ? '/' : path)) return;
    if (item.match === '/' && path === '/') return;
    n++;
    var a = el('a', { href: item.href }, item.label +
      ' <i>' + (n < 10 ? '0' + n : n) + '</i>');
    if (item.ext) { a.target = '_blank'; a.rel = 'noopener'; }
    nav.appendChild(a);
  });
  ovl.appendChild(nav);
  ovl.appendChild(el('div', { id: 'jOvlSub' },
    '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>'));
  document.body.appendChild(ovl);

  /* ---------------- behaviour ---------------- */
  var burger = document.getElementById('jBurger');
  var closeB = document.getElementById('jOvlClose');

  function setMenu(open) {
    ovl.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(true); });
  closeB.addEventListener('click', function () { setMenu(false); });
  ovl.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* --- cart: mirror the count Squarespace maintains ---
     We read .sqs-cart-quantity rather than calling the cart API,
     so there is no auth, no polling and no state of our own that
     can drift. If Squarespace changes how the cart updates, this
     keeps working because we are reading their result. */
  var cart = document.getElementById('jCart');
  var cartN = document.getElementById('jCartN');
  var src = document.querySelector('.sqs-cart-quantity');

  function syncCart() {
    if (!src) return;
    var v = (src.textContent || '').trim().replace(/[^\d]/g, '');
    cartN.textContent = v || '0';
    cart.setAttribute('data-empty', (!v || v === '0') ? '1' : '0');
  }
  if (src) {
    syncCart();
    try {
      new MutationObserver(syncCart).observe(src, {
        childList: true, characterData: true, subtree: true
      });
    } catch (e) { /* observer unsupported: the load-time value still shows */ }
  }

  /* --- position under the announcement bar while it is in view ---
     The bar is static (36px, in flow), so it scrolls away. Our
     fixed header follows it down and then sits at the top. */
  var bar = document.querySelector('.sqs-announcement-bar-dropzone');
  var isHome = document.body.classList.contains('homepage');

  function frame() {
    var t = 0;
    if (bar) {
      var r = bar.getBoundingClientRect();
      t = Math.max(0, r.bottom);
    }
    head.style.setProperty('--jTop', t + 'px');
    var y = window.pageYOffset || document.documentElement.scrollTop;
    head.classList.toggle('is-solid', !isHome || y > 40);
    document.documentElement.style.setProperty('--jH', Math.round(head.offsetHeight + t) + 'px');
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();
  // the logo image can change the header height once it loads
  var lg = head.querySelector('#jLogo img');
  if (lg && !lg.complete) lg.addEventListener('load', frame);
})();
