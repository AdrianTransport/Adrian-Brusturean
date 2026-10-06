// Startseite (at/index.html). Wird von tools/build-at.cjs mit den gemeinsamen Bausteinen aufgerufen.
// Inhalte: tools/startseite.json (Kundenstimmen, Warum ANADRI, Vertrauenszahlen).
const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M8.5 11h5M11 8.5v5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>'
};
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.7 5.8 21.2l1.4-7L2 9.4l7-.8z"/></svg>';
const FLAG = '<span class="ph-flag">Platzhalter</span>';

module.exports = function home({ r, LIST, REFS, START, HERO_VIDEO, ORTE, REGIONEN, esc, serviceCards, stepsList, ctaBand, refCard }) {
  const preview = ['innenrenovierung', 'fassade-waermedaemmung', 'dacharbeiten', 'fliesen-bodenbelag']
    .map(id => LIST.find(s => s.id === id)).filter(Boolean);
  const byId = Object.fromEntries(LIST.map(s => [s.id, s]));
  const initials = name => name.split(/\s+/).map(p => p[0]).join('').replace(/[^A-Za-zÄÖÜäöü]/g, '').slice(0, 2).toUpperCase();

  const trust = (START.vertrauen || []).map(v =>
    `<div${v.platzhalter ? ' class="is-ph"' : ''}><b>${esc(v.zahl)}</b><span>${esc(v.text)}</span>${v.platzhalter ? FLAG : ''}</div>`).join('');

  const why = (START.warum || []).map(w => `
        <article class="why${w.platzhalter ? ' is-ph' : ''}">
          <div class="why__icon">${ICONS[w.icon] || ICONS.award}</div>
          <h3>${esc(w.titel)}</h3>
          <p>${esc(w.text)}</p>${w.platzhalter ? FLAG : ''}
        </article>`).join('');

  const quotes = (START.kundenstimmen || []).map(k => {
    const n = Math.max(0, Math.min(5, k.sterne || 5));
    const svc = byId[k.leistung];
    return `
        <figure class="quote${k.platzhalter ? ' is-ph' : ''}">
          <div class="quote__stars" role="img" aria-label="${n} von 5 Sternen">${STAR.repeat(n)}</div>
          <blockquote><p>„${esc(k.zitat)}“</p></blockquote>
          <figcaption>
            <span class="quote__avatar" aria-hidden="true">${esc(initials(k.name))}</span>
            <span><b>${esc(k.name)}</b><small>${esc(k.ort)}${svc ? ` · <a href="${r}leistungen/${svc.id}/">${esc(svc.name)}</a>` : ''}</small></span>
          </figcaption>${k.platzhalter ? FLAG : ''}
        </figure>`;
  }).join('');

  const video = HERO_VIDEO ? `<video class="hero-video" autoplay muted loop playsinline preload="metadata"${HERO_VIDEO.poster ? ` poster="${r}${HERO_VIDEO.poster}"` : ''} aria-hidden="true" tabindex="-1"><source src="${r}${HERO_VIDEO.src}" type="video/mp4"></video>` : '';

  return `<section class="hero${HERO_VIDEO ? ' hero--video' : ''}" aria-labelledby="hero-title">${video}
    <div class="container hero__inner">
      <div class="hero__text">
        <span class="hero__eyebrow">Renovierung &amp; Ausbau in Österreich</span>
        <h1 id="hero-title">Renovieren mit klaren Preisen</h1>
        <p>Abbruch, Innenausbau, Fassade, Dach und mehr – neun Gewerke aus einer Hand. Berechnen Sie Ihre Kosten online und vereinbaren Sie eine kostenlose Besichtigung.</p>
        <div class="hero__btns">
          <a class="btn btn--red" href="${r}kalkulator/">Preis berechnen</a>
          <a class="btn btn--light" href="${r}leistungen/">Unsere Leistungen</a>
        </div>
      </div>
    </div>
  </section>

  ${trust ? `<section class="trust" aria-label="Zahlen und Fakten">
    <div class="container trust__grid trust__grid--numbers">${trust}</div>
  </section>` : ''}

  <section class="section" aria-labelledby="warum-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="warum-title">Warum ANADRI</h2>
          <p class="section-sub">Vier Gründe, warum Kunden uns ihre Wohnung oder ihr Haus anvertrauen.</p>
        </div>
        <a class="btn btn--ghost" href="${r}uber-uns/">Über uns</a>
      </div>
      <div class="why-grid">${why}
      </div>
    </div>
  </section>

  ${quotes ? `<section class="section--white" aria-labelledby="stimmen-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="stimmen-title">Das sagen unsere Kunden</h2>
          <p class="section-sub">Stimmen zu abgeschlossenen Projekten in Österreich.</p>
        </div>
        <a class="btn btn--ghost" href="${r}referenzen/">Referenzen ansehen</a>
      </div>
      <div class="quotes">${quotes}
      </div>
    </div>
  </section>` : ''}

  <section class="section" aria-labelledby="ablauf-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="ablauf-title">So einfach geht's</h2>
          <p class="section-sub">Von der Online-Schätzung bis zur Übergabe in vier Schritten.</p>
        </div>
        <a class="btn btn--ghost" href="${r}ablauf/">Ablauf &amp; FAQ</a>
      </div>
      ${stepsList()}
    </div>
  </section>

  ${REFS.length ? `<section class="section--white" aria-labelledby="ref-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="ref-title">Referenzen</h2>
          <p class="section-sub">Ausgeführte Projekte mit Ort, Umfang und Leistungen.</p>
        </div>
        <a class="btn btn--ghost" href="${r}referenzen/">Alle Referenzen</a>
      </div>
      <div class="refs">${REFS.slice(0, 3).map((ref, i) => refCard(r, ref, i, 'h3')).join('')}
      </div>
    </div>
  </section>` : ''}

  ${ORTE ? `<section class="section" aria-labelledby="regionen-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="regionen-title">Wo wir arbeiten</h2>
          <p class="section-sub">Alle 23 Wiener Bezirke, das Wiener Umland und das Burgenland bis zur ungarischen Grenze – Besichtigung überall kostenlos.</p>
        </div>
        <a class="btn btn--ghost" href="${r}regionen/">Alle Orte</a>
      </div>
      <div class="zone-grid zone-grid--3">${Object.keys(REGIONEN).map(rk => { const list = ORTE.filter(o => o.region === rk); return `
        <div class="zone-col">
          <h3><a href="${r}regionen/${rk}/">${esc(REGIONEN[rk].name)}</a></h3>
          <ul class="chips">${list.slice(0, 10).map(o => `<li><a href="${r}regionen/${rk}/${o.slug}/">${esc(o.kurz || o.name)}</a></li>`).join('')}${list.length > 10 ? `<li><a class="chips__more" href="${r}regionen/${rk}/">+ ${list.length - 10} weitere</a></li>` : ''}</ul>
        </div>`; }).join('')}
      </div>
    </div>
  </section>` : ''}

  <div class="container">
    ${ctaBand(r)}
  </div>`;
};
