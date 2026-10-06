// Efect „ciocan”: la clic pe un card, cardul se sparge în cioburi și apoi se deschide pagina lui.
// Se aplică pe carduri (.svc, .ref, .value, .steps li, rândurile din cardul de prețuri din hero).
// NU se aplică pe header, meniu și butoanele din banner.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CARDS = '.svc, .ref, .value, .steps li, .hero__card li';
  var DURATION = 420;   // ms până la navigare

  document.querySelectorAll(CARDS).forEach(function (card) {
    var link = card.matches('a[href]') ? card : card.querySelector('a[href]');
    if (!link) return;
    card.classList.add('breakable');
    card.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href]');
      if (a && !card.contains(a)) return;
      if (a && a.target === '_blank') return;
      var href = (a || link).getAttribute('href');
      e.preventDefault();
      if (reduce) { go(href); return; }
      shatter(card, e.clientX, e.clientY, function () { go(href); });
    });
  });

  function go(href) {
    // Ancoră pe aceeași pagină: derulare; altfel navigare normală
    if (href.charAt(0) === '#' || href.indexOf('./#') === 0) {
      var id = href.slice(href.indexOf('#') + 1);
      var el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', '#' + id); return; }
    }
    location.href = href;
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function shatter(card, x, y, done) {
    if (card.classList.contains('is-breaking')) return;
    var r = card.getBoundingClientRect();
    if (typeof x !== 'number' || !x) { x = r.left + r.width / 2; y = r.top + r.height / 2; }
    var made = [];

    // 1. Crăpături din punctul lovit
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'crack');
    svg.style.left = r.left + 'px'; svg.style.top = r.top + 'px';
    svg.setAttribute('width', r.width); svg.setAttribute('height', r.height);
    svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
    var cx = x - r.left, cy = y - r.top;
    for (var k = 0; k < 9; k++) {
      var ang = (k / 9) * Math.PI * 2 + rnd(-0.3, 0.3), len = rnd(40, Math.max(r.width, r.height) * 0.7);
      var mx = cx + Math.cos(ang) * len * 0.5 + rnd(-10, 10), my = cy + Math.sin(ang) * len * 0.5 + rnd(-10, 10);
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', 'M' + cx + ' ' + cy + ' L' + mx + ' ' + my + ' L' + (cx + Math.cos(ang) * len) + ' ' + (cy + Math.sin(ang) * len));
      svg.appendChild(p);
    }
    document.body.appendChild(svg); made.push(svg);

    // 2. Cioburi: grilă 4×3 cu colțuri deplasate aleator, fiecare o clonă decupată a cardului
    var cols = 4, rows = 3, pts = [];
    for (var i = 0; i <= cols; i++) {
      pts[i] = [];
      for (var j = 0; j <= rows; j++) {
        var px = i / cols * 100, py = j / rows * 100;
        if (i > 0 && i < cols) px += rnd(-9, 9);
        if (j > 0 && j < rows) py += rnd(-12, 12);
        pts[i][j] = [px, py];
      }
    }
    var shards = [];
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      var poly = [pts[i][j], pts[i + 1][j], pts[i + 1][j + 1], pts[i][j + 1]];
      var clone = card.cloneNode(true);
      clone.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      clone.className = card.className.replace(/\bbreakable\b/, '') + ' shard';
      clone.style.left = r.left + 'px'; clone.style.top = r.top + 'px';
      clone.style.width = r.width + 'px'; clone.style.height = r.height + 'px';
      clone.style.clipPath = 'polygon(' + poly.map(function (q) { return q[0] + '% ' + q[1] + '%'; }).join(',') + ')';
      var ccx = r.left + (poly[0][0] + poly[2][0]) / 200 * r.width, ccy = r.top + (poly[0][1] + poly[2][1]) / 200 * r.height;
      var dist = Math.hypot(ccx - x, ccy - y) || 1;
      var force = Math.max(0.35, 1 - dist / Math.max(r.width, r.height));
      shards.push({ el: clone, dx: (ccx - x) / dist * rnd(40, 110) * force + rnd(-15, 15), dy: (ccy - y) / dist * rnd(20, 60) * force + rnd(70, 160), rot: rnd(-45, 45) * force });
      document.body.appendChild(clone); made.push(clone);
    }
    card.classList.add('is-breaking');

    // Forțează așezarea cioburilor, apoi pornește animația
    void shards[0].el.offsetWidth;
    setTimeout(function () {
      shards.forEach(function (s) {
        s.el.style.transform = 'translate(' + s.dx + 'px,' + s.dy + 'px) rotate(' + s.rot + 'deg) scale(.92)';
        s.el.style.opacity = '0';
      });
      svg.style.opacity = '0';
    }, 30);

    setTimeout(done, DURATION);
    setTimeout(function () {
      made.forEach(function (el) { el.parentNode && el.parentNode.removeChild(el); });
      card.classList.remove('is-breaking');
    }, DURATION + 500);
  }

  window.ANADRI_spargere = shatter;
})();
