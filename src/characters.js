/* =====================================================================
   Karakter & latar — SVG inline.
   Aset PNG asli tidak ikut di APK (hanya .import stub + sparse pck),
   jadi digambar ulang dengan gaya flat-illustration ramah anak:
   bentuk bulat, shading lembut, ekspresi jelas per mood.

   Geometri wajah (viewBox 120x120):
   - kepala: cx=60, murid cy=58 r=26 · guru cy=60 r=24
   - garis rambut selalu di atas alis (y ≤ 44) supaya mata terbaca
   ===================================================================== */

const SKIN = { nisa: '#f3c9a8', adi: '#e0a878', raka: '#c98f68' };
const SKIN_SHADE = { nisa: '#e2b18e', adi: '#cc9260', raka: '#b37a53' };
const HAIR = { nisa: '#33261f', adi: '#3d2b1f', raka: '#211a16' };
const HAIR_SHINE = { nisa: '#4a382d', adi: '#54402e', raka: '#33291f' };
const SHIRT = { nisa: '#e0736b', adi: '#4f8fd6', raka: '#e0a63f' };
const SHIRT_SHADE = { nisa: '#c55e56', adi: '#3d76b8', raka: '#c68e2f' };
const HIJAB = '#4aa3ad';
const HIJAB_SHADE = '#3d8b94';
const INK = '#3a2c22';

/** Alis + mata + mulut + pipi per mood (murid; garis rambut y≈44). */
function face(mood) {
  const brows = (tilt) => `
    <path d="M43 ${48 + tilt} q6 -4 12 -1" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M65 ${47 + tilt} q6 -3 12 1" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const cheeks = `
    <circle cx="41" cy="66" r="4" fill="#f0a3a0" opacity=".55"/>
    <circle cx="79" cy="66" r="4" fill="#f0a3a0" opacity=".55"/>`;
  const eyes = `
    <circle cx="49" cy="59" r="3.6" fill="${INK}"/>
    <circle cx="71" cy="59" r="3.6" fill="${INK}"/>
    <circle cx="50.4" cy="57.8" r="1.2" fill="#fff"/>
    <circle cx="72.4" cy="57.8" r="1.2" fill="#fff"/>`;

  switch (mood) {
    case 'sad':
      return `
        ${brows(2)}
        <path d="M45 61 q4 -4 9 0" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M66 61 q4 -4 9 0" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M53 78 q7 -6 14 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        ${cheeks}`;
    case 'worry':
      return `
        ${brows(3)}
        ${eyes}
        <path d="M53 77 q7 -5 14 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        ${cheeks}`;
    case 'stop':
      return `
        ${brows(2)}
        ${eyes}
        <circle cx="60" cy="76" r="4.2" fill="none" stroke="${INK}" stroke-width="2.6"/>
        ${cheeks}`;
    case 'support':
    case 'listen':
      return `
        ${brows(0)}
        <path d="M45 60 q4 3 9 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M66 60 q4 3 9 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M52 74 q8 9 16 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        ${cheeks}`;
    default: // happy / talk
      return `
        ${brows(0)}
        ${eyes}
        ${
          mood === 'talk'
            ? `<path d="M52 72 q8 11 16 0 q-8 3.5 -16 0 z" fill="${INK}"/><path d="M54.5 74.6 q5.5 2 11 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
            : `<path d="M52 73 q8 8 16 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
        }
        ${cheeks}`;
  }
}

/* ---------- tubuh (bahu + kerah) — dipakai semua karakter ---------- */

function body(shirt, shade) {
  return `
    <path d="M24 118 q4 -22 22 -28 q14 8 28 0 q18 6 22 28 z" fill="${shirt}"/>
    <path d="M96 118 q-4 -22 -22 -28 l-4 2 q14 7 18 26 z" fill="${shade}" opacity=".55"/>
    <path d="M46 92 q14 9 28 0 l-3 6 q-11 6 -22 0 z" fill="${shade}" opacity=".8"/>`;
}

export const CHARACTER_NAMES = {
  nisa: 'Nisa',
  adi: 'Adi',
  raka: 'Raka',
  guru: 'Bu Guru',
};

/**
 * Render karakter sebagai string SVG.
 * @param {'nisa'|'adi'|'raka'|'guru'} id
 * @param {'happy'|'sad'|'worry'|'support'|'listen'|'talk'|'stop'} mood
 */
