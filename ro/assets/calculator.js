// Calculator de preț (România): mai multe lucrări, suprafață pentru fiecare, total în lei cu marjă ±10 %,
// trimitere prin FormSubmit. Stadiile casei noi (grup 'casa') se exclud reciproc.
(function () {
  var SERVICES = window.ANADRI_SERVICII;
  var MARGIN = 0.10;

  var nf = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 });
  var nf2 = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });
  function lei(v) { return nf.format(Math.round(v)) + ' lei'; }
  function avg(s) { return (s.min + s.max) / 2; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parseArea(value) {
    var n = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) && n > 0 ? Math.min(n, 100000) : 0;
  }
  function $(id) { return document.getElementById(id); }

  var list = $('services');
  if (!list) return;
  list.innerHTML = SERVICES.map(function (s) {
    return '<div class="service" data-id="' + s.id + '"' + (s.grup ? ' data-grup="' + s.grup + '"' : '') + '>' +
      '<label class="service__head"><input type="checkbox" data-check>' +
        '<span class="service__name">' + esc(s.name) + '</span>' +
        '<span class="service__desc">' + esc(s.desc) + '</span>' +
        '<span class="service__price"><b>' + nf.format(s.min) + '–' + nf.format(s.max) + ' lei/m²</b> <small>· mediu ' + nf2.format(avg(s)) + ' lei/m²</small></span>' +
      '</label>' +
      '<div class="service__body" hidden>' +
        '<div class="field"><label for="area-' + s.id + '">Suprafață (m²) <small>· ' + esc(s.baza) + '</small></label>' +
        '<input id="area-' + s.id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="' + s.ph + '" data-area></div>' +
        '<div class="subtotal" data-subtotal>Introdu suprafața</div>' +
      '</div>' +
    '</div>';
  }).join('');

  function rowFor(id) { return list.querySelector('.service[data-id="' + id + '"]'); }

  function setChecked(row, on) {
    row.querySelector('[data-check]').checked = on;
    row.classList.toggle('is-on', on);
    row.querySelector('.service__body').hidden = !on;
    if (!on) row.querySelector('[data-area]').value = '';
  }

  function calculate() {
    var selected = 0, lines = [], total = 0, low = 0, high = 0;

    SERVICES.forEach(function (s) {
      var row = rowFor(s.id);
      if (!row.querySelector('[data-check]').checked) return;
      selected++;
      var area = parseArea(row.querySelector('[data-area]').value);
      var sub = row.querySelector('[data-subtotal]');
      if (!area) { sub.textContent = 'Introdu suprafața'; return; }
      var value = area * avg(s);
      sub.innerHTML = 'Subtotal: <b>' + lei(value) + '</b>';
      total += value; low += area * s.min; high += area * s.max;
      lines.push({ s: s, area: area, value: value });
    });

    $('empty').textContent = selected
      ? 'Introdu suprafața (m²) pentru lucrările alese.'
      : 'Alege cel puțin o lucrare ca să vezi estimarea';
    var has = lines.length > 0;
    $('empty').hidden = has;
    $('result').hidden = !has;
    $('send').hidden = !has;
    $('mobile-bar').hidden = !has;
    document.body.classList.toggle('has-bar', has);
    if (!has) return;

    var range = lei(low) + ' – ' + lei(high);
    var margin = lei(total * (1 - MARGIN)) + ' – ' + lei(total * (1 + MARGIN));
    $('total').textContent = lei(total);
    $('bar-total').textContent = lei(total);
    $('range').textContent = range;
    $('margin').textContent = margin;
    $('breakdown').innerHTML = lines.map(function (l) {
      return '<li><span>' + esc(l.s.name) + ' · ' + nf2.format(l.area) + ' m²</span><span>' + lei(l.value) + '</span></li>';
    }).join('');

    var summary = lines.map(function (l) {
      return l.s.name + ': ' + nf2.format(l.area) + ' m² × mediu ' + nf2.format(avg(l.s)) + ' lei/m² = ' + lei(l.value);
    }).join('\n');
    $('f-lucrari').value = summary;
    $('f-total').value = lei(total);
    $('f-range').value = range;
    $('f-margin').value = margin;
    $('f-auto').value = 'Mulțumim pentru solicitare! Aceasta este estimarea ta orientativă (doar manoperă, fără materiale și TVA):\n\n' +
      summary + '\n\nPreț mediu: ' + lei(total) + '\nInterval: ' + range + '\nCu marjă de negociere (±10%): ' + margin +
      '\n\nTe contactăm în curând pentru o vizită gratuită la fața locului.\n\nANADRI CONSULTING RO SRL';
  }

  list.addEventListener('change', function (e) {
    if (!e.target.matches('[data-check]')) return;
    var row = e.target.closest('.service');
    var grup = row.getAttribute('data-grup');
    if (e.target.checked && grup) {
      list.querySelectorAll('.service[data-grup="' + grup + '"]').forEach(function (other) {
        if (other !== row && other.querySelector('[data-check]').checked) setChecked(other, false);
      });
    }
    setChecked(row, e.target.checked);
    if (e.target.checked) row.querySelector('[data-area]').focus();
    calculate();
  });
  list.addEventListener('input', function (e) {
    if (e.target.matches('[data-area]')) calculate();
  });

  // De pe pagina de start: ?serviciu=…&suprafata=…
  var params = new URLSearchParams(location.search);
  var pre = params.get('serviciu');
  if (pre && rowFor(pre)) {
    var row = rowFor(pre);
    setChecked(row, true);
    var area = parseArea(params.get('suprafata') || '');
    if (area) row.querySelector('[data-area]').value = nf2.format(area);
  }

  calculate();
})();
