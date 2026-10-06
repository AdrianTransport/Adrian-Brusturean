// sitemap.xml + robots.txt pentru tot site-ul (ro/ și at/). Rulează după build-ro.cjs și build-at.cjs:
//   node tools/build-sitemap.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://adrianbrusturean.netlify.app'; // de schimbat când se leagă domeniul propriu
const today = new Date().toISOString().slice(0, 10);
const SKIP = /impressum|datenschutz|politica-|assets/;

const urls = [];
const add = (loc, priority, changefreq = 'monthly') => urls.push({ loc, priority, changefreq });

function prio(rel) {
  if (rel === 'ro/' || rel === 'at/') return ['1.0', 'weekly'];
  if (/calculator|kalkulator/.test(rel)) return ['0.9', 'monthly'];
  if (/^(ro\/zone|at\/regionen)\/[^/]+\/[^/]+\/$/.test(rel)) return ['0.6', 'monthly'];   // localitate
  if (/^(ro\/zone|at\/regionen)\//.test(rel)) return ['0.7', 'monthly'];                  // index zonă/regiune
  return ['0.7', 'monthly'];
}
function walk(dir, rel) {
  for (const f of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (!SKIP.test(f)) walk(p, rel + f + '/'); }
    else if (f === 'index.html' && !SKIP.test(rel)) { const [pr, cf] = prio(rel); add(SITE_URL + '/' + rel, pr, cf); }
  }
}
add(SITE_URL + '/', '0.5');
for (const site of ['ro', 'at']) if (fs.existsSync(path.join(ROOT, site))) walk(path.join(ROOT, site), site + '/');
add(SITE_URL + '/ro/politica-confidentialitate.html', '0.2', 'yearly');
add(SITE_URL + '/ro/politica-cookies.html', '0.2', 'yearly');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /at/assets/hero-images/Renovari/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const n = k => urls.filter(u => u.loc.includes('/' + k + '/')).length;
console.log(`sitemap.xml: ${urls.length} URL-uri (ro: ${n('ro')}, at: ${n('at')}) · robots.txt scris`);
