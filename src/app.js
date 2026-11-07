/* =====================================================================
   ANTIBULLY — web edition
   Sumber konten: content.json (diekstrak dari APK ANTIBULLY v1.0.1,
   package org.antibully.education, Godot 4.7.2).
   ===================================================================== */

import { characterSVG, backgroundCSS, CHARACTER_NAMES } from './characters.js';
import { narration } from './narration.js';
import { icon, topicIcon } from './icons.js';
import * as store from './state.js?v=7';

/* ---------- elemen ---------- */
const $ = (sel) => document.querySelector(sel);
const main = $('#main');
const topbar = $('#topbar');
const nav = $('#nav');
const btnBack = $('#btn-back');
const btnAudio = $('#btn-audio');
const btnInfo = $('#btn-info');
const screenTitle = $('#screen-title');
const progressTrack = $('#progress-track');
const progressFill = $('#progress-fill');
const modal = $('#modal');
const modalBody = $('#modal-body');
const modalTitle = $('#modal-title');

let content = null;
let route = { screen: 'home', params: {} };
let history = [];

/* ===================== util ===================== */

/** Escaping teks dari konten sebelum masuk innerHTML. */
function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** content.json memakai tag gaya Godot: [b]teks[/b]. */
function rich(s) {
  return esc(s)
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

/** Teks jadi beberapa paragraf. */
function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/* ===================== narasi ===================== */
/* Lihat src/narration.js — Piper bila tersedia, fallback Web Speech. */

/* ===================== chrome (topbar / nav / progress) ===================== */

const TITLES = {
  home: 'ANTIBULLY',
  edukasi: 'Edukasi',
  topik: 'Edukasi',
  cerita: 'Cerita',
  'cerita-main': 'Cerita',
  kuis: 'Kuis',
  'kuis-hasil': 'Kuis',
  latihan: 'Latihan',
  sortir: 'Latihan',
  perasaan: 'Latihan',
  misi: 'Latihan',
};

const ROOT_SCREENS = new Set(['home', 'edukasi', 'cerita', 'kuis', 'latihan']);

function setChrome(showProgress = false, pct = 0) {
  screenTitle.textContent = TITLES[route.screen] || 'ANTIBULLY';
  btnBack.hidden = ROOT_SCREENS.has(route.screen);
  progressTrack.hidden = !showProgress;
  if (showProgress) progressFill.style.width = `${pct}%`;

  document.querySelectorAll('.nav-btn').forEach((b) => {
    const target = b.dataset.go;
    const active =
      target === route.screen ||
      (target === 'edukasi' && route.screen === 'topik') ||
      (target === 'cerita' && route.screen === 'cerita-main') ||
      (target === 'latihan' && ['sortir', 'perasaan', 'misi'].includes(route.screen)) ||
      (target === 'kuis' && route.screen === 'kuis-hasil');
    b.classList.toggle('active', active);
  });
}

function go(screen, params = {}, push = true) {
  if (push) history.push({ screen: route.screen, params: route.params });
  route = { screen, params };
  narration.stop();
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  main.focus({ preventScroll: true });
}

function back() {
  const prev = history.pop() || { screen: 'home', params: {} };
  route = prev;
  narration.stop();
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ===================== screens ===================== */

function screenHome() {
  const p = store.overall(content);
  const cards = [
    ['edukasi', 'book', 'Edukasi', 'Enam topik singkat dengan refleksi.'],
    ['cerita', 'chat', 'Cerita', 'Pilih tindakan, lihat akibatnya.'],
    ['kuis', 'check', 'Kuis', 'Latihan santai atau evaluasi dengan skor.'],
    ['latihan', 'puzzle', 'Latihan', 'Sortir, kenali perasaan, misi.'],
  ];
  return `
    <section class="hero">
      <h2>Teman baik,<br>sekolah aman</h2>
      <p>Belajar mengenali, memahami, dan merespons bullying dengan cara yang aman.</p>
      <p class="mt"><span class="pill" style="background:rgba(255,255,255,.2);color:#fff">${p.pct}% selesai · ${p.done}/${p.total}</span></p>
    </section>
    <div class="menu-grid">
      ${cards
        .map(
          ([id, ic, label, desc]) => `
        <button class="menu-card" data-go="${id}">
          <span class="emoji">${icon(ic)}</span>
          <span class="label">${label}</span>
          <span class="desc">${desc}</span>
        </button>`
        )
        .join('')}
    </div>
    <p class="muted center mt">Materi untuk siswa sekolah dasar · 100% offline</p>`;
}

/* ---------- EDUKASI ---------- */

function screenEdukasi() {
  return `
    <div class="screen-head">
      <span class="eyebrow">Edukasi</span>
      <h2>Pilih topik</h2>
      <p>Baca tiga halaman singkat, lalu renungkan pertanyaannya.</p>
    </div>
    ${content.topics
      .map((t, i) => {
        const pr = store.topicProgress(t);
        const done = pr.read >= pr.total;
        return `
      <button class="list-btn" data-topic="${t.id}">
        <span class="num topic-ic"${done ? ' style="background:#3a9d6e;border:none"' : ''}>${done ? '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' : topicIcon(t.id)}</span>
        <span class="body">
          <b>${esc(t.title)}</b>
          <small>${esc(t.subtitle)} · ${pr.read}/${pr.total} halaman</small>
        </span>
        <span class="chev">›</span>
      </button>`;
      })
      .join('')}`;
}

function screenTopik(id, page = 0) {
  const t = content.topics.find((x) => x.id === id);
  if (!t) return `<p class="card">Topik tidak ditemukan.</p>`;
  const pg = t.pages[page];
  if (!pg) return `<p class="card">Halaman tidak ditemukan.</p>`;

  store.markTopicPage(t.id, page);
  const pct = Math.round(((page + 1) / t.pages.length) * 100);

  const last = page === t.pages.length - 1;

  // narasi: baca judul + teks saat halaman dibuka
  requestAnimationFrame(() => narration.say(`${pg.title}. ${pg.text}`));

  return `
    <div class="screen-head">
      <span class="eyebrow">${esc(t.title)}</span>
      <h2>${esc(pg.title)}</h2>
    </div>
    <div class="character-stage">
      ${characterSVG(pg.character || 'guru', pg.mood || 'talk')}
      <div>
        <div class="who">${esc(CHARACTER_NAMES[pg.character] || 'Bu Guru')}</div>
        <div class="mood">${esc(pg.mood === 'talk' ? 'sedang menjelaskan' : pg.mood || '')}</div>
      </div>
    </div>
    <div class="card prose">${paragraphs(pg.text)}</div>
    ${
      pg.reflection
        ? `<div class="reflection"><b>Renungkan</b><p>${esc(pg.reflection)}</p></div>`
        : ''
    }
    <div class="actions">
      ${page > 0 ? `<button class="btn ghost" data-page="${page - 1}">‹ Sebelumnya</button>` : ''}
      <button class="btn${last ? ' sun' : ''}" data-page="${page + 1}">
        ${last ? 'Selesai ✓' : 'Lanjut ›'}
      </button>
    </div>
    <p class="muted center mt">Halaman ${page + 1} dari ${t.pages.length}</p>`;
}

/* ---------- CERITA ---------- */

function screenCerita() {
  return `
    <div class="screen-head">
      <span class="eyebrow">Cerita</span>
      <h2>Pilih cerita</h2>
      <p>Setiap pilihan punya akibat. Pilih yang membuat teman merasa aman.</p>
    </div>
    ${content.stories
      .map((s, i) => {
        const done = store.get().storiesDone[s.id];
        return `
      <button class="list-btn" data-story="${s.id}">
        <span class="num">${done ? '✓' : i + 1}</span>
        <span class="body">
          <b>${esc(s.title)}</b>
          <small>${esc(s.subtitle)} · ${s.steps.length} langkah</small>
        </span>
        <span class="chev">›</span>
      </button>`;
      })
      .join('')}`;
}

function screenCeritaMain(id, step = 0, chosen = null) {
  const s = content.stories.find((x) => x.id === id);
  if (!s) return `<p class="card">Cerita tidak ditemukan.</p>`;

  // layar akhir
  if (step >= s.steps.length) {
    store.markStoryDone(s.id);
    requestAnimationFrame(() => narration.say(s.ending));
    return `
      <div class="screen-head">
        <span class="eyebrow">Selesai</span>
        <h2>${esc(s.title)}</h2>
      </div>
      <div class="card" style="background:${backgroundCSS(s.background)};border-color:transparent">
        <div class="prose"><p><strong>Penutup.</strong> ${esc(s.ending)}</p></div>
      </div>
      <div class="actions">
        <button class="btn ghost" data-go="cerita">Cerita lain</button>
        <button class="btn" data-story="${s.id}" data-step="0">Ulangi</button>
      </div>`;
  }

  const st = s.steps[step];
  const pct = Math.round(((step + 1) / (s.steps.length + 1)) * 100);

  // narasi kalimat + prompt
  requestAnimationFrame(() => narration.say(`${st.line} ${st.prompt}`));

  // kalau sudah dijawab, tampilkan feedback dan tombol lanjut
  const answered = chosen !== null;
  const correct = answered ? st.options[chosen]?.correct : false;

  return `
    <div class="screen-head">
      <span class="eyebrow">${esc(s.title)} · ${esc(st.phase)}</span>
      <h2>${esc(st.prompt)}</h2>
    </div>
    <div class="character-stage" style="background:${backgroundCSS(s.background)};border-color:transparent">
      ${characterSVG(st.speaker, st.mood)}
      <div>
        <div class="who">${esc(CHARACTER_NAMES[st.speaker] || st.speaker)}</div>
        <div class="mood">${esc(st.line)}</div>
      </div>
    </div>
    <div class="options" data-step="${step}">
      ${st.options
        .map((o, i) => {
          let cls = 'opt';
          if (answered) {
            if (o.correct) cls += ' correct';
            else if (i === chosen) cls += ' wrong';
            else cls += ' dim';
          }
          return `
        <button class="${cls}" data-choice="${i}" ${answered ? 'disabled' : ''}>
          <span class="mark">${LETTERS[i]}</span>
          <span>${esc(o.text)}</span>
        </button>`;
        })
        .join('')}
    </div>
    ${
      answered
        ? `<div class="feedback ${correct ? 'ok' : 'no'}">
             <b>${correct ? 'Tepat.' : 'Belum tepat.'}</b>
             ${esc(st.options[chosen].feedback)}
           </div>
           <div class="actions">
             <button class="btn" data-story="${s.id}" data-step="${step + 1}">
               ${step + 1 >= s.steps.length ? 'Lihat penutup ›' : 'Lanjut ›'}
             </button>
           </div>`
        : ''
    }`;
}

/* ---------- KUIS ---------- */

/* Mode: 'latihan' (tanpa skor akhir) atau 'evaluasi' (dengan skor akhir).
   quizRun pakai field "mode" untuk membedakan perilaku akhir.
   Sesi aktif dipersist di localStorage — reload tidak menghapus posisi soal. */
let quizRun = store.get().quizRun || null; // { mode, order, index, picked, correct }

function setQuizRun(run) {
  quizRun = run;
  store.saveQuizRun(run);
}

function screenKuis() {
  if (!quizRun) {
    const st = store.get();
    const evalBest = st.quizBest;
    const evalAnswered = Object.keys(st.quizAnswers).length;
    const latihanBest = st.latihanBest;
    const latihanAnswered = Object.keys(st.latihanAnswers).length;
    // sesi tertunda: masih ada soal yang belum selesai
    const pending = st.quizRun && st.quizRun.index < st.quizRun.order.length ? st.quizRun : null;
    const pendingLabel = pending
      ? `${pending.mode === 'latihan' ? 'Latihan' : 'Evaluasi'} · soal ${pending.index + 1}/${pending.order.length}`
      : '';

    return `
      <div class="screen-head">
        <span class="eyebrow">Kuis</span>
        <h2>Pilih mode</h2>
        <p>${content.quiz.length} soal tentang bullying. Pilih cara mengerjakan.</p>
      </div>
      ${pending ? `
      <button class="list-btn resume" id="resume-quiz">
        <span class="num quiz-ic">${icon('star')}</span>
        <span class="body">
          <b>Lanjutkan sesi</b>
          <small>${esc(pendingLabel)} — sesi tersimpan otomatis</small>
        </span>
        <span class="chev">›</span>
      </button>` : ''}
      <button class="list-btn" data-quiz-mode="latihan">
        <span class="num quiz-ic">${icon('pencil')}</span>
        <span class="body">
          <b>Latihan</b>
          <small>Berlatih santai, tanpa skor akhir. Bebas coba ulang. · ${latihanAnswered}/${content.quiz.length} sudah dijawab</small>
        </span>
        <span class="chev">›</span>
      </button>
      <button class="list-btn" data-quiz-mode="evaluasi">
        <span class="num quiz-ic">${icon('target')}</span>
        <span class="body">
          <b>Evaluasi</b>
          <small>Uji pemahaman, dengan skor akhir. · ${evalAnswered}/${content.quiz.length} sudah dijawab${evalBest ? ` · Skor terbaik: ${evalBest.correct}/${evalBest.total}` : ''}</small>
        </span>
        <span class="chev">›</span>
      </button>`;
  }

  const q = content.quiz[quizRun.order[quizRun.index]];
  const pct = Math.round((quizRun.index / content.quiz.length) * 100);
  requestAnimationFrame(() => narration.say(q.prompt));

  const modeLabel = quizRun.mode === 'latihan' ? 'Latihan' : 'Evaluasi';

  return `
    <div class="screen-head">
      <span class="eyebrow">${modeLabel} · Soal ${quizRun.index + 1} / ${content.quiz.length}</span>
      <h2>${esc(q.prompt)}</h2>
    </div>
    <div class="options">
      ${q.options
        .map((o, i) => {
          let cls = 'opt';
          if (quizRun.picked !== null) {
            if (i === q.correct) cls += ' correct';
            else if (i === quizRun.picked) cls += ' wrong';
            else cls += ' dim';
          }
          return `
        <button class="${cls}" data-answer="${i}" ${quizRun.picked !== null ? 'disabled' : ''}>
          <span class="mark">${LETTERS[i]}</span>
          <span>${esc(o)}</span>
        </button>`;
        })
        .join('')}
    </div>
    ${
      quizRun.picked !== null
        ? `<div class="feedback ${quizRun.picked === q.correct ? 'ok' : 'no'}">
             <b>${quizRun.picked === q.correct ? 'Benar.' : 'Belum tepat.'}</b>
             ${esc(q.explanation)}
           </div>
           <div class="actions">
             <button class="btn" id="next-quiz">${quizRun.index + 1 >= content.quiz.length ? (quizRun.mode === 'latihan' ? 'Selesai' : 'Lihat hasil ›') : 'Soal berikutnya ›'}</button>
           </div>`
        : ''
    }`;
}

function screenKuisHasil() {
  const total = quizRun ? quizRun.order.length : content.quiz.length;
  const correct = quizRun ? quizRun.correct : 0;
  const pct = Math.round((correct / total) * 100);

  // hanya mode evaluasi yang menyimpan skor "resmi"
  if (quizRun?.mode === 'evaluasi') {
    store.setQuizBest(correct, total);
  } else if (quizRun?.mode === 'latihan') {
    store.setLatihanBest(correct, total);
  }

  let msg = 'Terus berlatih, kamu makin paham.';
  if (pct === 100) msg = 'Luar biasa! Semua benar.';
  else if (pct >= 80) msg = 'Bagus sekali! Pemahamanmu kuat.';
  else if (pct >= 60) msg = 'Sudah baik. Baca ulang topik yang sulit, ya.';

  const modeLabel = quizRun?.mode === 'latihan' ? 'Latihan' : 'Evaluasi';

  // Latihan: tampilkan skor sebagai info ringan, bukan penilaian akhir
  const subtitle = quizRun?.mode === 'latihan'
    ? 'Ini hanya latihan — skor tidak disimpan sebagai nilai. Bebas coba ulang.'
    : 'Skor evaluasi tersimpan sebagai nilai terbaikmu.';

  return `
    <div class="screen-head center">
      <span class="eyebrow">${modeLabel} selesai</span>
      <h2>${correct} dari ${total}</h2>
    </div>
    <div class="score-ring" style="--pct:${pct}%"><span>${pct}%</span></div>
    <div class="card center"><p>${msg}</p><p class="muted">${subtitle}</p></div>
    <div class="actions">
      <button class="btn ghost" data-go="edukasi">Baca materi</button>
      <button class="btn" id="restart-quiz">Coba lagi</button>
    </div>`;
}

/* ---------- LATIHAN (hub) ---------- */

function screenLatihan() {
  const st = store.get();
  return `
    <div class="screen-head">
      <span class="eyebrow">Latihan</span>
      <h2>Pilih permainan</h2>
      <p>Latih kepedulian lewat tiga kegiatan singkat.</p>
    </div>
    <button class="list-btn" data-go="sortir">
      <span class="num quiz-ic">${icon('folder')}</span>
      <span class="body"><b>Sortir tindakan</b>
      <small>Membantu atau menyakiti? · ${Object.keys(st.sortingDone).length}/${content.sorting.length}</small></span>
      <span class="chev">›</span>
    </button>
    <button class="list-btn" data-go="perasaan">
      <span class="num quiz-ic">${icon('heart')}</span>
      <span class="body"><b>Kenali perasaan</b>
      <small>Pilih respons yang menenangkan · ${Object.keys(st.feelingsDone).length}/${content.feelings.length}</small></span>
      <span class="chev">›</span>
    </button>
    <button class="list-btn" data-go="misi">
      <span class="num quiz-ic">${icon('target')}</span>
      <span class="body"><b>Misi aman</b>
      <small>Apa aksi yang paling aman? · ${Object.keys(st.missionsDone).length}/${content.missions.length}</small></span>
      <span class="chev">›</span>
    </button>`;
}

/* ---------- SORTIR ---------- */

function screenSortir(index = 0) {
  const items = content.sorting;
  if (index >= items.length) {
    return `
      <div class="screen-head center">
        <span class="eyebrow">Selesai</span>
        <h2>Sortir tuntas</h2>
      </div>
      <div class="card center"><p>Kamu sudah memilah ${items.length} tindakan. Bagus!</p></div>
      <div class="actions">
        <button class="btn ghost" data-go="latihan">Kembali</button>
        <button class="btn" data-go="perasaan">Coba kenali perasaan ›</button>
      </div>`;
  }
  const it = items[index];
  requestAnimationFrame(() => narration.say(it.text));
  return `
    <div class="screen-head">
      <span class="eyebrow">Sortir ${index + 1} / ${items.length}</span>
      <h2>Tindakan ini…</h2>
    </div>
    <div class="sort-item">${esc(it.text)}</div>
    <div class="sort-choices">
      <button class="btn" data-sort="help">${icon('hand')}<small>Membantu</small></button>
      <button class="btn sun" data-sort="hurt">${icon('mask')}<small>Menyakiti</small></button>
    </div>
    <div id="sort-feedback"></div>`;
}

/* ---------- PERASAAN ---------- */

function screenPerasaan(index = 0) {
  const items = content.feelings;
  if (index >= items.length) {
    return `
      <div class="screen-head center">
        <span class="eyebrow">Selesai</span>
        <h2>Latihan perasaan tuntas</h2>
      </div>
      <div class="card center"><p>Kamu sudah berlatih mendengarkan ${items.length} perasaan teman.</p></div>
      <div class="actions">
        <button class="btn ghost" data-go="latihan">Kembali</button>
        <button class="btn" data-go="misi">Coba misi aman ›</button>
      </div>`;
  }
  const f = items[index];
  requestAnimationFrame(() => narration.say(`${f.quote} Bagaimana responsmu?`));
  return `
    <div class="screen-head">
      <span class="eyebrow">Perasaan ${index + 1} / ${items.length}</span>
      <h2>Apa respons yang menenangkan?</h2>
    </div>
    <div class="character-stage">
      ${characterSVG(f.character, f.mood)}
      <div>
        <div class="who">${esc(CHARACTER_NAMES[f.character] || f.character)} — ${esc(f.emotion)}</div>
        <div class="mood">“${esc(f.quote)}”</div>
      </div>
    </div>
    <div class="options">
      ${f.support
        .map(
          (s, i) => `
        <button class="opt" data-feel="${i}">
          <span class="mark">${LETTERS[i]}</span>
          <span>${esc(s)}</span>
        </button>`
        )
        .join('')}
    </div>
    <div id="feel-feedback"></div>`;
}

/* ---------- MISI ---------- */

function screenMisi(index = 0) {
  const items = content.missions;
  if (index >= items.length) {
    return `
      <div class="screen-head center">
        <span class="eyebrow">Selesai</span>
        <h2>Semua misi tuntas</h2>
      </div>
      <div class="card center"><p>Kamu sudah menyelesaikan ${items.length} misi aman.</p></div>
      <div class="actions">
        <button class="btn ghost" data-go="latihan">Kembali</button>
        <button class="btn" data-go="kuis">Uji dengan kuis ›</button>
      </div>`;
  }
  const m = items[index];
  requestAnimationFrame(() => narration.say(m.prompt));
  return `
    <div class="screen-head">
      <span class="eyebrow">Misi ${index + 1} / ${items.length}</span>
      <h2>${esc(m.prompt)}</h2>
    </div>
    <div class="options">
      ${m.options
        .map(
          (o, i) => `
        <button class="opt" data-mission="${i}">
          <span class="mark">${LETTERS[i]}</span>
          <span>${esc(o)}</span>
        </button>`
        )
        .join('')}
    </div>
    <div id="mission-feedback"></div>`;
}

/* ===================== render ===================== */

function render() {
  const { screen, params } = route;
  let html = '';
  let showProgress = false;
  let pct = 0;

  switch (screen) {
    case 'home':
      html = screenHome();
      break;
    case 'edukasi':
      html = screenEdukasi();
      break;
    case 'topik': {
      const t = content.topics.find((x) => x.id === params.id);
      const page = Math.min(params.page || 0, (t?.pages.length || 1) - 1);
      html = screenTopik(params.id, page);
      showProgress = true;
      pct = t ? Math.round(((page + 1) / t.pages.length) * 100) : 0;
      break;
    }
    case 'cerita':
      html = screenCerita();
      break;
    case 'cerita-main': {
      const s = content.stories.find((x) => x.id === params.id);
      html = screenCeritaMain(params.id, params.step || 0, params.chosen ?? null);
      showProgress = !!s;
      pct = s ? Math.round(((params.step || 0) / (s.steps.length + 1)) * 100) : 0;
      break;
    }
    case 'kuis':
      html = screenKuis();
      showProgress = !!quizRun;
      pct = quizRun ? Math.round((quizRun.index / content.quiz.length) * 100) : 0;
      break;
    case 'kuis-hasil':
      html = screenKuisHasil();
      break;
    case 'latihan':
      html = screenLatihan();
      break;
    case 'sortir':
      html = screenSortir(params.index || 0);
      break;
    case 'perasaan':
      html = screenPerasaan(params.index || 0);
      break;
    case 'misi':
      html = screenMisi(params.index || 0);
      break;
    default:
      html = screenHome();
  }

  main.innerHTML = html;
  setChrome(showProgress, pct);
  nav.hidden = false;
  topbar.hidden = false;
  bind();
}

/* ===================== event binding ===================== */

function bind() {
  /* navigasi generik */
  main.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.go === 'kuis') quizRun = null;
      go(el.dataset.go);
    });
  });

  /* topik */
  main.querySelectorAll('[data-topic]').forEach((el) => {
    el.addEventListener('click', () => go('topik', { id: el.dataset.topic, page: 0 }));
  });
  main.querySelectorAll('[data-page]').forEach((el) => {
    el.addEventListener('click', () => {
      const next = Number(el.dataset.page);
      const t = content.topics.find((x) => x.id === route.params.id);
      if (next >= t.pages.length) {
        go('edukasi');
      } else {
        go('topik', { id: route.params.id, page: next });
      }
    });
  });

  /* cerita */
  main.querySelectorAll('[data-story]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.story;
      const step = el.dataset.step !== undefined ? Number(el.dataset.step) : 0;
      go('cerita-main', { id, step, chosen: null });
    });
  });
  main.querySelectorAll('[data-choice]').forEach((el) => {
    el.addEventListener('click', () => {
      const i = Number(el.dataset.choice);
      go('cerita-main', { id: route.params.id, step: route.params.step || 0, chosen: i }, false);
    });
  });

  /* kuis */
  // lanjutkan sesi tertunda
  const resumeBtn = main.querySelector('#resume-quiz');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      const run = store.get().quizRun;
      if (run) setQuizRun(run);
      render();
    });
  }
  // pemilihan mode (latihan / evaluasi) — memulai sesi baru, buang sesi lama
  main.querySelectorAll('[data-quiz-mode]').forEach((el) => {
    el.addEventListener('click', () => {
      const mode = el.dataset.quizMode;
      setQuizRun({
        mode,
        order: shuffle(content.quiz.map((_, i) => i)),
        index: 0,
        picked: null,
        correct: 0,
      });
      route = { screen: 'kuis', params: {} };
      render();
    });
  });

  // jawaban soal (latihan maupun evaluasi)
  main.querySelectorAll('[data-answer]').forEach((el) => {
    el.addEventListener('click', () => {
      if (quizRun.picked !== null) return;
      const i = Number(el.dataset.answer);
      const q = content.quiz[quizRun.order[quizRun.index]];
      quizRun.picked = i;
      if (i === q.correct) quizRun.correct += 1;
      // simpan jawaban sesuai mode
      if (quizRun.mode === 'latihan') {
        store.recordLatihanAnswer(q.id, i);
      } else {
        store.recordQuizAnswer(q.id, i);
      }
      store.saveQuizRun(quizRun);
      render();
    });
  });
  const nextBtn = main.querySelector('#next-quiz');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      quizRun.index += 1;
      quizRun.picked = null;
      store.saveQuizRun(quizRun);
      if (quizRun.index >= quizRun.order.length) {
        go('kuis-hasil');
      } else {
        render();
      }
    });
  }
  const restartBtn = main.querySelector('#restart-quiz');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      store.clearQuizRun();
      quizRun = null;
      go('kuis');
    });
  }

  /* sortir */
  main.querySelectorAll('[data-sort]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = route.params.index || 0;
      const it = content.sorting[idx];
      const pick = el.dataset.sort;
      const ok = pick === it.category;
      if (ok) store.markSortingDone(idx);
      const box = main.querySelector('#sort-feedback');
      if (box) {
        box.innerHTML = `
          <div class="feedback ${ok ? 'ok' : 'no'}">
            <b>${ok ? 'Tepat.' : 'Belum tepat.'}</b>${esc(it.explanation)}
          </div>
          <div class="actions">
            <button class="btn" data-sort-next="${idx + 1}">Lanjut ›</button>
          </div>`;
        box.querySelector('[data-sort-next]').addEventListener('click', (e) => {
          go('sortir', { index: Number(e.target.dataset.sortNext) });
        });
      }
      main.querySelectorAll('[data-sort]').forEach((b) => (b.disabled = true));
      narration.say(it.explanation);
    });
  });

  /* perasaan */
  main.querySelectorAll('[data-feel]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = route.params.index || 0;
      const f = content.feelings[idx];
      const i = Number(el.dataset.feel);
      const ok = i === f.correct;
      if (ok) store.markFeelingDone(idx);
      main.querySelectorAll('[data-feel]').forEach((b) => {
        const bi = Number(b.dataset.feel);
        b.disabled = true;
        if (bi === f.correct) b.classList.add('correct');
        else if (bi === i) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      const box = main.querySelector('#feel-feedback');
      if (box) {
        box.innerHTML = `
          <div class="feedback ${ok ? 'ok' : 'no'}">
            <b>${ok ? 'Tepat.' : 'Belum tepat.'}</b>${esc(f.explanation)}
          </div>
          <div class="actions">
            <button class="btn" id="next-feel">Lanjut ›</button>
          </div>`;
        main.querySelector('#next-feel').addEventListener('click', () => {
          go('perasaan', { index: idx + 1 });
        });
      }
      narration.say(f.explanation);
    });
  });

  /* misi */
  main.querySelectorAll('[data-mission]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = route.params.index || 0;
      const m = content.missions[idx];
      const i = Number(el.dataset.mission);
      const ok = i === m.correct;
      if (ok) store.markMissionDone(m.id);
      main.querySelectorAll('[data-mission]').forEach((b) => {
        const bi = Number(b.dataset.mission);
        b.disabled = true;
        if (bi === m.correct) b.classList.add('correct');
        else if (bi === i) b.classList.add('wrong');
        else b.classList.add('dim');
      });
      const box = main.querySelector('#mission-feedback');
      if (box) {
        box.innerHTML = `
          <div class="feedback ${ok ? 'ok' : 'no'}">
            <b>${ok ? 'Tepat.' : 'Belum tepat.'}</b>${esc(m.explanation)}
          </div>
          <div class="actions">
            <button class="btn" id="next-mission">Lanjut ›</button>
          </div>`;
        main.querySelector('#next-mission').addEventListener('click', () => {
          go('misi', { index: idx + 1 });
        });
      }
      narration.say(m.explanation);
    });
  });
}

