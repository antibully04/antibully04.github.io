/* =====================================================================
   State & progres — disimpan di localStorage supaya anak bisa lanjut.
   ===================================================================== */

const KEY = 'antibully:v1';

const defaultState = {
  audioMuted: false,
  topicsRead: {},       // { topicId: [pageIndex...] }
  storiesDone: {},      // { storyId: true }
  quizBest: null,       // { correct, total } — skor terbaik Evaluasi
  quizAnswers: {},      // { qId: optionIndex } — jawaban Evaluasi
  quizRun: null,        // sesi kuis aktif (mode/order/index/picked/correct)
  latihanBest: null,    // { correct, total } — skor terbaik Latihan (bonus info)
  latihanAnswers: {},   // { qId: optionIndex } — jawaban Latihan
  sortingDone: {},      // { index: true }
  feelingsDone: {},     // { index: true }
  missionsDone: {},     // { missionId: true }
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    // gabung supaya field baru (versi depan) tetap punya default
    return {
      ...defaultState,
      ...parsed,
      topicsRead: { ...parsed.topicsRead },
      storiesDone: { ...parsed.storiesDone },
      quizAnswers: { ...parsed.quizAnswers },
      latihanAnswers: { ...parsed.latihanAnswers },
      sortingDone: { ...parsed.sortingDone },
      feelingsDone: { ...parsed.feelingsDone },
      missionsDone: { ...parsed.missionsDone },
    };
  } catch {
    return { ...defaultState };
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage penuh / mode privat — abaikan */
  }
}

export function get() { return state; }

export function set(patch) {
  state = { ...state, ...patch };
  save();
  return state;
}

export function resetAll() {
  state = { ...defaultState };
  save();
  return state;
}

/* ---------- progres per modul ---------- */

export function markTopicPage(topicId, pageIndex) {
  const list = state.topicsRead[topicId] || [];
  if (!list.includes(pageIndex)) {
    state.topicsRead = { ...state.topicsRead, [topicId]: [...list, pageIndex] };
    save();
  }
}

export function topicProgress(topic) {
  const read = (state.topicsRead[topic.id] || []).length;
  return { read, total: topic.pages.length };
}

export function markStoryDone(storyId) {
  if (!state.storiesDone[storyId]) {
    state.storiesDone = { ...state.storiesDone, [storyId]: true };
    save();
  }
}

export function markSortingDone(index) {
  state.sortingDone = { ...state.sortingDone, [index]: true };
  save();
}

export function markFeelingDone(index) {
  state.feelingsDone = { ...state.feelingsDone, [index]: true };
  save();
}

export function markMissionDone(id) {
  state.missionsDone = { ...state.missionsDone, [id]: true };
  save();
}

export function recordQuizAnswer(qId, optionIndex) {
  state.quizAnswers = { ...state.quizAnswers, [qId]: optionIndex };
  save();
}

export function setQuizBest(correct, total) {
  if (!state.quizBest || correct > state.quizBest.correct) {
    state.quizBest = { correct, total };
    save();
  }
}

/* ---------- Latihan (tanpa skor akhir, bebas ulang) ---------- */

export function recordLatihanAnswer(qId, optionIndex) {
  state.latihanAnswers = { ...state.latihanAnswers, [qId]: optionIndex };
  save();
}

export function setLatihanBest(correct, total) {
  // bonus info: simpan skor terbaik latihan untuk ditampilkan sebagai semangat
  if (!state.latihanBest || correct > state.latihanBest.correct) {
    state.latihanBest = { correct, total };
    save();
  }
}

/* ---------- Sesi kuis aktif (biar bisa dilanjut setelah reload) ---------- */

export function saveQuizRun(run) {
  state.quizRun = run;
  save();
}

export function clearQuizRun() {
  state.quizRun = null;
  save();
}

/* ---------- ringkasan ---------- */

export function overall(content) {
  const topics = content.topics;
  const totalStep =
    topics.reduce((n, t) => n + t.pages.length, 0) +
    content.stories.length +
    content.quiz.length +     // Evaluasi
    content.quiz.length +     // Latihan (soal sama, mode berbeda)
    content.sorting.length +
    content.feelings.length +
    content.missions.length;

  let done = 0;
  for (const t of topics) done += (state.topicsRead[t.id] || []).length;
  done += Object.keys(state.storiesDone).length;
  done += Object.keys(state.quizAnswers).length;       // Evaluasi
  done += Object.keys(state.latihanAnswers).length;    // Latihan
  done += Object.keys(state.sortingDone).length;
  done += Object.keys(state.feelingsDone).length;
  done += Object.keys(state.missionsDone).length;

  return { done, total: totalStep, pct: totalStep ? Math.round((done / totalStep) * 100) : 0 };
}
