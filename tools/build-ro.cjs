// Construiește paginile românești (ro/): pagina de start și calculatorul. Nu atinge nimic din at/.
// Rulare:  node tools/build-ro.cjs
// Prețuri: ro/assets/servicii.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const RO = path.join(ROOT, 'ro');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(RO, 'assets/servicii.js'), 'utf8'), sandbox);
const LIST = sandbox.window.ANADRI_SERVICII;
const EMAIL = sandbox.window.ANADRI_EMAIL;
const TEL = sandbox.window.ANADRI_TEL;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });
const avg = s => (s.min + s.max) / 2;

const LOGO = '<svg class="brand__mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M10 54 32 12l22 42" fill="none" stroke="#c41e3a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="38" width="24" height="9" rx="2" fill="currentColor"/></svg>';
const FIRMA = 'ANADRI CONSULTING RO SRL';
const ADRESA = 'Sat Biled, nr. 404, 307060 Biled, jud. Timiș';
// Video pe fundalul paginii de start: se folosește doar dacă există ro/assets/hero-images/hero.mp4 (+ hero.jpg ca poster)
const HERO_VIDEO = fs.existsSync(path.join(RO, 'assets/hero-images/hero.mp4'))
  ? { src: 'assets/hero-images/hero.mp4', poster: fs.existsSync(path.join(RO, 'assets/hero-images/hero.jpg')) ? 'assets/hero-images/hero.jpg' : null }
  : null;
// Adresa publică a site-ului (pentru og:image, canonical, date structurate). De schimbat când se leagă domeniul propriu.
const SITE_URL = 'https://adrianbrusturean.netlify.app';
// Date structurate pentru Google (logo, firmă, adresă)
const ORG = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'ANADRI Construcții',
  legalName: FIRMA,
  url: SITE_URL + '/ro/',
  logo: SITE_URL + '/ro/assets/logo/logo-full.png',
  image: SITE_URL + '/ro/assets/logo/og-image.jpg',
  email: EMAIL,
  foundingDate: '2014-01-30',
  taxID: 'RO32724443',
  address: { '@type': 'PostalAddress', streetAddress: 'Sat Biled, nr. 404', postalCode: '307060', addressLocality: 'Biled', addressRegion: 'Timiș', addressCountry: 'RO' },
  areaServed: ['Timiș', 'Banat', 'Timișoara'],
  priceRange: 'lei/m²',
  sameAs: []
};

const NAV = [
  { key: 'servicii', href: '#servicii', label: 'Servicii' },
  { key: 'calculator', href: 'calculator/', label: 'Calculator' },
  { key: 'lucrari', href: '#lucrari', label: 'Lucrări' },
  { key: 'cum', href: '#cum-lucram', label: 'Cum lucrăm' },
  { key: 'zone', href: 'zone/', label: 'Zone' },
  { key: 'contact', href: '#contact', label: 'Contact' }
];

// Localități deservite (Timiș și Arad) – pagini locale + sitemap
const LOC = JSON.parse(fs.readFileSync(path.join(__dirname, 'localitati.json'), 'utf8'));
const LOCALITATI = LOC.localitati;
const JUDETE = LOC.judete;
const byJudet = j => LOCALITATI.filter(l => l.judet === j);

const STEPS = [
  ['Estimare online', 'Alegi lucrările în calculator și vezi pe loc prețul orientativ, în lei.'],
  ['Vizită gratuită', 'Venim la teren sau la casă, măsurăm și discutăm exact ce îți dorești.'],
  ['Ofertă scrisă', 'Primești oferta cu lucrări, prețuri și termene – fără poziții ascunse.'],
  ['Execuție și predare', 'Aceeași echipă de la fundație la finisaje. Te ținem la curent, predăm curat.']
];

const FAQ = [
  ['Prețurile din calculator sunt finale?', 'Nu. Sunt prețuri orientative pentru manoperă. Prețul ferm îl primești în oferta scrisă, după vizita la fața locului.'],
  ['Materialele sunt incluse?', 'Nu, prețurile sunt doar pentru manoperă, fără TVA. Stabilim la vizită dacă aduci tu materialele sau le ofertăm noi.'],
  ['Vizita costă ceva?', 'Nu. Vizita și măsurătorile sunt gratuite și fără obligații.'],
  ['Ce înseamnă la roșu, la gri, la cheie?', 'La roșu = structura casei (fundație, zidărie, planșee, șarpantă). La gri = plus învelitoare, tâmplărie, tencuieli, șape și instalații brute. La cheie = gata de locuit, cu toate finisajele.'],
  ['În ce zonă lucrați?', 'Timiș și Banat – Biled, Timișoara și împrejurimi. Pentru lucrări mari discutăm și alte zone.'],
  ['Dați garanție?', 'Da, garanția legală pentru lucrările executate, trecută în contract. Detaliile le stabilim în ofertă.']
];