/* ===================== modal tentang ===================== */

function openAbout() {
  modalTitle.textContent = 'Tentang ANTIBULLY';
  modalBody.innerHTML = `
    <div class="prose" style="font-size:15px">
      <p><strong>ANTIBULLY — Teman baik, sekolah aman.</strong></p>
      <p>Website ini bertujuan menyediakan media edukasi anti-bullying yang
      mudah diakses bagi siswa sekolah dasar, guru, dan orang tua — tanpa
      perlu memasang aplikasi. Materi membantu anak mengenali tindakan yang
      menyakiti, memahami perasaan teman, memilih respons yang aman, dan
      berani mencari bantuan orang dewasa tepercaya.</p>
      <p>Semua materi bisa dipelajari langsung di browser, dirancang ramah
      anak: navigasi sederhana, narasi suara bahasa Indonesia, dan bahasa
      yang dekat dengan keseharian sekolah dasar.</p>
    </div>
    <h3>Isi website</h3>
    <ul>
      <li><strong>Edukasi</strong> — 6 topik anti-bullying dengan renungan
          di tiap halaman.</li>
      <li><strong>Cerita</strong> — 5 cerita interaktif; setiap pilihan
          menunjukkan akibatnya.</li>
      <li><strong>Kuis</strong> — mode <em>Latihan</em> (santai, tanpa skor)
          dan <em>Evaluasi</em> (dengan skor akhir) dari 10 soal.</li>
      <li><strong>Latihan</strong> — sortir tindakan, kenali perasaan, dan
          misi aman.</li>
    </ul>
    <h3>Privasi &amp; penggunaan</h3>
    <ul>
      <li>Tanpa login, tanpa iklan. Progres belajar tersimpan hanya di
          perangkat ini dan tidak dikirim ke mana pun.</li>
      <li>Dibebaskan untuk dipakai guru dan siswa sebagai pendamping
          pembelajaran di kelas maupun di rumah.</li>
    </ul>
    <h3>Progres</h3>
    <p id="about-progress"></p>
    <div class="actions">
      <button class="btn ghost" id="btn-reset">Hapus progres</button>
      <button class="btn" id="btn-close2">Tutup</button>
    </div>`;

  const p = store.overall(content);
  modalBody.querySelector('#about-progress').textContent =
    `${p.done} dari ${p.total} langkah selesai (${p.pct}%).`;

  modalBody.querySelector('#btn-close2').addEventListener('click', closeAbout);
  modalBody.querySelector('#btn-reset').addEventListener('click', () => {
    if (confirm('Hapus semua progres di perangkat ini?')) {
      store.resetAll();
      quizRun = null;
      closeAbout();
      go('home');
    }
  });
  modal.hidden = false;
  modal.querySelector('.modal-card').focus?.();
}

