// Baut alle Seiten der österreichischen Website (at/) mit gemeinsamem Header, Menü und Footer.
// Aufruf:  node tools/build-at.cjs
// Preise:      at/assets/leistungen.js
// Startseite:  tools/template/home.js
// Referenzen:  tools/referenzen.json  (Bilder nach at/referenzen/bilder/)
//
// Seiten:  /  ·  /kalkulator/  ·  /leistungen/  ·  /leistungen/<id>/  ·  /referenzen/
//          /ablauf/  ·  /uber-uns/  ·  /kontakt/  ·  /impressum/  ·  /datenschutz/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const home = require('./template/home.js');

// Karte auf der Kontaktseite (OpenStreetMap, lädt erst nach Klick).
// Sobald es eine Adresse in Österreich gibt: marker auf [Breite, Länge] setzen und bbox enger wählen.
const MAP = { bbox: [9.4, 46.3, 17.2, 49.1], marker: null, caption: 'Einsatzgebiet: Österreich' };

const ROOT = path.join(__dirname, '..');
const AT = path.join(ROOT, 'at');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(AT, 'assets/leistungen.js'), 'utf8'), sandbox);
const LIST = sandbox.window.ANADRI_LEISTUNGEN;
const EMAIL = sandbox.window.ANADRI_EMAIL;
const REFS = JSON.parse(fs.readFileSync(path.join(__dirname, 'referenzen.json'), 'utf8'));
const byId = Object.fromEntries(LIST.map(s => [s.id, s]));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf2 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
const avg = s => (s.min + s.max) / 2;

const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="9" fill="#c41e3a"/><path d="M8 30 20 9l12 21h-5.2L20 18.4 13.2 30Z" fill="#fff"/><path d="M16.4 25h7.2" stroke="#fff" stroke-width="2.6"/></svg>';

const NAV = [
  { key: 'leistungen', href: 'leistungen/', label: 'Leistungen' },
  { key: 'kalkulator', href: 'kalkulator/', label: 'Kalkulator' },
  { key: 'referenzen', href: 'referenzen/', label: 'Referenzen' },
  { key: 'ablauf', href: 'ablauf/', label: 'Ablauf' },
  { key: 'uber-uns', href: 'uber-uns/', label: 'Über uns' },
  { key: 'kontakt', href: 'kontakt/', label: 'Kontakt' }
];

