// Efect „ciocan”: la clic pe un card, cardul devine un zid de cărămizi care se prăbușește, apoi se deschide pagina lui.
// Se aplică pe carduri (.svc, .ref, .value, .steps li, rândurile din cardul de prețuri din hero).
// NU se aplică pe header, meniu și butoanele din banner.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CARDS = '.svc, .ref, .value, .steps li, .hero__card li';
  var DURATION = 520;   // ms până la navigare

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

    // 2. Cărămizi: zid cu rânduri decalate, în culori de teracotă, care zboară din punctul lovit
    var wall = document.createElement('div');
    wall.className = 'bricks';
    wall.style.left = r.left + 'px'; wall.style.top = r.top + 'px';
    wall.style.width = r.width + 'px'; wall.style.height = r.height + 'px';
    var COLORS = ['#b7542e', '#a94a28', '#c4663b', '#9e4426', '#bf5c33'];
    var rows = Math.max(3, Math.round(r.height / 30)), bh = r.height / rows;
    var bw = Math.min(bh * 2.3, r.width / 2), gap = 2;
    var bricks = [];
    for (var j = 0; j < rows; j++) {
      var offset = (j % 2) ? bw / 2 : 0;
      for (var bx = -offset; bx < r.width; bx += bw) {
        var left = Math.max(0, bx), right = Math.min(r.width, bx + bw);
        if (right - left < 6) continue;
        var el = document.createElement('div');
        el.className = 'brick';
        el.style.left = left + 'px'; el.style.top = (j * bh) + 'px';
        el.style.width = (right - left - gap) + 'px'; el.style.height = (bh - gap) + 'px';
        el.style.setProperty('--brick', COLORS[Math.floor(Math.random() * COLORS.length)]);
        var bcx = r.left + (left + right) / 2, bcy = r.top + j * bh + bh / 2;
        var dist = Math.hypot(bcx - x, bcy - y) || 1;
        var force = Math.max(0.3, 1 - dist / Math.max(r.width, r.height));
        bricks.push({ el: el, delay: Math.min(140, dist / 4),
          dx: (bcx - x) / dist * rnd(50, 140) * force + rnd(-20, 20),
          dy: (bcy - y) / dist * rnd(20, 70) * force + rnd(90, 220),
          rot: rnd(-70, 70) * force });
        wall.appendChild(el);
      }
    }
    document.body.appendChild(wall); made.push(wall);
    card.classList.add('is-breaking');

    // Zidul apare pe loc, apoi cărămizile zboară – cele de lângă lovitură primele
    void wall.offsetWidth;
    setTimeout(function () {
      bricks.forEach(function (b) {
        b.el.style.transitionDelay = Math.round(b.delay) + 'ms';
        b.el.style.transform = 'translate(' + b.dx + 'px,' + b.dy + 'px) rotate(' + b.rot + 'deg)';
        b.el.style.opacity = '0';
      });
      svg.style.opacity = '0';
    }, 40);

    setTimeout(done, DURATION);
    setTimeout(function () {
      made.forEach(function (el) { el.parentNode && el.parentNode.removeChild(el); });
      card.classList.remove('is-breaking');
    }, DURATION + 500);
  }

  window.ANADRI_spargere = shatter;
})();
