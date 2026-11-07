#!/usr/bin/env bash
# script JSON -> narration + timing file + cues + original SFX, loudness-balanced.
# Usage: KOKORO_DIR=models PY=python3 pipeline/build_audio.sh edu-preview
set -euo pipefail
V="$1"; PY="${PY:-python3}"
OUT="studio/public/audio/$V"; TL="studio/timelines/$V.json"
$PY -I pipeline/tts_kokoro.py "scripts/$V.json" "$OUT" "$TL"
$PY -I pipeline/cues.py "$TL" "scripts/$V.cues.json"
$PY -I pipeline/sfx_synth.py "$TL" "$OUT/sfx.raw.wav"
mv "$OUT/narration.wav" "$OUT/narration.raw.wav"
# voice at -15 LUFS; SFX bed ~12 LU under it
ffmpeg -v error -y -i "$OUT/narration.raw.wav" -af "loudnorm=I=-15:TP=-1.5:LRA=7" -ar 48000 "$OUT/narration.wav"
ffmpeg -v error -y -i "$OUT/sfx.raw.wav" -af "loudnorm=I=-27:TP=-6:LRA=11" -ar 48000 "$OUT/sfx.wav"
rm "$OUT/narration.raw.wav" "$OUT/sfx.raw.wav"
echo "audio + timeline rebuilt for $V"
