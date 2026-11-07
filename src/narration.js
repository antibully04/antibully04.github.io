/* =====================================================================
   Narasi: mainkan audio Piper kalau tersedia, jika tidak pakai suara browser.

   Audio dari tools/gen-narration.py disimpan sebagai
   public/assets/audio/narration/id/<hash>.ogg dengan manifest.json
   { "<clip_id>": "<teks>" }. Hash = sha256(teks)[:16], sama seperti
   konvensi APK asli.
   ===================================================================== */

import { get } from './state.js?v=6';

let index = null;        // Map<teks, url>
let indexLoaded = false;
let current = null;      // HTMLAudioElement

async function ensureIndex() {
  if (indexLoaded) return;
  indexLoaded = true;
  const manifest = piperIndex();
  if (!manifest) return; // audio Piper belum digenerate → pakai browser
  index = new Map();
  for (const [clipId, text] of Object.entries(manifest)) {
    index.set(norm(text), `assets/audio/narration/id/${clipId}.ogg`);
  }
}

function norm(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

/**
 * Audio Piper opsional (dibuat oleh tools/gen-narration.py).
 * Skrip itu menulis public/assets/audio/narration/id/audio-index.js
 * berisi `window.__NARRATION__ = { "<clip_id>": "<teks>" }`.
 * Kalau file belum ada, kita pakai suara browser tanpa error di konsol.
 */
function piperIndex() {
  return (typeof window !== 'undefined' && window.__NARRATION__) || null;
}

/* ---------- fallback: Web Speech ---------- */
const webSpeech = {
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  voice: null,
  init() {
    if (!this.supported) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      this.voice =
        vs.find((v) => v.lang === 'id-ID') ||
        vs.find((v) => v.lang?.startsWith('id')) ||
        null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  },
  say(text) {
    if (!this.supported) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    u.rate = 0.94;
    u.pitch = 1.02;
    if (this.voice) u.voice = this.voice;
    speechSynthesis.speak(u);
    return true;
  },
  stop() {
    if (this.supported) speechSynthesis.cancel();
  },
};

/* ---------- API ---------- */
export const narration = {
  init() {
    webSpeech.init();
    ensureIndex();
  },

  /** Mainkan teks (atau gabungan beberapa kalimat). */
  say(text) {
    if (!text) return;
    if (get().audioMuted) return;
    this.stop();

    const key = norm(text);
    if (index?.has(key)) {
      current = new Audio(index.get(key));
      current.play().catch(() => {
        // autoplay diblokir / file hilang → jatuh ke suara browser
        webSpeech.say(text);
      });
      return;
    }
    webSpeech.say(text);
  },

  stop() {
    if (current) {
      current.pause();
      current.currentTime = 0;
      current = null;
    }
    webSpeech.stop();
  },

  /** true kalau ada klip Piper untuk teks ini. */
  hasClip(text) {
    return !!index?.has(norm(text));
  },
};
