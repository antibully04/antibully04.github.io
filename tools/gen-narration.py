#!/usr/bin/env python3
"""
Regenerasi narasi ANTIBULLY dengan Piper TTS.

APK asli memakai voice `id_ID-news_tts-medium` (lihat
data/narration_index.json). Audio aslinya TIDAK ikut di dalam APK
(sparse pck hanya menyimpan metadata), jadi skrip ini membuat ulang
narasi dari teks yang sama.

Paket:
    pip install piper-tts
    # voice Indonesia (unduh sekali):
    python3 -m piper.download_voices id_ID-news_tts-medium --data-dir ./voices

Pakai:
    python3 tools/gen-narration.py --data-dir ./voices
    python3 tools/gen-narration.py --data-dir ./voices --dry-run

Hasil: public/assets/audio/narration/id/<hash>.ogg + manifest.json
Nama file memakai hash teks (sha256 16 char pertama), sama seperti
konvensi APK asli (id_<16 hex>.ogg), supaya mudah dipetakan.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "data" / "content.json"
OUT_DIR = ROOT / "public" / "assets" / "audio" / "narration" / "id"
MANIFEST = OUT_DIR / "manifest.json"

VOICE = "id_ID-news_tts-medium"


def clip_id(text: str) -> str:
    """id_<16 hex> seperti konvensi APK asli."""
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
    return f"id_{h}"


def collect_texts(content: dict) -> list[str]:
    """Semua teks yang layak dinarasikan, urut sesuai alur aplikasi."""
    texts: list[str] = []

    def add(s: str | None) -> None:
        if s and isinstance(s, str):
            t = s.strip()
            if t and t not in texts:
                texts.append(t)

    # sambutan
    add("Selamat datang di ANTIBULLY. Teman baik, sekolah aman.")

    # topik edukasi: judul + isi per halaman
    for topic in content.get("topics", []):
        for page in topic.get("pages", []):
            add(page.get("title"))
            add(page.get("text"))

    # cerita: tiap kalimat + prompt + penutup
    for story in content.get("stories", []):
        for step in story.get("steps", []):
            add(step.get("line"))
            add(step.get("prompt"))
        add(story.get("ending"))

    # kuis
    for q in content.get("quiz", []):
        add(q.get("prompt"))
        add(q.get("explanation"))

    # sortir
    for s in content.get("sorting", []):
        add(s.get("text"))
        add(s.get("explanation"))

    # perasaan
    for f in content.get("feelings", []):
        add(f.get("quote"))
        add(f.get("explanation"))

    # misi
    for m in content.get("missions", []):
        add(m.get("prompt"))
        add(m.get("explanation"))

    return texts


def find_piper() -> str:
    exe = shutil.which("piper")
    if not exe:
        sys.exit(
            "piper tidak ditemukan.\n"
            "  pip install piper-tts\n"
            "lalu pastikan `piper` ada di PATH."
        )
    return exe


def synth(piper: str, voice_path: Path, text: str, out_wav: Path) -> None:
    proc = subprocess.run(
        [piper, "--model", str(voice_path), "--output_file", str(out_wav)],
        input=text.encode("utf-8"),
        capture_output=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", "ignore")[:400])


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default="./voices", help="folder model voice Piper")
    ap.add_argument("--dry-run", action="store_true", help="tampilkan rencana saja")
    ap.add_argument("--force", action="store_true", help="timpa file yang sudah ada")
    args = ap.parse_args()

    content = json.loads(CONTENT.read_text(encoding="utf-8"))
    texts = collect_texts(content)
    print(f"teks narasi: {len(texts)}")

    voice_path = (Path(args.data_dir) / f"{VOICE}.onnx").resolve()
    if not voice_path.exists() and not args.dry_run:
        sys.exit(
            f"model tidak ditemukan: {voice_path}\n"
            f"  python3 -m piper.download_voices {VOICE} --data-dir {args.data_dir}"
        )

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.dry_run:
        for t in texts[:8]:
            print(f"  {clip_id(t)}  {t[:64]}…")
        if len(texts) > 8:
            print(f"  … dan {len(texts) - 8} lagi")
        print(f"\nakan menulis ke: {OUT_DIR}")
        return 0

    piper = find_piper()
    manifest: dict[str, str] = {}
    if MANIFEST.exists():
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    made = skipped = failed = 0
    for i, text in enumerate(texts, 1):
        cid = clip_id(text)
        wav = OUT_DIR / f"{cid}.wav"
        ogg = OUT_DIR / f"{cid}.ogg"
        manifest[cid] = text

        if ogg.exists() and not args.force:
            skipped += 1
            continue

        try:
            synth(piper, voice_path, text, wav)
            # konversi ke ogg vorbis bila ffmpeg tersedia (format APK asli)
            if shutil.which("ffmpeg"):
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
                     "-c:a", "libvorbis", "-q:a", "4", str(ogg)],
                    check=True,
                )
                wav.unlink(missing_ok=True)
            else:
                ogg = wav  # fallback: simpan wav
            made += 1
            if i % 20 == 0 or i == len(texts):
                print(f"  {i}/{len(texts)} …")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"  gagal {cid}: {e}")

    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # audio-index.js: dibaca src/narration.js lewat <script> opsional.
    # Ditulis sebagai file JS supaya tidak perlu fetch (dan tidak 404
    # kalau audio belum pernah digenerate).
    index_js = OUT_DIR / "audio-index.js"
    index_js.write_text(
        "window.__NARRATION__ = "
        + json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    print(f"\nselesai: {made} dibuat, {skipped} dilewati, {failed} gagal")
    print(f"manifest: {MANIFEST}")
    print(f"index   : {index_js}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