// ---------- Layout ----------
function layout({ depth, active, title, description, body, scripts = [], noindex = false, pagePath = '' }) {
  const r = depth ? '../'.repeat(depth) : './';
  const home = depth ? r : './';
  const nav = NAV.map(n => {
    const href = n.href.startsWith('#') ? home + n.href : r + n.href;
    return `<li><a href="${href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a></li>`;
  }).join('');
  const footerServicii = LIST.map(s => `<li><a href="${r}calculator/?serviciu=${s.id}#rezultat">${esc(s.name)}</a></li>`).join('');
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#0b2a5b">
<link rel="canonical" href="${SITE_URL}/ro/${pagePath}">
<link rel="alternate" hreflang="ro" href="${home}">
<link rel="alternate" hreflang="de-AT" href="${r}../at/">
<link rel="icon" type="image/png" sizes="32x32" href="${r}assets/logo/icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="${r}assets/logo/icon-192.png">
<link rel="apple-touch-icon" href="${r}assets/logo/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ANADRI Construcții">
<meta property="og:locale" content="ro_RO">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE_URL}/ro/${pagePath}">
<meta property="og:image" content="${SITE_URL}/ro/assets/logo/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ANADRI – Construcții România">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE_URL}/ro/assets/logo/og-image.jpg">
<link rel="stylesheet" href="${r}assets/site.css">
<script type="application/ld+json">${JSON.stringify(ORG)}</script>
</head>
<body>
<a class="skip" href="#continut">Sari la conținut</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${home}" aria-label="ANADRI – pagina principală"><img src="${r}assets/logo/logo-mark.png" width="512" height="512" alt="" decoding="async"><span class="brand__text">ANADRI<small>Construcții · România</small></span></a>
    <nav class="main-nav" id="main-nav" aria-label="Meniu principal">
      <ul>${nav}</ul>
      <a class="btn btn--red nav-cta" href="${home}#contact">Vizită gratuită</a>
    </nav>
    <div class="lang" aria-label="Limba"><span aria-current="true">RO</span><a href="${r}../at/" hreflang="de" lang="de" title="Deutsche Version (Österreich)">DE</a></div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav"><span class="menu-btn__icon" aria-hidden="true"></span><span class="menu-btn__text">Meniu</span></button>
  </div>
</header>
<main id="continut">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="${home}" aria-label="ANADRI – pagina principală"><img src="${r}assets/logo/logo-full.png" width="800" height="635" alt="ANADRI – Construcții România" loading="lazy" decoding="async"><span class="brand__text">ANADRI<small>Construcții · România</small></span></a>
        <p>Construcții de case, renovări și acoperișuri în Timiș și Banat. Preț clar pe metru pătrat, vizită gratuită.</p>
        <p><a class="btn btn--red" href="${r}calculator/">Calculează prețul</a></p>
      </div>
      <div>
        <h2>Lucrări</h2>
        <ul>${footerServicii}</ul>
      </div>
      <div>
        <h2>Firma</h2>
        <ul>
          <li><a href="${home}#cum-lucram">Cum lucrăm</a></li>
          <li><a href="${home}#lucrari">Lucrări realizate</a></li>
          <li><a href="${r}zone/">Zone deservite: Timiș și Arad</a></li>
          <li><a href="${home}#contact">Contact</a></li>
          <li><a href="${r}politica-confidentialitate.html">Politica de confidențialitate</a></li>
          <li><a href="${r}politica-cookies.html">Politica de cookies</a></li>
          <li><a href="${r}../at/" hreflang="de" lang="de">Deutsch (Österreich)</a></li>
        </ul>
        <p style="margin-top:14px;font-size:.88em;color:#8fa3b6">${FIRMA}<br>CUI 32724443 · J35/196/2014<br>${ADRESA}</p>
      </div>
    </div>
    <div class="footer-bottom"><span>© 2026 ${FIRMA}</span><span>Prețurile afișate sunt orientative, pentru manoperă, fără TVA.</span></div>
  </div>
</footer>
${scripts.map(s => `<script src="${r}assets/${s}"></script>`).join('\n')}
<script src="${r}assets/nav.js"></script>
<script src="${r}assets/spargere.js"></script>
</body>
</html>
`;
}

const formHidden = (subject) => `<input type="hidden" name="_subject" value="${esc(subject)}">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_next" value="">
        <input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">`;
const consent = (r) => `<label class="consent full"><input type="checkbox" name="Acord GDPR" value="da" required> <span>Sunt de acord ca datele mele să fie folosite pentru a primi o ofertă, conform <a href="${r}politica-confidentialitate.html">Politicii de confidențialitate</a>.</span></label>`;

const ctaBand = (r) => `<div class="cta-band">
      <div><h2>Vrei să știi cât costă?</h2><p>Calculează în 2 minute sau cere direct o vizită gratuită la fața locului.</p></div>
      <div class="btns"><a class="btn btn--red" href="${r}calculator/">Calculează prețul</a><a class="btn btn--light" href="${r}#contact">Vreau o vizită</a></div>
    </div>`;

