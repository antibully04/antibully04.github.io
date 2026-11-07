/* Pemeriksaan layout terukur: overflow, tumpang tindih, ukuran target sentuh. */
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8777/';
const issues = [];
const note = [];

async function check(page, label) {
  const r = await page.evaluate(() => {
    const out = { overflowX: false, clipped: [], smallTaps: [], overlaps: [] };
    out.overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;

    // elemen teks yang terpotong horizontal
    for (const el of document.querySelectorAll('h1,h2,h3,p,button,b,small,span,em')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        const t = (el.textContent || '').trim().slice(0, 40);
        if (t && cs.overflow !== 'visible') out.clipped.push(`${el.tagName}: ${t}`);
      }
    }

    // target sentuh < 44px
    for (const el of document.querySelectorAll('button')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;
      if (b.height < 44 || b.width < 44) {
        out.smallTaps.push(
          `${(el.textContent || el.getAttribute('aria-label') || '?').trim().slice(0, 24)} ${Math.round(b.width)}x${Math.round(b.height)}`
        );
      }
    }

    // elemen utama saling tumpang tindih (kartu/opsi)
    const boxes = [...document.querySelectorAll('.card,.opt,.list-btn,.menu-card,.sort-item,.feedback,.character-stage')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter((x) => x.r.width > 0);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].r, b2 = boxes[j].r;
        const ov = !(a.right <= b2.left + 1 || b2.right <= a.left - 1 || a.bottom <= b2.top + 1 || b2.bottom <= a.top - 1);
        if (ov) {
          out.overlaps.push(
            `${boxes[i].el.className.split(' ')[0]} ↔ ${boxes[j].el.className.split(' ')[0]}`
          );
        }
      }
    }
    return out;
  });

  if (r.overflowX) issues.push(`[${label}] overflow horizontal`);
  r.clipped.slice(0, 5).forEach((c) => issues.push(`[${label}] teks terpotong: ${c}`));
  r.smallTaps.slice(0, 6).forEach((c) => note.push(`[${label}] target kecil: ${c}`));
  r.overlaps.slice(0, 5).forEach((c) => issues.push(`[${label}] tumpang tindih: ${c}`));
  return r;
}

(async () => {
  const b = await chromium.launch();

  for (const vp of [
    { width: 320, height: 640, name: '320px' },
    { width: 390, height: 844, name: '390px' },
    { width: 768, height: 1024, name: '768px' },
    { width: 1280, height: 900, name: '1280px' },
  ]) {
    const p = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForSelector('#boot.done', { state: 'attached' });
    await check(p, `home/${vp.name}`);

    await p.click('[data-go="edukasi"]');
    await p.waitForSelector('[data-topic]');
    await check(p, `edukasi/${vp.name}`);

    await p.click('[data-topic="kenali"]');
    await p.waitForSelector('.prose');
    await check(p, `topik/${vp.name}`);

    await p.goto(BASE + '#c', { waitUntil: 'networkidle' });
    await p.waitForSelector('#boot.done', { state: 'attached' });
    await p.click('[data-go="cerita"]');
    await p.click('[data-story="julukan"]');
    await p.waitForSelector('.opt');
    await p.click('[data-choice="1"]');
    await p.waitForTimeout(200);
    await check(p, `cerita-feedback/${vp.name}`);

    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForSelector('#boot.done', { state: 'attached' });
    await p.click('[data-go="latihan"]');
    await p.click('[data-go="perasaan"]');
    await p.waitForSelector('[data-feel]');
    await check(p, `perasaan/${vp.name}`);

    await p.close();
  }

  await b.close();

  console.log('\n=========== MASALAH LAYOUT ===========');
  if (!issues.length) console.log('tidak ada');
  else issues.forEach((i) => console.log('  ✗ ' + i));
  console.log('\n=========== CATATAN (target sentuh) ===========');
  if (!note.length) console.log('semua target ≥ 44px');
  else note.forEach((i) => console.log('  · ' + i));
  process.exit(issues.length ? 1 : 0);
})();
