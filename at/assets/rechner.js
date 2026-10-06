// Preisrechner: mehrere Leistungen, Fläche je Leistung, Summe ±10 %, Versand per FormSubmit.
(function () {
  var SERVICES = window.ANADRI_LEISTUNGEN;
  var MARGIN = 0.10;

  var nf = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  var nf2 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
  function eur(v) { return nf.format(Math.round(v)) + ' €'; }
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
    return '<div class="service" data-id="' + s.id + '">' +
      '<label class="service__head"><input type="checkbox" data-check>' +
        '<span class="service__name">' + esc(s.name) + '</span>' +
        '<span class="service__desc">' + esc(s.desc) + '</span>' +
        '<span class="service__price"><b>' + s.min + '–' + s.max + ' €/m²</b> <small>· Ø ' + nf2.format(avg(s)) + ' €/m²</small></span>' +
      '</label>' +
      '<div class="service__body" hidden>' +
        '<div class="field"><label for="area-' + s.id + '">Fläche (m²) <small>· ' + esc(s.basis) + '</small></label>' +
        '<input id="area-' + s.id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="' + s.ph + '" data-area></div>' +
        '<div class="subtotal" data-subtotal>Fläche eingeben</div>' +
      '</div>' +
      '<div class="service__more"><a href="' + s.id + '/">Was ist enthalten? →</a></div>' +
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
      if (!area) { sub.textContent = 'Fläche eingeben'; return; }
      var value = area * avg(s);
      sub.innerHTML = 'Zwischensumme: <b>' + eur(value) + '</b>';
      total += value; low += area * s.min; high += area * s.max;
      lines.push({ s: s, area: area, value: value });
    });

    $('empty').textContent = selected
      ? 'Geben Sie die Fläche (m²) für die gewählten Leistungen ein.'
      : 'Wählen Sie mindestens eine Leistung aus, um eine Schätzung zu sehen';
    var has = lines.length > 0;
    $('empty').hidden = has;
    $('result').hidden = !has;
    $('send').hidden = !has;
    $('mobile-bar').hidden = !has;
    document.body.classList.toggle('has-bar', has);
    if (!has) return;

    var range = eur(low) + ' – ' + eur(high);
    var margin = eur(total * (1 - MARGIN)) + ' – ' + eur(total * (1 + MARGIN));
    $('total').textContent = eur(total);
    $('bar-total').textContent = eur(total);
    $('range').textContent = range;
    $('margin').textContent = margin;
    $('breakdown').innerHTML = lines.map(function (l) {
      return '<li><span>' + esc(l.s.name) + ' · ' + nf2.format(l.area) + ' m²</span><span>' + eur(l.value) + '</span></li>';
    }).join('');

    // Was per E-Mail an ANADRI geht – und als Kopie an den Kunden
    var summary = lines.map(function (l) {
      return l.s.name + ': ' + nf2.format(l.area) + ' m² × Ø ' + nf2.format(avg(l.s)) + ' €/m² = ' + eur(l.value);
    }).join('\n');
    $('f-leistungen').value = summary;
    $('f-total').value = eur(total);
    $('f-range').value = range;
    $('f-margin').value = margin;
    $('f-auto').value = 'Vielen Dank für Ihre Anfrage bei ANADRI! Hier ist Ihre unverbindliche Schätzung (nur Arbeitsleistung, Material nicht enthalten):\n\n' +
      summary + '\n\nMittelwert: ' + eur(total) + '\nSpannweite: ' + range + '\nMit Verhandlungsspielraum (±10%): ' + margin +
      '\n\nWir melden uns in Kürze für eine kostenlose Besichtigung.\n\nANADRI CONSULTING SRL';
  }

  list.addEventListener('change', function (e) {
    if (!e.target.matches('[data-check]')) return;
    var row = e.target.closest('.service');
    setChecked(row, e.target.checked);
    if (e.target.checked) row.querySelector('[data-area]').focus();
    calculate();
  });
  list.addEventListener('input', function (e) {
    if (e.target.matches('[data-area]')) calculate();
  });

  // Von einer Leistungsseite: ?leistung=…&flaeche=…
  var params = new URLSearchParams(location.search);
  var pre = params.get('leistung');
  if (pre && rowFor(pre)) {
    var row = rowFor(pre);
    setChecked(row, true);
    var area = parseArea(params.get('flaeche') || '');
    if (area) row.querySelector('[data-area]').value = nf2.format(area);
  }

  calculate();
})();