// ---------- Texte der Leistungsseiten ----------
const TEXT = {
  'abbruch-entsorgung': {
    lead: 'Wir entfernen alte Böden, Fliesen, Wände und Einbauten – staubarm, geordnet und mit fachgerechter Entsorgung des Bauschutts.',
    flaeche: 'Grundfläche der Räume, in denen abgebrochen wird',
    items: ['Entfernen von Fliesen, Estrich und Bodenbelägen', 'Abbruch nichttragender Wände', 'Demontage von Küchen, Bädern und Einbauten', 'Entkernung ganzer Wohnungen', 'Abtransport und Entsorgung des Bauschutts', 'Besenreine Übergabe'],
    factors: ['Material und Stärke der Bauteile', 'Stockwerk, Lift und Zufahrt für den Abtransport', 'Menge und Art des Bauschutts', 'Staub- und Lärmschutz in bewohnten Objekten'],
    note: 'Tragende Wände werden nur nach statischer Prüfung und mit Freigabe eines Statikers entfernt. Schadstoffe wie Asbest dürfen nur von spezialisierten Fachbetrieben entfernt werden.'
  },
  'innenrenovierung': {
    lead: 'Teil- oder Komplettrenovierung von Wohnungen und Häusern – alle Gewerke koordiniert, ein Ansprechpartner von der Besichtigung bis zur Übergabe.',
    flaeche: 'Wohnfläche des renovierten Bereichs',
    items: ['Planung und Koordination aller Gewerke', 'Wände und Decken spachteln und streichen', 'Neue Böden verlegen', 'Türen und Zargen tauschen', 'Bad- und Küchenrenovierung', 'Endreinigung vor der Übergabe'],
    factors: ['Zustand der Bausubstanz', 'Umfang: Teil- oder Komplettsanierung', 'Altbau (Raumhöhen, unebene Wände) oder Neubau', 'Zeitplan und ob die Wohnung bewohnt bleibt'],
    note: 'Die Spanne ist groß, weil „Innenrenovierung“ vom Auffrischen bis zur Komplettsanierung reicht. Bei der kostenlosen Besichtigung legen wir den genauen Umfang fest.'
  },
  'fassade-waermedaemmung': {
    lead: 'Fassadensanierung und Wärmedämmverbundsystem (WDVS), die Heizkosten senken und die Bausubstanz schützen.',
    flaeche: 'Fassadenfläche (Wandfläche außen, inkl. Fenster)',
    items: ['Untergrund prüfen und vorbereiten', 'Dämmplatten aus EPS oder Mineralwolle', 'Armierung und Oberputz', 'Sockel-, Fenster- und Dachanschlüsse', 'Fassadenanstrich', 'Ausbesserung schadhafter Putzflächen'],
    factors: ['Art und Stärke des Dämmstoffs', 'Gebäudehöhe und Gerüstbedarf', 'Zustand des bestehenden Putzes', 'Anzahl der Fenster und Anschlüsse'],
    note: 'Für thermische Sanierungen gibt es in Österreich Förderungen von Bund und Ländern. Prüfen Sie die aktuellen Bedingungen, bevor Sie den Auftrag vergeben – oft muss der Antrag vor Baubeginn gestellt werden.'
  },
  'dacharbeiten': {
    lead: 'Neueindeckung, Reparatur und Dämmung – vom Dachstuhl bis zur Dachrinne.',
    flaeche: 'Dachfläche (nicht die Grundfläche des Hauses)',
    items: ['Neueindeckung mit Ziegel oder Blech', 'Austausch beschädigter Ziegel', 'Unterspannbahn, Konter- und Dachlattung', 'Dachdämmung zwischen den Sparren oder auf der obersten Geschoßdecke', 'Dachrinnen und Fallrohre', 'Kontrolle des Dachstuhls'],
    factors: ['Dachneigung und Dachform', 'Gewähltes Eindeckmaterial', 'Zustand des Dachstuhls', 'Gerüst und Absturzsicherung'],
    note: 'Die Dachfläche ist bei geneigten Dächern deutlich größer als die Grundfläche. Bei der Besichtigung messen wir sie genau aus.'
  },
  'elektroinstallation': {
    lead: 'Neue oder erneuerte Elektroinstallation für Wohnung und Haus – sicher, sauber verlegt und vorbereitet für den heutigen Bedarf.',
    flaeche: 'Wohnfläche, in der die Installation erneuert wird',
    items: ['Leitungen neu verlegen (Unterputz)', 'Steckdosen, Schalter und Lichtauslässe', 'Verteiler und Sicherungskasten', 'Fehlerstrom-Schutzschalter (FI)', 'Netzwerk- und TV-Leitungen', 'Schlitze schließen und verputzen'],
    factors: ['Anzahl der Stromkreise und Auslässe', 'Zustand der bestehenden Leitungen', 'Wandmaterial (Ziegel, Beton, Trockenbau)', 'Sonderwünsche wie Smart Home'],
    note: 'Arbeiten an elektrischen Anlagen dürfen in Österreich nur befugte Elektrotechniker durchführen. Nach Abschluss ist eine Prüfung der Anlage mit Prüfbefund erforderlich.'
  },
  'wasser-sanitaer': {
    lead: 'Wasser- und Abwasserleitungen, Badsanierung und Sanitärmontage – ohne Gasinstallationen.',
    flaeche: 'Fläche der betroffenen Räume (z.B. Bad, Küche)',
    items: ['Wasser- und Abwasserleitungen erneuern', 'Bad komplett: Dusche, Wanne, WC, Waschtisch', 'Vorwandinstallation für Hänge-WC und Waschtisch', 'Küchenanschlüsse', 'Montage von Warmwasserspeichern (elektrisch)', 'Dichtheitsprüfung der Leitungen'],
    factors: ['Leitungsführung und Zugänglichkeit', 'Altbestand (z.B. verzinkte oder Bleileitungen)', 'Anzahl der Sanitärgegenstände', 'Abdichtung im Nassbereich'],
    note: 'Gasinstallationen sind nicht Teil unseres Angebots.'
  },
  'maler-anstrich': {
    lead: 'Wand- und Deckenanstriche innen – sauber abgedeckt, gleichmäßig gestrichen und besenrein übergeben.',
    flaeche: 'Wand- und Deckenfläche (Faustregel: etwa das Dreifache der Bodenfläche)',
    items: ['Möbel und Böden abdecken und schützen', 'Kleine Risse und Löcher spachteln', 'Grundierung saugender Untergründe', 'Wand- und Deckenanstrich in zwei Durchgängen', 'Lackieren von Türen und Heizkörpern (nach Aufwand)', 'Endreinigung'],
    factors: ['Zustand des Untergrunds', 'Raumhöhe', 'Farbwechsel von dunkel auf hell', 'Möblierte oder leere Räume'],
    note: 'Der Preis gilt pro m² gestrichener Fläche, nicht pro m² Boden. Ein Zimmer mit 20 m² Boden hat rund 60 m² Wand- und Deckenfläche.'
  },
  'gipskarton-trockenbau': {
    lead: 'Trennwände, abgehängte Decken und Dachgeschoßausbau in Trockenbauweise – schnell, sauber und ohne lange Trocknungszeiten.',
    flaeche: 'Fläche der Wände oder Decken in Trockenbau',
    items: ['Trennwände in Ständerbauweise', 'Abgehängte Decken', 'Vorsatzschalen', 'Dachgeschoßausbau', 'Schall- und Brandschutzlösungen', 'Spachteln bis zur gewünschten Oberflächenqualität (Q1–Q4)'],
    factors: ['Wandhöhe und Beplankung (einfach oder doppelt)', 'Dämmung und Schallschutz', 'Gewünschte Oberflächenqualität', 'Anzahl der Türöffnungen und Ausschnitte'],
    note: 'Für Wände, die Fliesen tragen, verwenden wir imprägnierte Platten. Die Qualitätsstufe der Oberfläche (Q1–Q4) legen wir gemeinsam vorab fest.'
  },
  'fliesen-bodenbelag': {
    lead: 'Fliesen an Boden und Wand sowie Laminat, Parkett und Vinyl – exakt verlegt, mit sauberen Fugen und Abschlüssen.',
    flaeche: 'Verlegefläche (Boden und/oder Wand)',
    items: ['Untergrund prüfen und ausgleichen', 'Boden- und Wandfliesen', 'Abdichtung im Nassbereich', 'Laminat, Parkett und Vinyl', 'Sockelleisten und Übergangsprofile', 'Verfugen und Silikonfugen'],
    factors: ['Fliesenformat (Großformate sind aufwändiger)', 'Verlegemuster', 'Zustand und Ebenheit des Untergrunds', 'Anzahl der Zuschnitte und Ecken'],
    note: 'Material wie Fliesen, Kleber und Bodenbelag ist im Richtpreis nicht enthalten. Gerne beraten wir Sie bei der Auswahl.'
  }
};

