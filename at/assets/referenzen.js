// Filter der Referenzen nach Leistung.
(function () {
  var buttons = document.querySelectorAll('.filter');
  var refs = document.querySelectorAll('.ref');
  var empty = document.getElementById('refs-empty');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-filter');
      var shown = 0;
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      refs.forEach(function (ref) {
        var match = !id || (' ' + ref.getAttribute('data-leistungen') + ' ').indexOf(' ' + id + ' ') !== -1;
        ref.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
})();
