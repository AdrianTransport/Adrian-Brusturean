// Prețuri orientative pentru România – MANOPERĂ, lei/m², fără TVA și fără materiale.
// Singura sursă pentru calculator și pentru paginile românești. Modifică aici, apoi: node tools/build-ro.cjs
// grup: 'casa' = stadiile unei case noi; se alege un singur stadiu.
window.ANADRI_SERVICII = [
  { id: 'casa-rosu',  grup: 'casa', name: 'Casă nouă – la roșu',   min: 900,  max: 1100, ph: 'ex. 120',
    desc: 'Fundație, structură, zidărie, planșee și șarpantă – scheletul casei', baza: 'suprafață construită' },
  { id: 'casa-gri',   grup: 'casa', name: 'Casă nouă – la gri',    min: 1050, max: 1300, ph: 'ex. 120',
    desc: 'La roșu + învelitoare, tâmplărie, tencuieli, șape și instalații brute', baza: 'suprafață construită' },
  { id: 'casa-cheie', grup: 'casa', name: 'Casă nouă – la cheie',  min: 1300, max: 1600, ph: 'ex. 120',
    desc: 'La gri + finisaje complete, obiecte sanitare, prize, uși – gata de locuit', baza: 'suprafață construită' },
  { id: 'renovare',   name: 'Renovare interioară completă', min: 700, max: 1100, ph: 'ex. 80',
    desc: 'Demolări, instalații noi, compartimentări, finisaje – apartament sau casă', baza: 'suprafață utilă' },
  { id: 'acoperis',   name: 'Acoperiș',                     min: 600, max: 900,  ph: 'ex. 150',
    desc: 'Șarpantă, astereală, folie, învelitoare, jgheaburi și burlane', baza: 'suprafața acoperișului' },
  { id: 'termosistem', name: 'Termosistem fațadă',          min: 80,  max: 130,  ph: 'ex. 180',
    desc: 'Polistiren sau vată, plasă, adeziv, tencuială decorativă', baza: 'suprafața fațadei' },
  { id: 'electrice',  name: 'Instalații electrice',          min: 100, max: 180,  ph: 'ex. 100',
    desc: 'Trasee noi, doze, prize, întrerupătoare, tablou electric', baza: 'suprafață utilă' },
  { id: 'sanitare',   name: 'Instalații sanitare',           min: 90,  max: 170,  ph: 'ex. 100',
    desc: 'Apă, canalizare, montaj obiecte sanitare, centrală și calorifere', baza: 'suprafață utilă' },
  { id: 'finisaje',   name: 'Gresie, faianță, parchet',      min: 70,  max: 120,  ph: 'ex. 60',
    desc: 'Montaj gresie și faianță, parchet, plinte, profile', baza: 'suprafața montată' },
  { id: 'zugraveli',  name: 'Gips-carton și zugrăveli',      min: 40,  max: 80,   ph: 'ex. 250',
    desc: 'Pereți și tavane din gips-carton, glet, amorsă, lavabilă', baza: 'suprafața pereților și tavanelor' }
];
window.ANADRI_EMAIL = 'info@anadri.ro';
window.ANADRI_TEL = '';   // completează: '+40 7xx xxx xxx'