function closeAbout() {
  modal.hidden = true;
}

/* ===================== boot ===================== */

async function boot() {
  const fill = $('#boot-fill');
  const msg = $('#boot-msg');
  try {
    fill.style.width = '35%';
    msg.textContent = 'Memuat materi…';
    const res = await fetch('data/content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    content = await res.json();
    fill.style.width = '75%';
    msg.textContent = 'Menyiapkan tampilan…';

    // validasi struktur minimal
    const need = ['topics', 'stories', 'quiz', 'sorting', 'feelings', 'missions'];
    for (const k of need) {
      if (!Array.isArray(content[k]) || !content[k].length) {
        throw new Error(`content.json tidak lengkap: "${k}" kosong`);
      }
    }

    narration.init();
    btnAudio.setAttribute('aria-pressed', String(!store.get().audioMuted));
    fill.style.width = '100%';
    msg.textContent = 'Siap.';
    setTimeout(() => {
      $('#boot').classList.add('done');
      render();
    }, 260);
  } catch (err) {
    $('#boot').classList.add('boot-error');
    fill.style.width = '100%';
    msg.innerHTML =
      `Gagal memuat materi.<br><small>${esc(err.message)}</small><br><br>` +
      `<small>Jalankan lewat server lokal, bukan <code>file://</code>.<br>` +
      `Contoh: <code>python3 -m http.server 8080</code> di folder ini.</small>`;
  }
}

/* ===================== wiring global ===================== */

btnBack.addEventListener('click', back);
btnInfo.addEventListener('click', openAbout);
$('#modal-close').addEventListener('click', closeAbout);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeAbout();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeAbout();
});

btnAudio.addEventListener('click', () => {
  const muted = !store.get().audioMuted;
  store.set({ audioMuted: muted });
  btnAudio.setAttribute('aria-pressed', String(!muted));
  btnAudio.innerHTML = icon(muted ? 'speakerOff' : 'speaker');
  if (muted) narration.stop();
});

nav.querySelectorAll('.nav-btn').forEach((b) => {
  b.addEventListener('click', () => {
    if (b.dataset.go === 'kuis') quizRun = null;
    go(b.dataset.go);
  });
});

// hentikan narasi saat tab disembunyikan
document.addEventListener('visibilitychange', () => {
  if (document.hidden) narration.stop();
});

boot();
