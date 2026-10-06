// Mobiles Menü und Rückkehr nach dem Formularversand (FormSubmit).
(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (header && btn) {
    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.menu-btn__text').textContent = open ? 'Închide' : 'Meniu';
    }
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) setOpen(false);
    });
    header.querySelectorAll('.main-nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  // Karte erst nach Klick laden (keine Datenübertragung an OpenStreetMap ohne Zustimmung)
  document.querySelectorAll('[data-map]').forEach(function (map) {
    var btn = map.querySelector('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = map.getAttribute('data-src');
      frame.title = map.getAttribute('data-title') || 'Hartă';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer';
      map.innerHTML = '';
      map.appendChild(frame);
      map.classList.add('is-loaded');
    });
  });

  var params = new URLSearchParams(location.search);
  document.querySelectorAll('form[data-formsubmit]').forEach(function (form) {
    var next = form.querySelector('input[name="_next"]');
    if (next && /^https?:$/.test(location.protocol)) {
      next.value = location.origin + location.pathname + '?trimis=1' + (form.getAttribute('data-anchor') || '');
    }
  });
  if (params.get('trimis')) {
    document.querySelectorAll('[data-sent]').forEach(function (el) { el.hidden = false; });
  }
})();
