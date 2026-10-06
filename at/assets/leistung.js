// Rechner auf einer Leistungsseite: eine Leistung, eine Fläche.
// Der Versand der Schätzung passiert im Kalkulator, mit dieser Leistung vorausgewählt.
(function () {
  var root = document.querySelector('[data-leistung]');
  if (!root) return;
  var s = (window.ANADRI_LEISTUNGEN || []).filter(function (x) { return x.id === root.getAttribute('data-leistung'); })[0];
  if (!s) return;

  var MARGIN = 0.10;
  var nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  function eur(v) { return nf.format(Math.round(v)) + ' €'; }
  function parseArea(value) {
    var n = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) && n > 0 ? Math.min(n, 100000) : 0;
  }
  function $(sel) { return root.querySelector(sel); }

  var input = $('[data-area]');
  input.placeholder = s.ph;

  function update() {
    var area = parseArea(input.value);
    var avg = (s.min + s.max) / 2;
    $('[data-empty]').hidden = area > 0;
    $('[data-result]').hidden = area === 0;
    if (area) {
      var total = area * avg;
      $('[data-total]').textContent = eur(total);
      $('[data-range]').textContent = eur(area * s.min) + ' – ' + eur(area * s.max);
      $('[data-margin]').textContent = eur(total * (1 - MARGIN)) + ' – ' + eur(total * (1 + MARGIN));
    }
    $('[data-cta]').href = '../../kalkulator/?service=' + encodeURIComponent(s.id) +
      (area ? '&flaeche=' + encodeURIComponent(String(area)) : '') + '#ergebnis';
  }

  input.addEventListener('input', update);
  update();
})();
