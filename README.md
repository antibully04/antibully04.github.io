# ANTIBULLY — Teman baik, sekolah aman

Website edukasi anti-bullying untuk siswa sekolah dasar. Tanpa login,
tanpa iklan, 100% statis — bisa dijalankan di browser apa pun.

## Isi

| Modul | Isi |
|---|---|
| **Edukasi** | 6 topik anti-bullying dengan renungan di tiap halaman |
| **Cerita** | 5 cerita interaktif; setiap pilihan menunjukkan akibatnya |
| **Kuis** | 2 mode: **Latihan** (tanpa skor) & **Evaluasi** (dengan skor akhir), 10 soal |
| **Latihan** | Sortir tindakan (6), Kenali perasaan (5), Misi aman (5) |

Fitur: narasi suara bahasa Indonesia (Piper TTS, 134 klip), karakter SVG
ramah anak, ikon SVG (tanpa emoji), progres tersimpan otomatis di
`localStorage`, sesi kuis bisa dilanjut setelah reload, responsif
320–1280px.

## Menjalankan lokal

Butuh server statis (bukan `file://`, karena memakai ES modules + fetch):

```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

## Deploy (GitHub Pages)

Situs ini statis murni. Push ke GitHub, lalu:

1. Settings → Pages → Source: **GitHub Actions**.
2. Workflow `.github/workflows/deploy.yml` akan otomatis men-deploy
   setiap push ke `main`.
3. Situs tersedia di `https://<username>.github.io/<repo>/`.

Tidak ada build step — folder ini langsung diterbitkan apa adanya.

## Struktur

```
├── index.html            shell + boot screen
├── data/content.json     seluruh materi (topik, cerita, kuis, latihan)
├── src/
│   ├── app.js            router + 6 modul
│   ├── state.js          progres (localStorage)
│   ├── narration.js      audio Piper → fallback Web Speech
│   ├── characters.js     karakter & latar SVG
│   ├── icons.js          ikon SVG Heroicons-style
│   └── style.css
├── assets/audio/narration/id/   134 klip .ogg + audio-index.js
├── tools/gen-narration.py       regenerasi narasi Piper
└── test/                        e2e + layout (Playwright)
```

## Uji

```bash
npm install                 # sekali saja (playwright)
python3 -m http.server 8777 &
node test/e2e.cjs           # 43 pemeriksaan alur
node test/layout.cjs        # layout di 4 ukuran layar
```

Status terakhir: **e2e 43/43 lulus, 0 error konsol; layout bersih,
semua target sentuh ≥ 44px**.

## Regenerasi narasi Piper (opsional)

```bash
python3 -m venv .venv
.venv/bin/pip install piper-tts
.venv/bin/python -m piper.download_voices id_ID-news_tts-medium --data-dir ./voices
PATH="$PWD/.venv/bin:$PATH" python tools/gen-narration.py --data-dir ./voices
cp -r public/assets/audio/narration/id/* assets/audio/narration/id/
```

## Privasi

Tanpa login, tanpa iklan, tanpa request jaringan keluar selain file
statis aplikasi ini sendiri. Progres belajar hanya tersimpan di
perangkat pengguna.

Materi ANTIBULLY digunakan dengan izin pemilik.