const stepsList = () => `<ol class="steps">${STEPS.map(([h, p]) => `<li><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>`;

function serviceCards(r) {
  return `<div class="svc-grid">${LIST.map(s => `
      <article class="svc">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <div class="svc__price">${nf.format(s.min)}–${nf.format(s.max)} lei/m² <small>· manoperă</small></div>
        <div class="svc__actions"><a class="btn btn--red" href="${r}calculator/?serviciu=${s.id}#rezultat">Calculează</a></div>
      </article>`).join('')}
    </div>`;
}

const EXEMPLE = [
  { titlu: 'Casă P+M, la cheie', meta: 'Timiș · ~140 m²', text: 'Casă nouă de la fundație la finisaje, cu mansardă locuibilă.', tags: ['Construcție nouă', 'La cheie'],
    svg: '<svg viewBox="0 0 400 300" role="img" aria-label="Ilustrație: casă parter cu mansardă"><rect width="400" height="300" fill="#dce8f4"/><rect y="230" width="400" height="70" fill="#b9cfe3"/><path d="M80 150 200 70l120 80Z" fill="#0f1e2e"/><rect x="100" y="148" width="200" height="90" fill="#fff"/><rect x="125" y="170" width="40" height="34" fill="#0a5ba8"/><rect x="235" y="170" width="40" height="34" fill="#0a5ba8"/><rect x="182" y="180" width="36" height="58" fill="#16293d"/><rect x="185" y="105" width="30" height="24" fill="#0a5ba8"/></svg>' },
  { titlu: 'Renovare casă tradițională', meta: 'Banat · ~110 m²', text: 'Termoizolație, instalații noi și recompartimentare interioară.', tags: ['Renovare completă'],
    svg: '<svg viewBox="0 0 400 300" role="img" aria-label="Ilustrație: casă veche în renovare"><rect width="400" height="300" fill="#e6eef6"/><rect y="230" width="400" height="70" fill="#c3d5e6"/><path d="M70 140 200 80l130 60Z" fill="#7a8794"/><rect x="90" y="138" width="220" height="100" fill="#f4f1ea"/><rect x="90" y="138" width="110" height="100" fill="#fff"/><rect x="115" y="160" width="40" height="34" fill="#0a5ba8"/><rect x="245" y="160" width="40" height="34" fill="#9fb0bf"/><path d="M200 120v118M196 150h96M196 185h96M196 220h96" stroke="#0f1e2e" stroke-width="3"/></svg>' },
  { titlu: 'Acoperiș nou cu țiglă', meta: 'Timiș · ~180 m²', text: 'Șarpantă din lemn tratat, folie anticondens, țiglă ceramică și sistem pluvial.', tags: ['Acoperiș'],
    svg: '<svg viewBox="0 0 400 300" role="img" aria-label="Ilustrație: acoperiș nou din țiglă"><rect width="400" height="300" fill="#dce8f4"/><rect y="235" width="400" height="65" fill="#b9cfe3"/><path d="M50 160 200 60l150 100Z" fill="#0a5ba8"/><path d="M95 130h210M125 110h150M155 90h90" stroke="#08498a" stroke-width="4"/><rect x="80" y="158" width="240" height="80" fill="#fff"/><path d="M80 158h240" stroke="#0f1e2e" stroke-width="6"/><rect x="110" y="178" width="36" height="30" fill="#16293d"/><rect x="254" y="178" width="36" height="30" fill="#16293d"/></svg>' }
];

const pages = {};

// ---------- Pagina de start ----------
const preview = ['casa-cheie', 'renovare', 'acoperis', 'termosistem'].map(id => LIST.find(s => s.id === id));
pages['index.html'] = layout({
  depth: 0, active: '',
  title: 'ANADRI – Construcții case, renovări și acoperișuri în Timiș | Preț clar pe m²',
  description: 'Construim case de la roșu la cheie, renovăm și facem acoperișuri în Timiș și Banat. Calculează prețul orientativ în lei și cere o vizită gratuită.',
  body: `<section class="hero${HERO_VIDEO ? ' hero--video' : ''}" aria-labelledby="hero-title">${HERO_VIDEO ? `<video class="hero-video" autoplay muted loop playsinline preload="metadata"${HERO_VIDEO.poster ? ` poster="./${HERO_VIDEO.poster}"` : ''} aria-hidden="true" tabindex="-1"><source src="./${HERO_VIDEO.src}" type="video/mp4"></video>` : ''}
    <div class="container hero__inner">
      <div class="hero__text">
        <span class="hero__eyebrow">Construcții · Timiș și Banat</span>
        <h1 id="hero-title">Casa ta, de la roșu la cheie. Cu preț clar din prima zi.</h1>
        <p>Construim, renovăm și acoperim case cu aceeași echipă, de la fundație până la cheie. Vezi estimarea în lei în 2 minute, apoi venim gratuit la măsurători.</p>
        <div class="hero__btns">
          <a class="btn btn--red" href="./calculator/">Calculează prețul</a>
          <a class="btn btn--light" href="#contact">Vreau o vizită gratuită</a>
        </div>
      </div>
    </div>
  </section>

  <section class="trust" aria-label="De ce ANADRI">
    <div class="container trust__grid">
      <div><b>Preț pe m², în lei</b><span>Știi de la început cât te costă</span></div>
      <div><b>Vizită gratuită</b><span>Măsurăm și te sfătuim la fața locului</span></div>
      <div><b>O singură echipă</b><span>De la fundație la finisaje</span></div>
      <div><b>Firmă din 2014</b><span>Biled, Timiș · CUI 32724443</span></div>
    </div>
  </section>

  <section class="section" id="servicii" aria-labelledby="servicii-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="servicii-title">Ce construim pentru tine</h2>
          <p class="section-sub">Prețuri orientative pentru manoperă, pe metru pătrat. Oferta fermă o primești după ce vedem terenul sau casa.</p>
        </div>
        <a class="btn btn--ghost" href="./calculator/">Deschide calculatorul</a>
      </div>
      ${serviceCards('./')}
      <p class="note" style="margin-top:16px">Prețurile nu includ materialele și TVA. Depind de proiect, teren, acces și stadiul ales.</p>
    </div>
  </section>

  <section class="section--white" id="cum-lucram" aria-labelledby="cum-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="cum-title">Cum lucrăm</h2>
          <p class="section-sub">Patru pași simpli, fără surprize pe drum.</p>
        </div>
      </div>
      ${stepsList()}
    </div>
  </section>

  <section class="section" aria-labelledby="dece-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="dece-title">De ce ANADRI</h2>
          <p class="section-sub">Lucrăm așa cum am vrea să se lucreze la casa noastră.</p>
        </div>
      </div>
      <div class="values">
        <div class="value"><h3>Fără costuri ascunse</h3><p>Prețul pe m² îl vezi online, oferta scrisă o ai înainte să începem. Ce e în ofertă, aia plătești.</p></div>
        <div class="value"><h3>Un singur om de contact</h3><p>Nu alergi după zidar, electrician și acoperitor. Coordonăm noi toate echipele.</p></div>
        <div class="value"><h3>Termene respectate</h3><p>Calendarul lucrării e în ofertă. Te anunțăm din timp dacă vremea sau avizele schimbă ceva.</p></div>
        <div class="value"><h3>Șantier curat</h3><p>Protejăm ce e deja făcut, strângem molozul și predăm curat.</p></div>
      </div>
    </div>
  </section>

  <section class="section--white" id="lucrari" aria-labelledby="lucrari-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="lucrari-title">Tipuri de lucrări</h2>
          <p class="section-sub">Exemple de lucrări pe care le executăm. Fotografii din proiecte reale și referințe de la clienți primești la cerere.</p>
        </div>
      </div>
      <div class="refs">${EXEMPLE.map(e => `
        <article class="ref">
          <div class="ref__img">${e.svg}<span class="ref__flag">Exemplu</span></div>
          <div class="ref__body">
            <h3>${esc(e.titlu)}</h3>
            <p class="ref__meta">${esc(e.meta)}</p>
            <p>${esc(e.text)}</p>
            <ul class="ref__tags">${e.tags.map(t => `<li><a href="#servicii">${esc(t)}</a></li>`).join('')}</ul>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="faq-title">
    <div class="container">
      <h2 class="section-title" id="faq-title">Întrebări frecvente</h2>
      <p class="section-sub">Ce ne întreabă cel mai des clienții.</p>
      <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="section--white" id="zone" aria-labelledby="zone-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="zone-title">Lucrăm în Timiș și Arad</h2>
          <p class="section-sub">Sediul e în Biled, la 27 km de Timișoara și la o oră de Arad. Vizita la fața locului e gratuită în ambele județe.</p>
        </div>
        <a class="btn btn--ghost" href="./zone/">Toate localitățile</a>
      </div>
      <div class="zone-grid">${['timis', 'arad'].map(j => `
        <div class="zone-col">
          <h3><a href="./zone/${j}/">Județul ${esc(JUDETE[j].nume)}</a></h3>
          <ul class="chips">${byJudet(j).slice(0, 12).map(l => `<li><a href="./zone/${j}/${l.slug}/">${esc(l.nume)}</a></li>`).join('')}<li><a class="chips__more" href="./zone/${j}/">+ încă ${byJudet(j).length - 12}</a></li></ul>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section" id="contact" aria-labelledby="contact-title">
    <div class="container">
      <div class="section-head">
        <div>
          <h2 class="section-title" id="contact-title">Cere o vizită gratuită</h2>
          <p class="section-sub">Descrie pe scurt proiectul. Revenim cu un telefon în cel mult 2 zile lucrătoare.</p>
        </div>
      </div>
      <div class="layout">
        <section class="card" aria-label="Formular de contact">
          <p class="sent" data-sent role="status" hidden><b>Mulțumim!</b> Solicitarea a ajuns la noi. Te sunăm în curând.</p>
          <form action="https://formsubmit.co/${EMAIL}" method="POST" data-formsubmit data-anchor="#contact">
            ${formHidden('Cerere vizită – anadri.ro')}
            <div class="form-grid form-grid--2">
              <div class="field"><label for="c-nume">Nume / Firmă</label><input id="c-nume" type="text" name="Nume" required maxlength="120" autocomplete="name"></div>
              <div class="field"><label for="c-tel">Telefon</label><input id="c-tel" type="tel" name="Telefon" required maxlength="30" autocomplete="tel"></div>
              <div class="field"><label for="c-email">E-mail</label><input id="c-email" type="email" name="email" required maxlength="160" autocomplete="email"></div>
              <div class="field"><label for="c-loc">Localitatea lucrării</label><input id="c-loc" type="text" name="Localitate" required maxlength="120"></div>
              <div class="field full"><label for="c-serviciu">Lucrarea</label>
                <select id="c-serviciu" name="Lucrare" required>
                  <option value="">Alege…</option>
                  ${LIST.map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('\n                  ')}
                  <option value="Mai multe lucrări">Mai multe lucrări</option>
                  <option value="Altceva">Altceva</option>
                </select>
              </div>
              <div class="field full"><label for="c-msg">Despre proiect</label><textarea id="c-msg" name="Mesaj" required maxlength="3000" placeholder="Suprafață aproximativă, stadiul dorit (roșu / gri / la cheie), când vrei să începi…"></textarea></div>
              ${consent('./')}
              <button class="btn btn--red full" type="submit">Trimite cererea</button>
            </div>
          </form>
        </section>
        <aside class="calc">
          <div class="calc__head"><div class="calc__label">Contact direct</div></div>
          <dl class="info-list">
            <div><dt>Firma</dt><dd>${FIRMA}</dd></div>
            <div><dt>Adresa</dt><dd>${ADRESA}</dd></div>
            <div><dt>E-mail</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
            <div><dt>Telefon</dt><dd>${TEL ? `<a href="tel:${TEL.replace(/\s/g, '')}">${TEL}</a>` : '<span class="todo">urmează</span>'}</dd></div>
          </dl>
          <p class="calc__disclaimer" style="margin-top:18px">Vrei întâi o idee de preț?</p>
          <a class="cta" href="./calculator/">Deschide calculatorul</a>
        </aside>
      </div>
    </div>
  </section>

  <div class="container">${ctaBand('./')}</div>`
});

// ---------- Calculator ----------
pages['calculator/index.html'] = layout({
  depth: 1, active: 'calculator', pagePath: 'calculator/',
  title: 'Calculator preț construcții și renovări – lei/m² | ANADRI',
  description: 'Alege lucrările, introdu suprafața și vezi pe loc prețul orientativ în lei pentru manoperă. Trimite estimarea și primești o vizită gratuită.',
  scripts: ['servicii.js', 'calculator.js'],
  body: `<div class="container page-head">
    <nav class="crumbs" aria-label="Cale"><a href="../">Acasă</a> / Calculator</nav>
    <h1>Cât costă? Află în 2 minute.</h1>
    <p class="lead">Bifează lucrările, scrie suprafața și vezi pe loc estimarea în lei. Dacă îți convine, ne-o trimiți cu un clic și venim gratuit la măsurători.</p>
  </div>
  <div class="container">
    <div class="rechner">
      <section class="card" aria-labelledby="input-title">
        <h2 id="input-title">Alege lucrările</h2>
        <p class="hint">Prețuri pe m² pentru manoperă, fără materiale și TVA. La casa nouă alegi un singur stadiu: roșu, gri sau la cheie.</p>
        <div id="services"></div>
      </section>

      <section class="calc" id="rezultat" aria-labelledby="result-title">
        <div class="calc__head"><div class="calc__label" id="result-title">Estimare de preț</div><span class="badge">Orientativ</span></div>
        <p class="calc__top">Doar manoperă – materialele și TVA nu sunt incluse.</p>
        <p class="sent" data-sent role="status" hidden><b>Mulțumim!</b> Estimarea a ajuns la noi. Te sunăm în curând pentru vizita gratuită.</p>
        <div aria-live="polite">
          <p class="calc__empty" id="empty">Alege cel puțin o lucrare ca să vezi estimarea</p>
          <div id="result" hidden>
            <div class="calc__value" id="total">0 lei</div>
            <p class="calc__sub">Preț mediu, din prețurile orientative</p>
            <p class="calc__range">Interval: <b id="range">0 lei – 0 lei</b></p>
            <div class="margin-box"><div>Cu marjă de negociere (±10%)</div><b id="margin">0 lei – 0 lei</b></div>
            <ul class="breakdown" id="breakdown"></ul>
          </div>
        </div>
        <p class="calc__disclaimer">Prețul final depinde de proiect, teren, acces, stadiul lucrării și finisajele alese. Îl confirmăm după vizită.</p>

        <form class="send" id="send" action="https://formsubmit.co/${EMAIL}" method="POST" data-formsubmit data-anchor="#rezultat" hidden>
          <h3>Îți convine prețul?</h3>
          <p>Trimite-ne estimarea și te sunăm pentru o vizită gratuită. Primești și tu o copie pe e-mail.</p>
          ${formHidden('Calculator anadri.ro – estimare nouă')}
          <input type="hidden" name="_autoresponse" id="f-auto">
          <input type="hidden" name="Lucrări" id="f-lucrari">
          <input type="hidden" name="Estimare (mediu)" id="f-total">
          <input type="hidden" name="Interval" id="f-range">
          <input type="hidden" name="Marjă ±10%" id="f-margin">
          <div class="form-grid form-grid--2">
            <div class="field"><label for="f-nume">Nume</label><input id="f-nume" type="text" name="Nume" required maxlength="120" autocomplete="name"></div>
            <div class="field"><label for="f-tel">Telefon</label><input id="f-tel" type="tel" name="Telefon" required maxlength="30" autocomplete="tel"></div>
            <div class="field"><label for="f-email">E-mail</label><input id="f-email" type="email" name="email" required maxlength="160" autocomplete="email"></div>
            <div class="field"><label for="f-loc">Localitatea lucrării</label><input id="f-loc" type="text" name="Localitate" required maxlength="120"></div>
            <div class="field full"><label for="f-msg">Mesaj <small>(opțional)</small></label><textarea id="f-msg" name="Mesaj" maxlength="2000" rows="3" placeholder="ex. teren în Biled, vreau să încep în primăvară…"></textarea></div>
            ${consent('../')}
            <button class="cta full" type="submit">Trimite estimarea și cere vizita</button>
          </div>
        </form>
      </section>
    </div>
    ${ctaBand('../')}
  </div>

  <div class="mobile-bar" id="mobile-bar" hidden>
    <div><small>Estimarea ta</small><b id="bar-total">0 lei</b></div>
    <a href="#rezultat">Vezi și trimite</a>
  </div>`
});

// ---------- Pagini locale: /zone/, /zone/<judet>/, /zone/<judet>/<localitate>/ ----------
const PROFIL = {
  metropola: {
    titlu: 'Apartamente, case și vile',
    text: l => `În ${l.nume} lucrăm atât la apartamente în blocuri (renovare completă, instalații noi, băi, gips-carton, zugrăveli), cât și la case: de la construcție la roșu pe loturile noi de la marginea orașului până la mansardări și termosistem la casele mai vechi.`,
    lucrari: ['renovare', 'electrice', 'sanitare', 'finisaje', 'zugraveli', 'casa-cheie', 'termosistem']
  },
  periurban: {
    titlu: 'Case noi pentru familii',
    text: l => `${l.nume} e o zonă în care se construiește mult. Ridicăm case la roșu, la gri sau la cheie pe loturi noi, facem extinderi și mansardări la casele de după 2000 și termosistem la cele mai vechi. Fiind aproape de Biled, echipa ajunge repede, iar șantierul e urmărit zilnic.`,
    lucrari: ['casa-rosu', 'casa-gri', 'casa-cheie', 'acoperis', 'termosistem', 'finisaje']
  },
  oras: {
    titlu: 'Renovări și case de oraș',
    text: l => `În ${l.nume} cererea e mai ales pentru renovarea caselor vechi de cărămidă și a apartamentelor: acoperișuri noi, termosistem pe fațadă, instalații electrice și sanitare refăcute, băi și finisaje. Construim și case noi, de la fundație la cheie.`,
    lucrari: ['renovare', 'acoperis', 'termosistem', 'electrice', 'sanitare', 'casa-cheie']
  },
  rural: {
    titlu: 'Case de sat renovate temeinic',
    text: l => `În ${l.nume} lucrăm cel mai des la casele tradiționale de cărămidă: schimbăm acoperișul și șarpanta, punem termosistem, refacem instalațiile și băile, turnăm șape și montăm finisaje noi. Păstrăm ce e solid și înlocuim ce nu mai ține.`,
    lucrari: ['acoperis', 'termosistem', 'renovare', 'sanitare', 'electrice', 'zugraveli']
  }
};
const svcById = Object.fromEntries(LIST.map(s => [s.id, s]));
const minute = km => Math.max(5, Math.round(km / 55 * 60 / 5) * 5);
const distText = l => l.km === 0 ? 'Sediul nostru este chiar în ' + l.nume + '.' : `${l.nume} se află la aproximativ ${l.km} km de sediul nostru din Biled – cam ${minute(l.km)} minute cu mașina.`;
const tipArt = l => l.tip === 'municipiu' ? 'municipiul' : l.tip === 'oraș' ? 'orașul' : 'comuna';
const vecini = l => byJudet(l.judet).filter(o => o.slug !== l.slug).map(o => ({ o, d: Math.abs(o.km - l.km) + (o.profil === l.profil ? 0 : 8) })).sort((a, b) => a.d - b.d).slice(0, 6).map(x => x.o);

function locPage(l) {
  const J = JUDETE[l.judet], P = PROFIL[l.profil];
  const lucrari = P.lucrari.map(id => svcById[id]).filter(Boolean);
  const url = `zone/${l.judet}/${l.slug}/`;
  const title = `Construcții și renovări în ${l.nume}, jud. ${J.nume} – prețuri în lei/m² | ANADRI`;
  const description = `Construcții de case (roșu, gri, la cheie), renovări, acoperișuri și termosistem în ${l.nume}, județul ${J.nume}. Prețuri orientative în lei pe m², vizită gratuită la fața locului.`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: `Construcții și renovări în ${l.nume}`, serviceType: 'Construcții și renovări', provider: { '@type': 'HomeAndConstructionBusiness', name: 'ANADRI Construcții', url: SITE_URL + '/ro/' }, areaServed: { '@type': l.tip === 'comună' ? 'AdministrativeArea' : 'City', name: l.nume, containedInPlace: { '@type': 'AdministrativeArea', name: 'Județul ' + J.nume } }, url: `${SITE_URL}/ro/${url}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Acasă', item: SITE_URL + '/ro/' },
      { '@type': 'ListItem', position: 2, name: 'Zone', item: SITE_URL + '/ro/zone/' },
      { '@type': 'ListItem', position: 3, name: 'Județul ' + J.nume, item: `${SITE_URL}/ro/zone/${l.judet}/` },
      { '@type': 'ListItem', position: 4, name: l.nume, item: `${SITE_URL}/ro/${url}` }] }
  ];
  return layout({
    depth: 3, active: 'zone', pagePath: url, title, description,
    body: `<div class="container page-head">
    <nav class="crumbs" aria-label="Cale"><a href="../../../">Acasă</a> / <a href="../../">Zone</a> / <a href="../">Județul ${esc(J.nume)}</a> / ${esc(l.nume)}</nav>
    <h1>Construcții și renovări în ${esc(l.nume)}</h1>
    <p class="lead">${esc(distText(l))} Construim case de la roșu la cheie, renovăm și facem acoperișuri în ${tipArt(l)} ${esc(l.nume)} și în satele din jur – cu preț clar pe metru pătrat și vizită gratuită.</p>
  </div>
  <div class="container">
    <div class="layout">
      <article class="card">
        <section>
          <h2>${esc(P.titlu)}</h2>
          <p>${esc(P.text(l))}</p>
          <p class="note">${esc(l.nota)}</p>
        </section>
        <section>
          <h2>Ce facem cel mai des în ${esc(l.nume)}</h2>
          <ul class="checks">${lucrari.map(s => `<li><a href="../../../calculator/?serviciu=${s.id}#rezultat"><b>${esc(s.name)}</b></a> – ${esc(s.desc)}. <span class="muted">${nf.format(s.min)}–${nf.format(s.max)} lei/m² manoperă</span></li>`).join('')}</ul>
        </section>
        <section>
          <h2>Întrebări frecvente – ${esc(l.nume)}</h2>
          <div class="faq">
            <details><summary>Veniți gratuit la vizită în ${esc(l.nume)}?</summary><p>Da. ${esc(distText(l))} Vizita și măsurătorile sunt gratuite în tot județul ${esc(J.nume)}, fără obligații.</p></details>
            <details><summary>Cât costă manopera pentru o casă nouă în ${esc(l.nume)}?</summary><p>Orientativ: la roșu ${nf.format(svcById['casa-rosu'].min)}–${nf.format(svcById['casa-rosu'].max)} lei/m², la gri ${nf.format(svcById['casa-gri'].min)}–${nf.format(svcById['casa-gri'].max)} lei/m², la cheie ${nf.format(svcById['casa-cheie'].min)}–${nf.format(svcById['casa-cheie'].max)} lei/m² (manoperă, fără materiale și TVA). Prețul ferm îl primești în oferta scrisă, după vizită.</p></details>
            <details><summary>Lucrați și în satele de lângă ${esc(l.nume)}?</summary><p>Da, lucrăm în toată zona: ${vecini(l).map(o => esc(o.nume)).join(', ')} și restul județului ${esc(J.nume)}.</p></details>
          </div>
        </section>
      </article>
      <aside class="calc">
        <div class="calc__head"><div class="calc__label">Estimare rapidă</div><span class="badge">Orientativ</span></div>
        <p class="calc__top">Prețuri pentru manoperă, în lei/m², valabile și în ${esc(l.nume)}.</p>
        <dl class="info-list">${lucrari.slice(0, 4).map(s => `<div><dt>${esc(s.name)}</dt><dd>${nf.format(s.min)}–${nf.format(s.max)} lei/m²</dd></div>`).join('')}</dl>
        <p class="calc__disclaimer" style="margin-top:18px">Alege lucrările și suprafața, vezi totalul pe loc și trimite-ni-l.</p>
        <a class="cta" href="../../../calculator/">Calculează prețul pentru ${esc(l.nume)}</a>
        <a class="calc__more" href="../../../#contact">Sau cere direct o vizită gratuită →</a>
      </aside>
    </div>

    <section class="section" aria-labelledby="vecini-title">
      <h2 class="section-title" id="vecini-title">Localități apropiate</h2>
      <div class="tiles">${vecini(l).map(o => `<a class="tile" href="../${o.slug}/">${esc(o.nume)} <span>${o.tip} · ~${o.km} km de Biled</span></a>`).join('')}</div>
    </section>
    ${ctaBand('../../../')}
  </div>
  <script type="application/ld+json">${JSON.stringify(ld)}</script>`
  });
}

