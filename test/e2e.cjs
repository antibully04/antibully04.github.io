/* Uji end-to-end ANTIBULLY web: semua alur utama + tangkap error konsol. */
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8777/';
const results = [];
const errors = [];

function ok(name, cond, extra = '') {
  results.push({ name, pass: !!cond, extra });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done', { timeout: 15000 });

  // ---------- HOME ----------
  const title = await page.textContent('.hero h2');
  ok('home hero tampil', /Teman baik/.test(title || ''));
  const menuCount = await page.locator('.menu-card').count();
  ok('home punya 4 kartu menu', menuCount === 4, `dapat ${menuCount}`);

  // ---------- EDUKASI ----------
  await page.click('[data-go="edukasi"]');
  await page.waitForSelector('[data-topic]');
  const topics = await page.locator('[data-topic]').count();
  ok('6 topik edukasi', topics === 6, `dapat ${topics}`);

  await page.click('[data-topic="kenali"]');
  await page.waitForSelector('.prose');
  const h2 = await page.textContent('.screen-head h2');
  ok('halaman topik terbuka', /Semua anak berhak/.test(h2 || ''), h2);
  const hasChar = await page.locator('.character-stage svg').count();
  ok('karakter SVG tampil', hasChar === 1);
  const hasReflect = await page.locator('.reflection').count();
  ok('kotak refleksi tampil', hasReflect === 1);
  const prog = await page.getAttribute('#progress-fill', 'style');
  ok('progress bar terisi', /width/.test(prog || ''), prog);

  // navigasi 3 halaman
  await page.click('[data-page="1"]');
  await page.waitForTimeout(150);
  let t = await page.textContent('.screen-head h2');
  ok('halaman 2 topik', /tiga ciri/.test(t || ''), t);
  await page.click('[data-page="2"]');
  await page.waitForTimeout(150);
  t = await page.textContent('.screen-head h2');
  ok('halaman 3 topik', /Sekali menyakiti/.test(t || ''), t);
  // tombol selesai kembali ke daftar
  await page.click('[data-page="3"]');
  await page.waitForTimeout(200);
  ok('selesai topik kembali ke daftar', (await page.locator('[data-topic]').count()) === 6);
  // tanda centang progres (sekarang SVG centang di dalam .num)
  const numHasCheck = await page.locator('[data-topic="kenali"] .num svg').count();
  ok('topik tertanda selesai', numHasCheck === 1, `svg centang: ${numHasCheck}`);

  // ---------- CERITA ----------
  await page.click('[data-go="cerita"]');
  await page.waitForSelector('[data-story]');
  const stories = await page.locator('[data-story]').count();
  ok('5 cerita', stories === 5, `dapat ${stories}`);

  await page.click('[data-story="julukan"]');
  await page.waitForSelector('.opt');
  const opts = await page.locator('.opt').count();
  ok('cerita punya 3 pilihan', opts === 3, `dapat ${opts}`);
  await page.click('[data-choice="0"]');
  await page.waitForTimeout(200);
  ok('feedback jawaban muncul', (await page.locator('.feedback.ok').count()) === 1);

  // maju sampai penutup
  for (let i = 0; i < 4; i++) {
    const next = page.locator('[data-story][data-step]').first();
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(200);
    const choice = page.locator('[data-choice]').first();
    if (await choice.count()) {
      await choice.click();
      await page.waitForTimeout(150);
    }
  }
  const ending = await page.textContent('main');
  ok('cerita sampai penutup', /Penutup|Selesai/.test(ending || ''));

  // ---------- KUIS: hub mode ----------
  await page.click('[data-go="kuis"]');
  await page.waitForSelector('[data-quiz-mode]');
  const modeCount = await page.locator('[data-quiz-mode]').count();
  ok('kuis punya 2 pilihan mode', modeCount === 2, `dapat ${modeCount}`);

  // ---------- KUIS: Latihan mode ----------
  await page.click('[data-quiz-mode="latihan"]');
  await page.waitForSelector('[data-answer]');
  ok('latihan mulai, soal tampil', (await page.locator('[data-answer]').count()) === 3);
  // cek label mode muncul
  const latihanEyebrow = await page.textContent('.screen-head .eyebrow');
  ok('latihan label mode tampil', /Latihan/.test(latihanEyebrow || ''), latihanEyebrow);

  await page.click('[data-answer="0"]');
  await page.waitForTimeout(200);
  ok('latihan beri feedback', (await page.locator('.feedback').count()) === 1);

  let guardLatihan = 0;
  while (guardLatihan++ < 30) {
    const next = page.locator('#next-quiz');
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(120);
    const ans = page.locator('[data-answer]:not([disabled])').first();
    if (await ans.count()) {
      await ans.click();
      await page.waitForTimeout(120);
    }
  }
  const latihanHasil = await page.textContent('main');
  ok('latihan sampai layar hasil', /dari 10|%/.test(latihanHasil || ''));
  ok('latihan label selesai tampil', /Latihan selesai/.test(latihanHasil || ''), latihanHasil);
  // latihan: subtitle menyebut "tidak disimpan sebagai nilai"
  ok('latihan subtitle tepat', /tidak disimpan sebagai nilai/.test(latihanHasil || ''));

  // ---------- KUIS: Evaluasi mode ----------
  await page.click('[data-go="kuis"]');
  await page.waitForSelector('[data-quiz-mode]');
  await page.click('[data-quiz-mode="evaluasi"]');
  await page.waitForSelector('[data-answer]');
  ok('evaluasi mulai, soal tampil', (await page.locator('[data-answer]').count()) === 3);
  const evalEyebrow = await page.textContent('.screen-head .eyebrow');
  ok('evaluasi label mode tampil', /Evaluasi/.test(evalEyebrow || ''), evalEyebrow);

  await page.click('[data-answer="0"]');
  await page.waitForTimeout(200);
  ok('evaluasi beri feedback', (await page.locator('.feedback').count()) === 1);

  let guardEval = 0;
  while (guardEval++ < 30) {
    const next = page.locator('#next-quiz');
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(120);
    const ans = page.locator('[data-answer]:not([disabled])').first();
    if (await ans.count()) {
      await ans.click();
      await page.waitForTimeout(120);
    }
  }
  const evalHasil = await page.textContent('main');
  ok('evaluasi sampai layar hasil', /dari 10|%/.test(evalHasil || ''));
  ok('score ring tampil', (await page.locator('.score-ring').count()) === 1);
  ok('evaluasi label selesai tampil', /Evaluasi selesai/.test(evalHasil || ''), evalHasil);
  // evaluasi: subtitle menyebut "nilai terbaik"
  ok('evaluasi subtitle tepat', /nilai terbaik/.test(evalHasil || ''));

  // ---------- KUIS: persist sesi + resume ----------
  await page.click('[data-go="kuis"]');
  await page.waitForSelector('[data-quiz-mode]');
  await page.click('[data-quiz-mode="latihan"]');
  await page.waitForSelector('[data-answer]');
  await page.click('[data-answer="0"]');
  await page.waitForTimeout(150);
  const nextBtnMid = page.locator('#next-quiz');
  if (await nextBtnMid.count()) { await nextBtnMid.click(); await page.waitForTimeout(150); }
  // reload di tengah sesi
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done');
  await page.click('[data-go="kuis"]');
  await page.waitForTimeout(300);
  const hubTxt = await page.textContent('main');
  ok('sesi tertunda muncul tombol lanjutkan', /Lanjutkan sesi/.test(hubTxt || ''), hubTxt?.slice(0, 120));
  await page.click('#resume-quiz');
  await page.waitForTimeout(300);
  const resumed = await page.textContent('.screen-head .eyebrow');
  ok('sesi dilanjut di soal yang sama', /Soal 2/.test(resumed || ''), resumed);

  // ---------- LATIHAN ----------
  await page.click('[data-go="latihan"]');
  await page.waitForSelector('[data-go="sortir"]');
  await page.click('[data-go="sortir"]');
  await page.waitForSelector('[data-sort]');
  const sortText = await page.textContent('.sort-item');
  ok('sortir tampil item', !!sortText && sortText.length > 5, sortText);
  await page.click('[data-sort="help"]');
  await page.waitForTimeout(200);
  ok('sortir beri feedback', (await page.locator('.feedback').count()) >= 1);
  await page.click('[data-sort-next]');
  await page.waitForTimeout(200);
  ok('sortir lanjut ke item berikut', (await page.locator('.sort-item').count()) === 1);

  // perasaan
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done');
  await page.click('[data-go="latihan"]');
  await page.click('[data-go="perasaan"]');
  await page.waitForSelector('[data-feel]');
  ok('perasaan tampil karakter', (await page.locator('.character-stage svg').count()) === 1);
  await page.click('[data-feel="1"]');
  await page.waitForTimeout(200);
  ok('perasaan beri feedback', (await page.locator('.feedback').count()) >= 1);

  // misi
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done');
  await page.click('[data-go="latihan"]');
  await page.click('[data-go="misi"]');
  await page.waitForSelector('[data-mission]');
  ok('misi tampil', (await page.locator('[data-mission]').count()) === 3);
  await page.click('[data-mission="1"]');
  await page.waitForTimeout(200);
  ok('misi beri feedback', (await page.locator('.feedback').count()) >= 1);

  // ---------- MODAL ABOUT ----------
  await page.click('#btn-info');
  await page.waitForSelector('#modal:not([hidden])');
  const aboutTxt = await page.textContent('#modal-body');
  ok('modal tentang terbuka', /ANTIBULLY/.test(aboutTxt || ''));
  ok('modal sebut tujuan website', /bertujuan/.test(aboutTxt || ''));
  await page.click('#modal-close');

  // ---------- PERSISTENSI ----------
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done');
  const heroTxt = await page.textContent('.hero');
  ok('progres tersimpan setelah reload', /[1-9]\d*%|selesai/.test(heroTxt || ''), heroTxt?.trim());

  // ---------- BACK BUTTON ----------
  await page.click('[data-go="edukasi"]');
  await page.click('[data-topic="bercanda"]');
  await page.waitForSelector('.prose');
  await page.click('#btn-back');
  await page.waitForTimeout(200);
  ok('tombol kembali berfungsi', (await page.locator('[data-topic]').count()) === 6);

  // ---------- RESPONSIF ----------
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#boot.done');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok('tidak ada overflow horizontal di 320px', !overflow, `scrollWidth=${await page.evaluate(() => document.documentElement.scrollWidth)}`);

  await browser.close();

  // ---------- LAPORAN ----------
  const pass = results.filter((r) => r.pass).length;
  console.log('\n================ HASIL UJI ================');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.extra && !r.pass ? '  → ' + r.extra : ''}`);
  }
  console.log(`\n${pass}/${results.length} lulus`);
  console.log(`error konsol: ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.log('  ! ' + e));
  process.exit(pass === results.length && errors.length === 0 ? 0 : 1);
})();