export function characterSVG(id, mood = 'happy') {
  const skin = SKIN[id] || SKIN.nisa;
  const skinShade = SKIN_SHADE[id] || SKIN_SHADE.nisa;
  const hair = HAIR[id] || HAIR.nisa;
  const hairShine = HAIR_SHINE[id] || HAIR_SHINE.nisa;
  const shirt = SHIRT[id] || SHIRT.nisa;
  const shirtShade = SHIRT_SHADE[id] || SHIRT_SHADE.nisa;
  const name = CHARACTER_NAMES[id] || id;
  const bg =
    id === 'nisa' ? '#fdeaea' : id === 'adi' ? '#e9f1fb' : id === 'raka' ? '#fdf3e0' : '#e8f4f7';

  /* ---------- Bu Guru: hijab simetris + kacamata ---------- */
  if (id === 'guru') {
    return `<svg viewBox="0 0 120 120" role="img" aria-label="${name}">
      <circle cx="60" cy="60" r="58" fill="#e8f4f7"/>
      ${body('#2d8ba3', '#23707f')}
      <!-- leher -->
      <rect x="53" y="78" width="14" height="12" rx="6" fill="${skinShade}"/>
      <!-- hijab: drape simetris kiri-kanan -->
      <path d="M60 26 q-30 3 -30 38 q0 24 9 34 h6 q-7 -14 -7 -32 q0 -30 22 -40 z" fill="${HIJAB_SHADE}"/>
      <path d="M60 26 q30 3 30 38 q0 24 -9 34 h-6 q7 -14 7 -32 q0 -30 -22 -40 z" fill="${HIJAB_SHADE}"/>
      <!-- wajah -->
      <circle cx="60" cy="60" r="24" fill="${skin}"/>
      <!-- band hijab di dahi (di atas alis) -->
      <path d="M36 60 q0 -28 24 -28 t24 28 q-4 -13 -9 -15 q-6 6 -15 6 t-15 -6 q-5 2 -9 15 z" fill="${HIJAB}"/>
      <!-- kacamata -->
      <circle cx="49" cy="60" r="7.5" fill="rgba(255,255,255,.4)" stroke="${INK}" stroke-width="2.2"/>
      <circle cx="71" cy="60" r="7.5" fill="rgba(255,255,255,.4)" stroke="${INK}" stroke-width="2.2"/>
      <path d="M56.5 60 h7" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M41.5 60 h-7" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M78.5 60 h7" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="49" cy="61" r="2.6" fill="${INK}"/>
      <circle cx="71" cy="61" r="2.6" fill="${INK}"/>
      <!-- alis di atas kacamata -->
      <path d="M44 51 q5 -3 10 -1" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M66 50 q5 -2 10 1" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- hidung kecil -->
      <path d="M60 65 q1.5 3 -1 4" stroke="${skinShade}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- mulut per mood -->
      ${
        mood === 'sad'
          ? `<path d="M54 78 q6 -5 12 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
          : mood === 'worry'
            ? `<path d="M54 78 q6 -4 12 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
            : mood === 'stop'
              ? `<circle cx="60" cy="77" r="3.8" fill="none" stroke="${INK}" stroke-width="2.4"/>`
              : mood === 'talk'
                ? `<path d="M53 75 q7 10 14 0 q-7 3 -14 0 z" fill="${INK}"/><path d="M55.5 77.2 q4.5 1.8 9 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
                : `<path d="M53 76 q7 7 14 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      }
      <circle cx="42" cy="67" r="3.4" fill="#f0a3a0" opacity=".5"/>
      <circle cx="78" cy="67" r="3.4" fill="#f0a3a0" opacity=".5"/>
      <!-- brooch hijab -->
      <circle cx="60" cy="93" r="3" fill="#ffd98a"/>
      <circle cx="60" cy="93" r="1.2" fill="#e8b45a"/>
    </svg>`;
  }

  /* ---------- murid ---------- */
  return `<svg viewBox="0 0 120 120" role="img" aria-label="${name}">
    <circle cx="60" cy="60" r="58" fill="${bg}"/>
    ${
      id === 'nisa'
        ? `<!-- Nisa: rambut panjang di BELAKANG badan -->
    <path d="M32 56 q-3 -34 28 -34 t28 34 q2 26 -3 40 q-7 7 -15 6 q5 -20 3 -36 l-26 0 q-2 16 3 36 q-8 1 -15 -6 q-5 -14 -3 -40 z" fill="${hair}"/>`
        : ''
    }
    ${body(shirt, shirtShade)}
    <!-- leher -->
    <rect x="53" y="79" width="14" height="12" rx="6" fill="${skinShade}"/>
    <!-- telinga -->
    <circle cx="33" cy="60" r="5" fill="${skin}"/>
    <circle cx="87" cy="60" r="5" fill="${skin}"/>
    <circle cx="33" cy="60" r="2" fill="${skinShade}"/>
    <circle cx="87" cy="60" r="2" fill="${skinShade}"/>
    <!-- wajah -->
    <circle cx="60" cy="58" r="26" fill="${skin}"/>
    <!-- poni: selalu di atas alis -->
    ${
      id === 'nisa'
        ? `<path d="M34 56 q-2 -28 26 -28 t26 28 q-3 -12 -9 -14 q-5 5 -17 5 t-17 -5 q-6 2 -9 14 z" fill="${hair}"/>
    <path d="M46 33 q14 -6 28 0 q-7 -4 -14 -4 t-14 4 z" fill="${hairShine}"/>
    <!-- ikon jilbab kecil di sisi kepala -->
    <path d="M84 46 q6 4 5 12 q-4 -2 -7 -6 z" fill="${SHIRT.nisa}"/>`
        : `<path d="M34 56 q-2 -28 26 -28 t26 28 q-3 -13 -10 -15 q-4 7 -16 7 t-16 -7 q-7 2 -10 15 z" fill="${hair}"/>
    <path d="M46 33 q14 -6 28 0 q-7 -4 -14 -4 t-14 4 z" fill="${hairShine}"/>
    ${
      id === 'raka'
        ? `<!-- topi Raka -->
    <path d="M36 41 q24 -13 48 0 l-2 6 q-22 -10 -44 0 z" fill="${shirtShade}"/>
    <rect x="34" y="46" width="52" height="3.6" rx="1.8" fill="${shirtShade}"/>`
        : ''
    }`
    }
    ${face(mood)}
  </svg>`;
}

/** Latar cerita sebagai gradien + elemen dekoratif sederhana. */
export function backgroundCSS(bg) {
  const map = {
    classroom:      'linear-gradient(170deg, #fdf6e3, #e9f1fb 55%, #dbe7f7)',
    courtyard:      'linear-gradient(170deg, #eaf7ea, #d7eecb 55%, #c2e3ad)',
    creative_room:  'linear-gradient(170deg, #fdeef6, #f6e4f0 55%, #ecd5e8)',
    garden:         'linear-gradient(170deg, #eefbe8, #ddf3d0 55%, #c8e8b4)',
  };
  return map[bg] || map.classroom;
}
