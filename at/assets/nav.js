// Mobiles Menü und Rückkehr nach dem Formularversand (FormSubmit).
(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (header && btn) {
    function setOpen(open) {
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.menu-btn__text').textContent = open ? 'Schließen' : 'Menü';
    }
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) setOpen(false);
    });
    header.querySelectorAll('.main-nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  var params = new URLSearchParams(location.search);
  document.querySelectorAll('form[data-formsubmit]').forEach(function (form) {
    var next = form.querySelector('input[name="_next"]');
    if (next && /^https?:$/.test(location.protocol)) {
      next.value = location.origin + location.pathname + '?gesendet=1' + (form.getAttribute('data-anchor') || '');
    }
  });
  if (params.get('gesendet')) {
    document.querySelectorAll('[data-sent]').forEach(function (el) { el.hidden = false; });
  }
})();
