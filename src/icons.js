/* =====================================================================
   Ikon SVG inline — gaya Heroicons/Lucide outline, stroke 1.8,
   viewBox 24x24, currentColor supaya mewarisi warna teks.
   ===================================================================== */

const P = {
  home: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>`,
  book: `<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/>`,
  chat: `<path d="M21 12a8 8 0 0 1-8 8H4l2.2-3.3A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>`,
  check: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-5.2"/>`,
  puzzle: `<path d="M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v1a2 2 0 1 1-4 0v-1H7a1 1 0 0 1-1-1v-3H5a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h3z"/>`,
  pencil: `<path d="m14.5 4.5 5 5L8 21H3v-5z"/><path d="m12.5 6.5 5 5"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>`,
  folder: `<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  heart: `<path d="M12 20.5S4 15 4 9.5A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8 2.7c0 5.5-8 11-8 11z"/>`,
  speaker: `<path d="M11 5 6.5 8.5H3v7h3.5L11 19z"/><path d="M15 9a4.2 4.2 0 0 1 0 6"/><path d="M17.5 6.5a8 8 0 0 1 0 11"/>`,
  speakerOff: `<path d="M11 5 6.5 8.5H3v7h3.5L11 19z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>`,
  hand: `<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6.5 7S5 17 5 14v-3a1.5 1.5 0 0 1 3 0"/>`,
  smile: `<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>`,
  mask: `<path d="M3 5h18v6a9 9 0 0 1-18 0z"/><path d="M3 9c3 1.5 15 1.5 18 0"/><path d="M8.5 15.5a5 5 0 0 0 7 0"/>`,
  shield: `<path d="M12 3 5 5.8v5.4c0 4.5 3 8 7 9.8 4-1.8 7-5.3 7-9.8V5.8z"/><path d="m9 11.5 2.2 2.2L15.5 9"/>`,
  leaf: `<path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z"/><path d="M5 19c3-5 7-9 11-11"/>`,
  star: `<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>`,
};

/** Ikon outline: ik(s) → string SVG 24x24, ukuran via CSS (em). */
export function icon(name, cls = '') {
  const d = P[name] || P.star;
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

/** Ikon per topik edukasi — pasangan (ikon, warna) dari id topik content.json. */
const TOPIC_ICONS = {
  kenali:     ['eye',    '#4f8fd6'],
  bercanda:   ['smile',  '#e0a63f'],
  bentuk:     ['mask',   '#c55e56'],
  respons:    ['hand',   '#3a9d6e'],
  teman_baik: ['heart',  '#d96a94'],
  perasaan:   ['leaf',   '#5aa06a'],
};

export function topicIcon(topicId) {
  const [name, color] = TOPIC_ICONS[topicId] || ['star', '#8a7f76'];
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="${color}"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
}