function judetPage(j) {
  const J = JUDETE[j], list = byJudet(j);
  const grupuri = [['municipiu', 'Municipii'], ['oraș', 'Orașe'], ['comună', 'Comune']].map(([tip, label]) => [label, list.filter(l => l.tip === tip)]).filter(g => g[1].length);
  return layout({
    depth: 2, active: 'zone', pagePath: `zone/${j}/`,
    title: `Construcții și renovări în județul ${J.nume} – ${list.length} localități | ANADRI`,
    description: `Construim și renovăm case în ${list.length} localități din județul ${J.nume}: ${list.slice(0, 6).map(l => l.nume).join(', ')} și altele. Prețuri în lei/m², vizită gratuită.`,
    body: `<div class="container page-head">
    <nav class="crumbs" aria-label="Cale"><a href="../../">Acasă</a> / <a href="../">Zone</a> / Județul ${esc(J.nume)}</nav>
    <h1>Construcții și renovări în județul ${esc(J.nume)}</h1>
    <p class="lead">${j === 'timis' ? 'Suntem din Biled, în inima județului, la 27 km de Timișoara.' : 'Din Biled ajungem în Arad într-o oră, iar în comunele de pe Mureș și mai repede.'} Alege localitatea ta pentru detalii, prețuri și specificul lucrărilor din zonă.</p>
  </div>
  <div class="container">
    ${grupuri.map(([label, ls]) => `<section class="section" style="padding-top:8px"><h2 class="section-title">${label}</h2><div class="tiles">${ls.sort((a, b) => a.km - b.km).map(l => `<a class="tile" href="${l.slug}/">${esc(l.nume)} <span>~${l.km} km de Biled</span></a>`).join('')}</div></section>`).join('')}
    ${ctaBand('../../')}
  </div>`
  });
}