const STEPS = [
  ['Schätzung online', 'Im Preisrechner wählen Sie die Arbeiten und sehen sofort eine unverbindliche Kostenschätzung.'],
  ['Kostenlose Besichtigung', 'Wir sehen uns das Objekt vor Ort an, messen aus und klären Ihre Wünsche.'],
  ['Detailliertes Angebot', 'Sie erhalten ein schriftliches Angebot mit Leistungen, Preisen und Zeitplan.'],
  ['Ausführung & Übergabe', 'Wir führen die Arbeiten aus, halten Sie auf dem Laufenden und übergeben besenrein.']
];

// ---------- Layout ----------
function layout({ depth, active, title, description, body, scripts = [], noindex = false, bodyClass = '' }) {
  const r = depth ? '../'.repeat(depth) : './';
  const nav = NAV.map(n =>
    `<li><a href="${r}${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  const footerLeistungen = LIST.map(s => `<li><a href="${r}leistungen/${s.id}/">${esc(s.name)}</a></li>`).join('');
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#1a1a1a">
<link rel="stylesheet" href="${r}assets/site.css">
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${r}" aria-label="ANADRI – Startseite">${LOGO}<span>ANADRI<small>Renovierung · Österreich</small></span></a>
    <nav class="main-nav" id="main-nav" aria-label="Hauptmenü">
      <ul>${nav}</ul>
      <a class="btn btn--red nav-cta" href="${r}kontakt/">Besichtigung anfragen</a>
    </nav>
    <div class="lang" aria-label="Sprache"><a href="${r}../ro/" hreflang="ro" lang="ro" title="Versiunea în limba română">RO</a><span aria-current="true">DE</span></div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav"><span class="menu-btn__icon" aria-hidden="true"></span><span class="menu-btn__text">Menü</span></button>
  </div>
</header>
<main id="inhalt">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${r}">${LOGO}<span>ANADRI<small>Renovierung · Österreich</small></span></a>
        <p>Abbruch, Renovierung und Ausbau für Wohnungen und Häuser in Österreich. Transparente Richtpreise, kostenlose Besichtigung.</p>
        <p><a class="btn btn--red" href="${r}kalkulator/">Preis berechnen</a></p>
      </div>
      <div>
        <h2>Leistungen</h2>
        <ul>${footerLeistungen}</ul>
      </div>
      <div>
        <h2>Unternehmen</h2>
        <ul>
          <li><a href="${r}kalkulator/">Kalkulator</a></li>
          <li><a href="${r}referenzen/">Referenzen</a></li>
          <li><a href="${r}ablauf/">Ablauf &amp; FAQ</a></li>
          <li><a href="${r}uber-uns/">Über uns</a></li>
          <li><a href="${r}kontakt/">Kontakt</a></li>
          <li><a href="${r}impressum/">Impressum</a></li>
          <li><a href="${r}datenschutz/">Datenschutz</a></li>
          <li><a href="${r}../ro/" hreflang="ro" lang="ro">Română</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom"><span>© 2026 ANADRI CONSULTING SRL</span><span>Alle Preise sind unverbindliche Richtpreise für die Arbeitsleistung.</span></div>
  </div>
</footer>
${scripts.map(s => `<script src="${r}assets/${s}"></script>`).join('\n')}
<script src="${r}assets/nav.js"></script>
</body>
</html>
`;
}

function pageHead({ crumbs, h1, lead, extra = '' }) {
  const c = crumbs ? `<nav class="crumbs" aria-label="Pfad">${crumbs}</nav>\n    ` : '';
  return `<div class="container page-head">
    ${c}<h1>${h1}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}${extra}
  </div>`;
}

function ctaBand(r) {
  return `<div class="cta-band">
      <div><h2>Bereit für Ihr Projekt?</h2><p>Berechnen Sie den Preis online oder vereinbaren Sie direkt eine kostenlose Besichtigung.</p></div>
      <div class="btns"><a class="btn btn--red" href="${r}kalkulator/">Preis berechnen</a><a class="btn btn--light" href="${r}kontakt/">Besichtigung anfragen</a></div>
    </div>`;
}

function stepsList() {
  return `<ol class="steps">${STEPS.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>`;
}

function serviceCards(r, headingTag = 'h3') {
  return `<div class="svc-grid">${LIST.map(s => `
      <article class="svc">
        <${headingTag}>${esc(s.name)}</${headingTag}>
        <p>${esc(s.desc)}</p>
        <div class="svc__price">${s.min}–${s.max} €/m² <small>· Ø ${nf2.format(avg(s))} €/m²</small></div>
        <div class="svc__actions"><a class="btn btn--ghost" href="${r}leistungen/${s.id}/">Details</a><a class="btn btn--red" href="${r}kalkulator/?service=${s.id}#ergebnis">Berechnen</a></div>
      </article>`).join('')}
    </div>`;
}

const formHidden = (subject) => `<input type="hidden" name="_subject" value="${esc(subject)}">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_next" value="">
        <input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">`;

const consent = (r) => `<label class="consent full"><input type="checkbox" name="Einwilligung" value="ja" required> <span>Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden. <a href="${r}datenschutz/">Datenschutzerklärung</a></span></label>`;

// ---------- Seiten ----------
const pages = {};

pages['index.html'] = layout({
  depth: 0, active: '',
  title: 'ANADRI — Renovierung & Ausbau in Österreich mit klaren Preisen',
  description: 'Abbruch, Innenrenovierung, Fassade, Dach, Elektro, Sanitär, Maler, Trockenbau und Fliesen in Österreich. Richtpreise online berechnen, kostenlose Besichtigung.',
  body: home({ r: './', LIST, REFS, esc, serviceCards, stepsList, ctaBand, refCard })
});

pages['kalkulator/index.html'] = layout({
  depth: 1, active: 'kalkulator',
  title: 'ANADRI Preisrechner — Renovierungskosten in Österreich berechnen',
  description: 'Unverbindliche Kostenschätzung für Abbruch, Innenrenovierung, Fassade, Dach, Elektro, Sanitär, Maler, Trockenbau und Fliesen in Österreich.',
  scripts: ['leistungen.js', 'rechner.js'],
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Kalkulator', h1: 'ANADRI Preisrechner', lead: 'Erhalten Sie eine unverbindliche Kostenschätzung für Ihr Renovierungsprojekt' })}
  <div class="container">
    <div class="rechner">
      <section class="card" aria-labelledby="input-title">
        <h2 id="input-title">Projektdetails eingeben</h2>
        <p class="hint">Wählen Sie die gewünschten Arbeiten und geben Sie jeweils die Fläche ein. Preise pro m², nur Arbeitsleistung.</p>
        <div id="services"></div>
      </section>

      <section class="calc" id="ergebnis" aria-labelledby="result-title">
        <div class="calc__head"><div class="calc__label" id="result-title">Kostenschätzung</div><span class="badge">Unverbindlich</span></div>
        <p class="calc__top">Richtpreise nur für Arbeitsleistung – Material nicht enthalten.</p>
        <p class="sent" data-sent role="status" hidden><b>Vielen Dank!</b> Ihre Schätzung ist bei uns angekommen. Wir kontaktieren Sie in Kürze mit einem detaillierten Angebot.</p>
        <div aria-live="polite">
          <p class="calc__empty" id="empty">Wählen Sie mindestens eine Leistung aus, um eine Schätzung zu sehen</p>
          <div id="result" hidden>
            <div class="calc__value" id="total">0 €</div>
            <p class="calc__sub">Mittelwert der Richtpreise</p>
            <p class="calc__range">Spannweite: <b id="range">0 € – 0 €</b></p>
            <div class="margin-box"><div>Mit Verhandlungsspielraum (±10%)</div><b id="margin">0 € – 0 €</b></div>
            <ul class="breakdown" id="breakdown"></ul>
          </div>
        </div>
        <p class="calc__disclaimer">Der endgültige Preis kann je nach Objekt, Zugänglichkeit, Zustand und Arbeitsaufwand abweichen.</p>

        <form class="send" id="send" action="https://formsubmit.co/${EMAIL}" method="POST" data-formsubmit data-anchor="#ergebnis" hidden>
          <h3>Passt der Preis?</h3>
          <p>Senden Sie uns Ihre Schätzung – wir melden uns für eine kostenlose Besichtigung. Eine Kopie geht an Ihre E-Mail-Adresse.</p>
          ${formHidden('Preisrechner Österreich – neue Anfrage')}
          <input type="hidden" name="_autoresponse" id="f-auto">
          <input type="hidden" name="Leistungen" id="f-leistungen">
          <input type="hidden" name="Schätzung (Mittelwert)" id="f-total">
          <input type="hidden" name="Spannweite" id="f-range">
          <input type="hidden" name="Verhandlungsspielraum (±10%)" id="f-margin">
          <div class="form-grid form-grid--2">
            <div class="field"><label for="f-name">Name</label><input id="f-name" type="text" name="Name" required maxlength="120" autocomplete="name"></div>
            <div class="field"><label for="f-tel">Telefon</label><input id="f-tel" type="tel" name="Telefon" required maxlength="30" autocomplete="tel"></div>
            <div class="field"><label for="f-email">E-Mail</label><input id="f-email" type="email" name="email" required maxlength="160" autocomplete="email"></div>
            <div class="field"><label for="f-ort">PLZ / Ort des Objekts</label><input id="f-ort" type="text" name="Ort" required maxlength="120"></div>
            <div class="field full"><label for="f-msg">Nachricht <small>(optional)</small></label><textarea id="f-msg" name="Nachricht" maxlength="2000" rows="3" placeholder="z.B. Baujahr, gewünschter Zeitraum, Besonderheiten"></textarea></div>
            ${consent('../')}
            <button class="cta full" type="submit">Schätzung senden &amp; Besichtigung anfordern</button>
          </div>
        </form>
      </section>
    </div>
  </div>

  <div class="mobile-bar" id="mobile-bar" hidden>
    <div><small>Ihre Schätzung</small><b id="bar-total">0 €</b></div>
    <a href="#ergebnis">Weiter zum Senden</a>
  </div>`
});

pages['leistungen/index.html'] = layout({
  depth: 1, active: 'leistungen',
  title: 'Leistungen — Renovierung & Ausbau in Österreich | ANADRI',
  description: 'Abbruch, Innenrenovierung, Fassade, Dach, Elektro, Sanitär, Maler, Trockenbau, Fliesen: alle Leistungen von ANADRI mit Richtpreisen pro m².',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Leistungen', h1: 'Unsere Leistungen', lead: 'Neun Gewerke aus einer Hand – mit transparenten Richtpreisen pro m². Alle Preise gelten für die Arbeitsleistung, Material wird gesondert vereinbart.' })}
  <div class="container">
    ${serviceCards('../', 'h2')}
    ${ctaBand('../')}
  </div>`
});

for (const s of LIST) {
  const t = TEXT[s.id];
  if (!t) throw new Error('Text fehlt: ' + s.id);
  const others = LIST.filter(o => o.id !== s.id).map(o =>
    `<a class="tile" href="../${o.id}/">${esc(o.name)} <span>${o.min}–${o.max} €/m²</span></a>`).join('\n        ');
  pages[`leistungen/${s.id}/index.html`] = layout({
    depth: 2, active: 'leistungen',
    title: `${s.name} in Österreich – Richtpreise ${s.min}–${s.max} €/m² | ANADRI`,
    description: `${t.lead} Richtpreis ${s.min}–${s.max} €/m², nur Arbeitsleistung.`,
    scripts: ['leistungen.js', 'leistung.js'],
    body: `${pageHead({
      crumbs: `<a href="../../">Startseite</a> / <a href="../">Leistungen</a> / ${esc(s.name)}`,
      h1: esc(s.name), lead: esc(t.lead),
      extra: `\n    <div class="chip">${s.min}–${s.max} €/m² <span>· nur Arbeitsleistung</span></div>`
    })}
  <div class="container">
    <div class="layout">
      <article class="card">
        <section>
          <h2>Leistungsumfang</h2>
          <ul class="checks">
${t.items.map(i => `            <li>${esc(i)}</li>`).join('\n')}
          </ul>
        </section>
        <section>
          <h2>Was den Preis beeinflusst</h2>
          <ul class="bullets">
${t.factors.map(i => `            <li>${esc(i)}</li>`).join('\n')}
          </ul>
        </section>
        <section>
          <h2>Gut zu wissen</h2>
          <p class="note">${esc(t.note)}</p>
        </section>
      </article>

      <aside class="calc" data-leistung="${s.id}" aria-label="Kostenschätzung ${esc(s.name)}">
        <div class="calc__head"><div class="calc__label">Kostenschätzung</div><span class="badge">Unverbindlich</span></div>
        <p class="calc__top">Richtpreise nur für Arbeitsleistung – Material nicht enthalten.</p>
        <div class="field"><label for="flaeche">Fläche (m²)</label><input id="flaeche" type="text" inputmode="decimal" autocomplete="off" data-area></div>
        <p class="calc__hint">${esc(t.flaeche)}</p>
        <div aria-live="polite">
          <p class="calc__empty" data-empty>Geben Sie die Fläche ein, um eine Schätzung zu sehen.</p>
          <div data-result hidden>
            <div class="calc__value" data-total>0 €</div>
            <p class="calc__sub">Mittelwert der Richtpreise</p>
            <p class="calc__range">Spannweite: <b data-range>0 € – 0 €</b></p>
            <div class="margin-box"><div>Mit Verhandlungsspielraum (±10%)</div><b data-margin>0 € – 0 €</b></div>
          </div>
        </div>
        <p class="calc__disclaimer">Der endgültige Preis kann je nach Objekt, Zugänglichkeit, Zustand und Arbeitsaufwand abweichen.</p>
        <a class="cta" data-cta href="../../kalkulator/?service=${s.id}#ergebnis">Schätzung per E-Mail senden</a>
        <p class="calc__small">Im Kalkulator senden Sie die Schätzung an uns und erhalten eine Kopie.</p>
        <a class="calc__more" href="../../kalkulator/">Mehrere Leistungen kombinieren →</a>
      </aside>
    </div>

    <section class="section" aria-labelledby="others-title">
      <h2 class="section-title" id="others-title">Weitere Leistungen</h2>
      <div class="tiles">
        ${others}
      </div>
    </section>
  </div>`
  });
}

// Referenzen – Bildpfade in referenzen.json relativ zu at/, z.B. "referenzen/bilder/bad-vorher.jpg"
function refImage(r, ref, i) {
  const b = ref.bilder && ref.bilder[0];
  if (b) return `<img src="${r}${esc(b.src)}" alt="${esc(b.alt || ref.titel)}" width="${b.width || 800}" height="${b.height || 600}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">`;
  const hue = ['#dfe3e8', '#e8e3df', '#e3e8df'][i % 3];
  return `<svg viewBox="0 0 400 300" role="img" aria-label="Noch kein Foto"><rect width="400" height="300" fill="${hue}"/><rect y="225" width="400" height="75" fill="#c9cdd2"/><path d="M90 150 200 75l110 75Z" fill="#1a1a1a"/><rect x="108" y="148" width="184" height="80" fill="#fff"/><rect x="130" y="168" width="36" height="30" fill="#c41e3a"/><rect x="234" y="168" width="36" height="30" fill="#c41e3a"/><rect x="185" y="176" width="30" height="52" fill="#333"/></svg>`;
}
function refCard(r, ref, i, h = 'h2') {
  const bilder = ref.bilder || [];
  return `
      <article class="ref" data-leistungen="${ref.leistungen.join(' ')}">
        <div class="ref__img">${refImage(r, ref, i)}${ref.platzhalter ? '<span class="ref__flag">Platzhalter</span>' : ''}${bilder.length > 1 ? `<span class="ref__count">${bilder.length} Fotos</span>` : ''}</div>
        <div class="ref__body">
          <${h}>${esc(ref.titel)}</${h}>
          <p class="ref__meta">${[ref.ort, ref.jahr, ref.flaeche].filter(Boolean).map(esc).join(' · ')}</p>
          <p>${esc(ref.text)}</p>
          <ul class="ref__tags">${ref.leistungen.map(id => byId[id] ? `<li><a href="${r}leistungen/${id}/">${esc(byId[id].name)}</a></li>` : '').join('')}</ul>
          ${bilder.length > 1 ? `<div class="ref__thumbs">${bilder.map((b, j) => `<a href="${r}${esc(b.src)}" target="_blank" rel="noopener"><img src="${r}${esc(b.src)}" alt="${esc(b.alt || ref.titel + ' – Foto ' + (j + 1))}" width="96" height="72" loading="lazy">${b.label ? `<span>${esc(b.label)}</span>` : ''}</a>`).join('')}</div>` : ''}
        </div>
      </article>`;
}

const usedServices = LIST.filter(s => REFS.some(r => r.leistungen.includes(s.id)));
pages['referenzen/index.html'] = layout({
  depth: 1, active: 'referenzen',
  title: 'Referenzen — Ausgeführte Projekte | ANADRI',
  description: 'Ausgeführte Renovierungs- und Ausbauprojekte von ANADRI in Österreich, mit Fotos und Leistungen.',
  scripts: ['referenzen.js'],
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Referenzen', h1: 'Referenzen', lead: 'Eine Auswahl unserer ausgeführten Projekte – mit Ort, Umfang und den erbrachten Leistungen.' })}
  <div class="container">
    ${REFS.length ? `<div class="filters" role="group" aria-label="Nach Leistung filtern">
      <button type="button" class="filter is-active" data-filter="" aria-pressed="true">Alle <span>${REFS.length}</span></button>
      ${usedServices.map(s => `<button type="button" class="filter" data-filter="${s.id}" aria-pressed="false">${esc(s.name)} <span>${REFS.filter(r => r.leistungen.includes(s.id)).length}</span></button>`).join('\n      ')}
    </div>
    <div class="refs" id="refs">${REFS.map((ref, i) => refCard('../', ref, i)).join('')}
    </div>
    <p class="refs-empty" id="refs-empty" hidden>Für diese Leistung sind noch keine Referenzen veröffentlicht.</p>` : `<p class="note">Die ersten Referenzen werden in Kürze veröffentlicht.</p>`}
    ${ctaBand('../')}
  </div>`
});

pages['ablauf/index.html'] = layout({
  depth: 1, active: 'ablauf',
  title: 'Ablauf & häufige Fragen | ANADRI',
  description: 'So läuft ein Projekt mit ANADRI ab: Online-Schätzung, kostenlose Besichtigung, Angebot, Ausführung. Antworten auf häufige Fragen.',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Ablauf', h1: 'So arbeiten wir', lead: 'Klare Schritte, klare Preise: Sie wissen in jeder Phase, woran Sie sind.' })}
  <div class="container">
    ${stepsList()}
    <section class="section" aria-labelledby="faq-title">
      <h2 class="section-title" id="faq-title">Häufige Fragen</h2>
      <div class="faq">
        <details><summary>Sind die Preise im Preisrechner verbindlich?</summary><p>Nein. Es sind Richtpreise für die Arbeitsleistung. Den verbindlichen Preis erhalten Sie nach der Besichtigung im schriftlichen Angebot.</p></details>
        <details><summary>Ist das Material im Preis enthalten?</summary><p>Nein, die Richtpreise gelten nur für die Arbeitsleistung. Ob Sie das Material selbst beistellen oder wir es mit anbieten, klären wir bei der Besichtigung.</p></details>
        <details><summary>Kostet die Besichtigung etwas?</summary><p>Nein, die Besichtigung ist kostenlos und unverbindlich.</p></details>
        <details><summary>Warum gibt es einen Spielraum von ±10 %?</summary><p>Jedes Objekt ist anders: Zugänglichkeit, Zustand und Details beeinflussen den Aufwand. Der Spielraum zeigt, wo der endgültige Preis realistisch liegen kann.</p></details>
        <details><summary>Welche Fläche gebe ich ein?</summary><p>Das hängt von der Leistung ab – beim Maler die Wand- und Deckenfläche, beim Dach die Dachfläche, bei der Fassade die Fassadenfläche. Im Preisrechner steht bei jeder Leistung, welche Fläche gemeint ist.</p></details>
        <details><summary>Übernehmen Sie auch Gasinstallationen?</summary><p>Nein, Gasinstallationen sind nicht Teil unseres Angebots.</p></details>
      </div>
    </section>
    ${ctaBand('../')}
  </div>`
});

pages['uber-uns/index.html'] = layout({
  depth: 1, active: 'uber-uns',
  title: 'Über uns | ANADRI',
  description: 'ANADRI CONSULTING: Renovierung und Ausbau in Österreich – transparente Preise, ein Ansprechpartner, saubere Arbeit.',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Über uns', h1: 'Über ANADRI', lead: 'Wir renovieren Wohnungen und Häuser in Österreich – mit klaren Preisen, einem festen Ansprechpartner und sauberer Arbeit.' })}
  <div class="container">
    <div class="card" style="max-width:860px">
      <p style="margin-top:0">ANADRI CONSULTING SRL ist ein Bauunternehmen mit Sitz in Biled (Kreis Timiș, Rumänien) und führt Renovierungs- und Ausbauarbeiten in Österreich aus. Vom Abbruch bis zum letzten Anstrich koordinieren wir alle Gewerke, damit Sie sich um nichts kümmern müssen.</p>
      <p style="margin-bottom:0">Unser Preisrechner zeigt Ihnen schon vor dem ersten Gespräch, mit welchen Kosten Sie rechnen können. Nach der kostenlosen Besichtigung erhalten Sie ein schriftliches Angebot – ohne versteckte Positionen.</p>
    </div>
    <section class="section" aria-labelledby="werte-title">
      <h2 class="section-title" id="werte-title">Worauf Sie sich verlassen können</h2>
      <div class="values">
        <div class="value"><h3>Transparente Preise</h3><p>Richtpreise pro m² online, schriftliches Angebot nach der Besichtigung.</p></div>
        <div class="value"><h3>Ein Ansprechpartner</h3><p>Eine Person koordiniert alle Gewerke und ist für Sie erreichbar.</p></div>
        <div class="value"><h3>Saubere Baustelle</h3><p>Abdecken, Staubschutz und besenreine Übergabe gehören dazu.</p></div>
        <div class="value"><h3>Klare Termine</h3><p>Zeitplan im Angebot, laufende Information über den Fortschritt.</p></div>
      </div>
    </section>
    ${ctaBand('../')}
  </div>`
});

pages['kontakt/index.html'] = layout({
  depth: 1, active: 'kontakt',
  title: 'Kontakt & kostenlose Besichtigung | ANADRI',
  description: 'Kostenlose Besichtigung anfragen: Schreiben Sie uns, wir melden uns mit einem Termin.',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Kontakt', h1: 'Kostenlose Besichtigung anfragen', lead: 'Beschreiben Sie kurz Ihr Projekt. Wir melden uns, um einen Termin für die Besichtigung zu vereinbaren.' })}
  <div class="container">
    <div class="layout">
      <section class="card" aria-label="Anfrageformular">
        <p class="sent" data-sent role="status" hidden><b>Vielen Dank!</b> Ihre Anfrage ist bei uns angekommen. Wir melden uns in Kürze.</p>
        <form action="https://formsubmit.co/${EMAIL}" method="POST" data-formsubmit>
          ${formHidden('Kontaktformular Österreich – Besichtigung')}
          <div class="form-grid form-grid--2">
            <div class="field"><label for="k-name">Name</label><input id="k-name" type="text" name="Name" required maxlength="120" autocomplete="name"></div>
            <div class="field"><label for="k-tel">Telefon</label><input id="k-tel" type="tel" name="Telefon" required maxlength="30" autocomplete="tel"></div>
            <div class="field"><label for="k-email">E-Mail</label><input id="k-email" type="email" name="email" required maxlength="160" autocomplete="email"></div>
            <div class="field"><label for="k-ort">PLZ / Ort des Objekts</label><input id="k-ort" type="text" name="Ort" required maxlength="120"></div>
            <div class="field full"><label for="k-leistung">Leistung</label>
              <select id="k-leistung" name="Leistung" required>
                <option value="">Bitte wählen…</option>
                ${LIST.map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('\n                ')}
                <option value="Mehrere Leistungen">Mehrere Leistungen</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
            <div class="field full"><label for="k-msg">Ihr Projekt</label><textarea id="k-msg" name="Nachricht" required maxlength="3000" placeholder="Was soll gemacht werden? Ungefähre Fläche, Baujahr, gewünschter Zeitraum…"></textarea></div>
            ${consent('../')}
            <button class="btn btn--red full" type="submit">Anfrage senden</button>
          </div>
        </form>
      </section>
      <aside class="calc">
        <div class="calc__head"><div class="calc__label">Kontakt</div></div>
        <dl class="info-list">
          <div><dt>E-Mail</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
          <div><dt>Telefon</dt><dd><span class="todo">folgt</span></dd></div>
          <div><dt>Einsatzgebiet</dt><dd>Österreich</dd></div>
        </dl>
        <p class="calc__disclaimer" style="margin-top:18px">Lieber erst die Kosten sehen?</p>
        <a class="cta" href="../kalkulator/">Zum Kalkulator</a>
      </aside>
    </div>

    <section class="section" aria-labelledby="karte-title">
      <h2 class="section-title" id="karte-title">${esc(MAP.caption)}</h2>
      ${mapBlock()}
    </section>
  </div>`
});

function mapBlock() {
  const [w, s, e, n] = MAP.bbox;
  let src = `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik`;
  if (MAP.marker) src += `&marker=${MAP.marker[0]}%2C${MAP.marker[1]}`;
  const link = MAP.marker
    ? `https://www.openstreetmap.org/?mlat=${MAP.marker[0]}&mlon=${MAP.marker[1]}#map=13/${MAP.marker[0]}/${MAP.marker[1]}`
    : `https://www.openstreetmap.org/#map=7/${((s + n) / 2).toFixed(2)}/${((w + e) / 2).toFixed(2)}`;
  return `<div class="map" data-map data-src="${esc(src)}" data-title="${esc(MAP.caption)}">
        <div class="map__placeholder">
          <svg class="map__bg" viewBox="0 0 600 300" aria-hidden="true"><path d="M40 190 95 160l60 8 40-30 70 6 45-40 85 10 55-38 60 22 25 45-30 40-70 18-40 34-95-6-60 20-80-12-55 10-45-30Z" fill="#e9e9e9" stroke="#d0d0d0" stroke-width="3"/></svg>
          <div class="map__text">
            <button class="btn btn--red" type="button" data-map-load>Karte laden</button>
            <p>Die Karte wird von OpenStreetMap geladen. Dabei wird Ihre IP-Adresse an OpenStreetMap übertragen. <a href="../datenschutz/">Mehr dazu</a></p>
            <p><a href="${esc(link)}" target="_blank" rel="noopener">Auf openstreetmap.org öffnen ↗</a></p>
          </div>
        </div>
      </div>`;
}

pages['impressum/index.html'] = layout({
  depth: 1, active: '', noindex: true,
  title: 'Impressum | ANADRI',
  description: 'Impressum und Offenlegung der ANADRI CONSULTING SRL.',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Impressum', h1: 'Impressum' })}
  <div class="container">
    <div class="card legal">
      <p style="margin-top:0"><strong>Informationen gemäß § 5 E-Commerce-Gesetz und Offenlegung gemäß § 25 Mediengesetz</strong></p>
      <h2>Unternehmen</h2>
      <p>ANADRI CONSULTING SRL<br>Sat Biled, Nr. 404<br>307060 Biled, Kreis Timiș, Rumänien</p>
      <h2>Registerdaten</h2>
      <p>Steuernummer (CUI): 3272443<br>Handelsregister (ONRC): <span class="todo">folgt</span><br>UID-Nummer: <span class="todo">folgt</span></p>
      <h2>Kontakt</h2>
      <p>E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a><br>Telefon: <span class="todo">folgt</span></p>
      <h2>Unternehmensgegenstand</h2>
      <p>Bau- und Renovierungsarbeiten</p>
      <h2>Gewerbeberechtigung und Aufsichtsbehörde in Österreich</h2>
      <p><span class="todo">folgt</span></p>
      <h2>Haftung</h2>
      <p>Die Preise auf dieser Website sind unverbindliche Richtpreise. Verbindlich ist ausschließlich das schriftliche Angebot nach der Besichtigung.</p>
    </div>
  </div>`
});

pages['datenschutz/index.html'] = layout({
  depth: 1, active: '', noindex: true,
  title: 'Datenschutzerklärung | ANADRI',
  description: 'Datenschutzerklärung der ANADRI CONSULTING SRL.',
  body: `${pageHead({ crumbs: '<a href="../">Startseite</a> / Datenschutz', h1: 'Datenschutzerklärung', lead: 'Stand: 6. Oktober 2026' })}
  <div class="container">
    <div class="card legal">
      <h2 style="margin-top:0">Verantwortlicher</h2>
      <p>ANADRI CONSULTING SRL, CUI 3272443, Sat Biled, Nr. 404, 307060 Biled, Kreis Timiș, Rumänien. E-Mail: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
      <h2>Welche Daten wir verarbeiten</h2>
      <p>Nur die Angaben, die Sie uns über die Formulare oder per E-Mail senden: Name, Telefonnummer, E-Mail-Adresse, Ort des Objekts, Ihre Nachricht sowie – beim Preisrechner – die gewählten Leistungen, Flächen und die berechnete Schätzung.</p>
      <p>Der Preisrechner selbst rechnet in Ihrem Browser. Solange Sie das Formular nicht absenden, werden keine Eingaben an uns übertragen.</p>
      <h2>Zweck und Rechtsgrundlage</h2>
      <p>Wir verwenden die Daten, um Ihre Anfrage zu beantworten, eine Besichtigung zu vereinbaren und ein Angebot zu erstellen (Art. 6 Abs. 1 lit. b DSGVO – vorvertragliche Maßnahmen) sowie auf Grundlage Ihrer Einwilligung im Formular (Art. 6 Abs. 1 lit. a DSGVO). Wir senden keine Werbung und geben die Daten nicht zu Werbezwecken weiter.</p>
      <h2>Empfänger</h2>
      <p>Die Formulare werden über den Dienst FormSubmit (formsubmit.co) übermittelt, der uns die Anfrage per E-Mail zustellt und Ihnen beim Preisrechner eine Kopie sendet. Daneben haben unsere E-Mail- und Hosting-Anbieter Zugriff, soweit dies für den Betrieb notwendig ist.</p>
      <h2>Speicherdauer</h2>
      <p>Anfragen, aus denen kein Auftrag entsteht, löschen wir spätestens nach 12 Monaten. Kommt ein Vertrag zustande, bewahren wir die Daten so lange auf, wie gesetzliche Aufbewahrungspflichten es verlangen.</p>
      <h2>Cookies</h2>
      <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Werbedienste. Die Bestätigungsseite von FormSubmit kann eigene, technisch notwendige Cookies verwenden (z.B. zum Spamschutz).</p>
      <h2>Karte (OpenStreetMap)</h2>
      <p>Auf der Kontaktseite können Sie eine Karte von OpenStreetMap laden. Die Karte wird erst geladen, wenn Sie auf „Karte laden“ klicken. Dann wird Ihre IP-Adresse an die OpenStreetMap Foundation (St John’s Innovation Centre, Cambridge, Vereinigtes Königreich) übertragen. Rechtsgrundlage ist Ihre Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO). Details: <a href="https://osmfoundation.org/wiki/Privacy_Policy" rel="noopener">osmfoundation.org</a>.</p>
      <h2>Ihre Rechte</h2>
      <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Eine erteilte Einwilligung können Sie jederzeit per E-Mail an <a href="mailto:${EMAIL}">${EMAIL}</a> widerrufen. Sie können sich außerdem bei der österreichischen Datenschutzbehörde beschweren (<a href="https://www.dsb.gv.at" rel="noopener">dsb.gv.at</a>).</p>
    </div>
  </div>`
});

for (const [file, html] of Object.entries(pages)) {
  const out = path.join(AT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('at/' + file.replace(/\\/g, '/'));
}
