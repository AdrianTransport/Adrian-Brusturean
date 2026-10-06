// Startseite (at/index.html). Wird von tools/build-at.cjs mit den gemeinsamen Bausteinen aufgerufen.
module.exports = function home({ r, LIST, REFS, esc, serviceCards, stepsList, ctaBand, refCard }) {
  const preview = ['innenrenovierung', 'fassade-waermedaemmung', 'dacharbeiten', 'fliesen-bodenbelag']
    .map(id => LIST.find(s => s.id === id)).filter(Boolean);

  return `<section class="hero" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <div class="hero__text">
        <span class="hero__eyebrow">Renovierung &amp; Ausbau in Österreich</span>
        <h1 id="hero-title">Renovieren mit klaren Preisen</h1>
        <p>Abbruch, Innenausbau, Fassade, Dach und mehr – neun Gewerke aus einer Hand. Berechnen Sie Ihre Kosten online und vereinbaren Sie eine kostenlose Besichtigung.</p>
        <div class="hero__btns">
          <a class="btn btn--red" href="${r}kalkulator/">Preis berechnen</a>
          <a class="btn btn--light" href="${r}kontakt/">Kostenlose Besichtigung</a>
        </div>
      </div>
      <aside class="hero__card" aria-label="Richtpreise pro m²">
        <div class="hero__card-head"><span>Richtpreise pro m²</span><span class="badge">Nur Arbeitsleistung</span></div>
        <ul>${preview.map(s => `
          <li><a href="${r}leistungen/${s.id}/"><span>${esc(s.name)}</span><b>${s.min}–${s.max} €</b></a></li>`).join('')}
        </ul>
        <a class="hero__card-more" href="${r}leistungen/">Alle 9 Leistungen →</a>
      </aside>
    </div>
  </section>

  <section class="trust" aria-label="Unsere Versprechen">
    <div class="container trust__grid">
      <div><b>Richtpreise online</b><span>Kosten sofort im Kalkulator sehen</span></div>
      <div><b>Kostenlose Besichtigung</b><span>Unverbindlich vor Ort</span></div>
      <div><b>Ein Ansprechpartner</b><span>Alle Gewerke koordiniert</span></div>
      <div><b>Schriftliches Angebot</b><span>Ohne versteckte Positionen</span></div>
    </div>
  </section>

  <section class="section" aria-labelledby="leistungen-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="leistungen-title">Unsere Leistungen</h2>
          <p class="section-sub">Jede Leistung mit Richtpreis pro m², genauer Beschreibung und eigenem Rechner.</p>
        </div>
        <a class="btn btn--ghost" href="${r}leistungen/">Alle Leistungen</a>
      </div>
      ${serviceCards(r)}
    </div>
  </section>

  <section class="section--white" aria-labelledby="ablauf-title">
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

  ${REFS.length ? `<section class="section" aria-labelledby="ref-title">
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

  <div class="container">
    ${ctaBand(r)}
  </div>`;
};
