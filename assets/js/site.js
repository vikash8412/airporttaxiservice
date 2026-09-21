/* Shared site helpers: header/footer injection, posts API */
(function () {
  var C = window.ATS;

  /* ---------- header + footer ---------- */
  function nav(active) {
    return (
      '<div class="ats-top"><div class="container container-tight d-flex flex-wrap justify-content-between py-1">' +
        '<span><a href="mailto:' + C.email + '" style="white-space:nowrap"><i class="bi bi-envelope"></i> ' + C.email + '</a></span>' +
        '<span class="d-flex align-items-center gap-2">' +
          '<a href="tel:' + C.phone + '" style="white-space:nowrap"><i class="bi bi-telephone"></i> ' + C.phoneDisplay + '</a>' +
          '<span>·</span>' +
          '<a href="https://wa.me/' + C.whatsapp + '" style="white-space:nowrap"><i class="bi bi-whatsapp"></i> WhatsApp</a>' +
        '</span>' +
      '</div></div>' +
      '<nav class="navbar navbar-expand-lg"><div class="container container-tight">' +
        '<a class="navbar-brand" href="/">Airport<span>Taxi</span>Service</a>' +
        '<button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button>' +
        '<div class="collapse navbar-collapse" id="nav"><ul class="navbar-nav ms-auto align-items-lg-center">' +
          link('/', 'Home', active) +
          '<li class="nav-item dropdown">' +
            '<a class="nav-link dropdown-toggle' + (isAny(active, ['airport','airport-pickup','airport-drop','airport-round-trip']) ? ' active' : '') + '" href="airport" data-bs-toggle="dropdown">Airport Taxi</a>' +
            '<ul class="dropdown-menu">' +
              '<li><a class="dropdown-item" href="airport">Airport Taxi — Overview</a></li>' +
              '<li><hr class="dropdown-divider"></li>' +
              '<li><a class="dropdown-item" href="airport-pickup">Airport Pickup</a></li>' +
              '<li><a class="dropdown-item" href="airport-drop">Airport Drop</a></li>' +
              '<li><a class="dropdown-item" href="airport-round-trip">Airport Round Trip</a></li>' +
            '</ul>' +
          '</li>' +
          '<li class="nav-item dropdown">' +
            '<a class="nav-link dropdown-toggle' + (isAny(active, ['outstation','outstation-one-way','outstation-round-trip']) ? ' active' : '') + '" href="outstation" data-bs-toggle="dropdown">Outstation</a>' +
            '<ul class="dropdown-menu">' +
              '<li><a class="dropdown-item" href="outstation">Outstation — Overview</a></li>' +
              '<li><hr class="dropdown-divider"></li>' +
              '<li><a class="dropdown-item" href="outstation-one-way">One-Way</a></li>' +
              '<li><a class="dropdown-item" href="outstation-round-trip">Round Trip</a></li>' +
            '</ul>' +
          '</li>' +
          link('tour-packages', 'Tour Packages', active) +
          link('blog', 'Routes & Guides', active) +
          link('contact', 'Contact', active) +
          '<li class="nav-item ms-lg-2 mt-2 mt-lg-0"><a class="btn btn-gold btn-sm" href="tel:' + C.phone + '"><i class="bi bi-telephone-fill"></i> Call to Book</a></li>' +
        '</ul></div>' +
      '</div></nav>'
    );
  }
  // Normalise data-nav / pathname to a bare slug: "/airport-pickup.html" -> "airport-pickup", "/" -> "home".
  function slug(active) {
    var a = String(active || '').replace(/^.*\//, '').replace(/\.html$/, '');
    return (a === '' || a === 'index') ? 'home' : a;
  }
  function isAny(active, slugs) {
    return slugs.indexOf(slug(active)) !== -1;
  }
  // href is a clean URL ("/", "contact", ...); mark it active when it matches the current page.
  function link(href, label, active) {
    var target = (href === '/') ? 'home' : href.replace(/^\//, '');
    var is = (slug(active) === target) ? ' active' : '';
    return '<li class="nav-item"><a class="nav-link' + is + '" href="' + href + '">' + label + '</a></li>';
  }

  function foot() {
    var y = new Date().getFullYear();
    return (
      '<footer class="ats-foot"><div class="container container-tight"><div class="row g-4">' +
        '<div class="col-lg-4"><h6>Airport Taxi Service</h6>' +
          '<p>Reliable Bangalore airport pickups, drops and outstation cabs. Transparent fares, 24/7 booking support, professional drivers.</p>' +
          '<p><a href="tel:' + C.phone + '" style="white-space:nowrap;display:inline-flex;align-items:center;gap:.4rem"><i class="bi bi-telephone"></i> ' + C.phoneDisplay + '</a></p></div>' +
        '<div class="col-6 col-lg-3"><h6>Airport Taxi</h6>' +
          '<a href="airport-pickup">Airport Pickup</a><a href="airport-drop">Airport Drop</a>' +
          '<a href="airport-round-trip">Airport Round Trip</a></div>' +
        '<div class="col-6 col-lg-2"><h6>More Services</h6>' +
          '<a href="outstation-one-way">Outstation One-Way</a><a href="outstation-round-trip">Outstation Round Trip</a>' +
          '<a href="tour-packages">Tour Packages</a></div>' +
        '<div class="col-6 col-lg-3"><h6>Company</h6>' +
          '<a href="blog">Routes &amp; Guides</a><a href="contact">Contact</a>' +
          '<a href="https://nammataxi.com" target="_blank" rel="noopener">Powered by NammaTaxi</a></div>' +
        '<div class="col-lg-3"><h6>Book Now</h6>' +
          '<p>Use the AI assistant (bottom of the page) for live fares, or call us.</p>' +
          '<a class="btn btn-gold btn-sm" href="tel:' + C.phone + '">Call to Book</a></div>' +
      '</div><div class="fine">&copy; ' + y + ' Airport Taxi Service. All rights reserved. &nbsp;·&nbsp; ' +
        '<a href="https://nammataxi.com/privacy-policy" target="_blank" rel="noopener" style="display:inline">Privacy</a> &nbsp;·&nbsp; ' +
        '<a href="https://nammataxi.com/terms-and-conditions" target="_blank" rel="noopener" style="display:inline">Terms</a>' +
      '</div></div></footer>'
    );
  }

  function mount() {
    var active = document.body.getAttribute('data-nav') || location.pathname;
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = nav(active);
    if (f) f.innerHTML = foot();
  }

  /* ---------- posts API ---------- */
  var api = {
    list: function (params) {
      var q = new URLSearchParams(Object.assign({ website: C.postsWebsite }, params || {}));
      return fetch(C.apiBase + '/api/posts?' + q).then(function (r) { return r.json(); });
    },
    get: function (slug) {
      var q = new URLSearchParams({ website: C.postsWebsite });
      return fetch(C.apiBase + '/api/posts/' + encodeURIComponent(slug) + '?' + q).then(function (r) {
        if (!r.ok) throw new Error('not found');
        return r.json();
      });
    }
  };

  function postCard(p) {
    var img = p.banner_image
      ? '<div class="img" style="background-image:url(' + p.banner_image + ')"></div>'
      : '<div class="img"></div>';
    var from = p.price_start_from ? '<span class="from">from ₹' + p.price_start_from + '</span>' : '';
    return (
      '<a class="route-card" href="post?slug=' + encodeURIComponent(p.page_slug) + '">' +
        img +
        '<div class="body">' + from +
          '<h6>' + escapeHtml(p.title) + '</h6>' +
          (p.excerpt ? '<div class="ex">' + escapeHtml(p.excerpt) + '</div>' : '') +
        '</div>' +
      '</a>'
    );
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }

  /* ---------- AI booking assistant ---------- */
  // Open the embedded chatbot; retry briefly in case its script hasn't finished loading.
  function bookNow(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var tries = 0;
    (function open() {
      var b = document.querySelector('#nt-chatbot-embed');
      var l = b && b.shadowRoot && b.shadowRoot.querySelector('.launcher');
      if (l) { l.click(); return; }
      if (tries++ < 20) setTimeout(open, 250);
    })();
  }
  // Any element with [data-book-now] opens the assistant.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-book-now]');
    if (t) bookNow(e);
  });

  window.ATSsite = { mount: mount, api: api, postCard: postCard, escapeHtml: escapeHtml, bookNow: bookNow };
  // Back-compat alias used by inline onclick handlers across pages.
  window.ATSopenChat = bookNow;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
