// Opdeler lejelovens tekst (fra n8n "Extract From File" → PDF) i stykker.
// Bruges i n8n Code-noden "Opdel i stykker" (mode: Run Once for All Items).
// Input:  $json.text  (hele PDF'ens tekst)
// Output: ét item pr. stykke med kapitel, paragraf, stk, tekst, kilde og henviser_til.

const KILDE_URL = 'https://www.retsinformation.dk/eli/lta/2022/341';

const RE_KAPITEL = /^Kapitel (\d+(?: ?[A-Z])?)\s*$/;
const RE_PARAGRAF = /^§ (\d+)(?: ([a-z]))?\.\s*(.*)$/;
const RE_STK = /^Stk\. (\d+)\.\s*(.*)$/;
const RE_STOEJ = /^(Udskriftsdato:.*|(LBK|LOV) nr \d+ af \d{2}\/\d{2}\/\d{4}.*|\d+)$/;
const RE_HENVISNING = /§§? ?(\d+)(?: ([a-z])(?!\p{L}))?(?:-(\d+))?/gu;

function opdel(tekst) {
  tekst = tekst.replace(/­/g, '-');
  tekst = tekst.replace(/(\p{L})-[ \t]*\n[ \t]*([a-zæøå])/gu, '$1$2'); // orddeling ved linjeskift
  tekst = tekst.split('Givet på Christiansborg')[0];                      // fjern underskrift

  const linjer = tekst.split('\n').map(l => l.trim()).filter(l => l && !RE_STOEJ.test(l));

  const poster = [];
  let kapitelNr = null, kapitelTitel = null, overskrift = null, aktuel = null;
  let sidstePar = [0, ''];
  let ventPaaTitel = false;

  const stoerre = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  const gem = () => {
    if (aktuel && aktuel.tekst.trim()) {
      aktuel.tekst = aktuel.tekst.replace(/\s+/g, ' ').trim();
      poster.push(aktuel);
    }
  };
  const nyPost = (par, stk, tekst) => ({
    id: `§${par.replace(' ', '')}-stk${stk}`,
    lov: 'Lejeloven',
    kapitel: kapitelNr,
    kapitel_titel: kapitelTitel,
    overskrift,
    paragraf: par,
    stk,
    tekst,
    kilde: KILDE_URL,
  });

  for (let i = 0; i < linjer.length; i++) {
    const linje = linjer[i];

    let m = linje.match(RE_KAPITEL);
    if (m) { gem(); aktuel = null; kapitelNr = m[1].replace(' ', ''); ventPaaTitel = true; continue; }
    if (ventPaaTitel) { kapitelTitel = linje; ventPaaTitel = false; continue; }

    // Ny paragraf: nummeret skal være større end det forrige og tæt på (loven er fortløbende)
    m = linje.match(RE_PARAGRAF);
    const ny = m ? [parseInt(m[1]), m[2] || ''] : null;
    if (m && stoerre(ny, sidstePar) && ny[0] - sidstePar[0] <= 3) {
      if (aktuel) {
        const forrige = linjer[i - 1];
        if (forrige.length < 70 && !/[.,;:]$/.test(forrige) && aktuel.tekst.endsWith(forrige)) {
          aktuel.tekst = aktuel.tekst.slice(0, -forrige.length).trim(); // mellemoverskrift
          overskrift = forrige;
        } else {
          overskrift = null;
        }
      }
      gem();
      const nr = m[1] + (m[2] ? ` ${m[2]}` : '');
      sidstePar = ny;
      aktuel = nyPost(nr, 1, m[3]);
      continue;
    }

    m = linje.match(RE_STK);
    if (m && aktuel && parseInt(m[1]) === aktuel.stk + 1) {
      gem();
      const par = aktuel.paragraf, ov = aktuel.overskrift;
      overskrift = ov;
      aktuel = nyPost(par, parseInt(m[1]), m[2]);
      continue;
    }

    if (aktuel) aktuel.tekst += ' ' + linje;
    else overskrift = linje; // tekst mellem kapiteltitel og første § = mellemoverskrift
  }
  gem();

  // Henvisninger til andre paragraffer (inkl. intervaller som "§§ 60-61")
  for (const p of poster) {
    const refs = new Set();
    for (const [, nr, bog, til] of p.tekst.matchAll(RE_HENVISNING)) {
      const numre = [nr + (bog ? ` ${bog}` : '')];
      if (til && +til > +nr && +til - +nr < 30) for (let n = +nr + 1; n <= +til; n++) numre.push(String(n));
      numre.filter(r => r !== p.paragraf).forEach(r => refs.add(r));
    }
    p.henviser_til = [...refs].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b));
  }
  return poster;
}

// --- n8n ---
if (typeof $input !== 'undefined') {
  return opdel($input.first().json.text).map(p => ({ json: p }));
}
module.exports = { opdel };