pages['zone/index.html'] = layout({
  depth: 1, active: 'zone', pagePath: 'zone/',
  title: `Zone deservite – construcții și renovări în Timiș și Arad (${LOCALITATI.length} localități) | ANADRI`,
  description: `ANADRI construiește și renovează case în ${LOCALITATI.length} localități din județele Timiș și Arad. Sediul în Biled, vizită gratuită în ambele județe.`,
  body: `<div class="container page-head">
    <nav class="crumbs" aria-label="Cale"><a href="../">Acasă</a> / Zone</nav>
    <h1>Unde lucrăm: Timiș și Arad</h1>
    <p class="lead">Sediul nostru e în Biled, județul Timiș. Lucrăm în toată zona de câmpie dintre Timișoara și Arad, la granița cu Ungaria și Serbia, și până la dealurile din est. Vizita la fața locului e gratuită în ambele județe.</p>
  </div>
  <div class="container">
    <div class="zone-grid">${['timis', 'arad'].map(j => `
      <div class="zone-col card">
        <h2><a href="${j}/">Județul ${esc(JUDETE[j].nume)}</a> <small>${byJudet(j).length} localități</small></h2>
        <ul class="chips">${byJudet(j).sort((a, b) => a.km - b.km).map(l => `<li><a href="${j}/${l.slug}/">${esc(l.nume)}</a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
    ${ctaBand('../')}
  </div>`
});
for (const j of Object.keys(JUDETE)) pages[`zone/${j}/index.html`] = judetPage(j);
for (const l of LOCALITATI) pages[`zone/${l.judet}/${l.slug}/index.html`] = locPage(l);

for (const [file, html] of Object.entries(pages)) {
  const out = path.join(RO, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
console.log(Object.keys(pages).length + ' pagini RO scrise');

// sitemap.xml + robots.txt: vezi tools/build-sitemap.cjs (acoperă ro/ și at/)
if (false) {
// ---------- (vechi) sitemap.xml + robots.txt ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [];
const add = (loc, priority, changefreq = 'monthly') => urls.push({ loc, priority, changefreq });
add(`${SITE_URL}/`, '0.5');
add(`${SITE_URL}/ro/`, '1.0', 'weekly');
add(`${SITE_URL}/ro/calculator/`, '0.9', 'monthly');
add(`${SITE_URL}/ro/zone/`, '0.8');
for (const j of Object.keys(JUDETE)) add(`${SITE_URL}/ro/zone/${j}/`, '0.7');
for (const l of LOCALITATI) add(`${SITE_URL}/ro/zone/${l.judet}/${l.slug}/`, '0.6');
add(`${SITE_URL}/ro/politica-confidentialitate.html`, '0.2', 'yearly');
add(`${SITE_URL}/ro/politica-cookies.html`, '0.2', 'yearly');
// paginile germane existente (același host)
const AT = path.join(ROOT, 'at');
const walkAt = (dir, rel = '') => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walkAt(p, rel + f + '/'); else if (f === 'index.html' && !/impressum|datenschutz/.test(rel)) add(`${SITE_URL}/at/${rel}`, rel === '' ? '0.9' : '0.6'); } };
if (fs.existsSync(AT)) walkAt(AT);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /at/assets/hero-images/Renovari/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length} URL-uri · robots.txt scris`);
}
