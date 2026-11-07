"""Narration generator (temporary voice engine: Kokoro, Apache-2.0, runs offline).

Reads a script JSON, synthesizes each line separately so line boundaries are
known exactly, inserts designed pauses, writes:
  - <out_dir>/narration.wav
  - <timeline>  (timing file the Remotion scenes read)

Word timings inside a line are estimated (character-weighted) because Kokoro's
ONNX build does not expose alignments. Swap this module for ElevenLabs
(`/with-timestamps` endpoint) later to get true character-level timings; the
timeline format stays the same.

Usage:
  python -I pipeline/tts_kokoro.py scripts/edu-preview.json \
      studio/public/audio/edu-preview studio/timelines/edu-preview.json
Env: KOKORO_DIR = folder with kokoro-v1.0.onnx + voices-v1.0.bin
"""
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SR = 24000


def trim(x, thr=0.008, pad=0.02):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


def word_times(text, start, end):
    words = text.split()
    w = np.array([len(x.strip(",.?!")) + 1.5 for x in words], dtype=float)
    edges = start + np.concatenate([[0], np.cumsum(w)]) / w.sum() * (end - start)
    return [{"w": words[i], "start": round(float(edges[i]), 3), "end": round(float(edges[i + 1]), 3)} for i in range(len(words))]


def main(script_path, out_dir, timeline_path):
    script = json.load(open(script_path))
    kdir = os.environ["KOKORO_DIR"]
    k = Kokoro(f"{kdir}/kokoro-v1.0.onnx", f"{kdir}/voices-v1.0.bin")
    voice, speed = script.get("voice", "af_heart"), script.get("speed", 1.0)
    t = script.get("leadIn", 0.15)
    audio = [np.zeros(int(t * SR), dtype=np.float32)]
    lines = []
    for ln in script["lines"]:
        if "at" in ln:  # pin this line to an absolute time (e.g. a music downbeat)
            if ln["at"] < t - 1e-3:
                print(f"WARN {ln['id']}: wanted {ln['at']}s but previous line ends {t:.2f}s")
            else:
                audio.append(np.zeros(int((ln["at"] - t) * SR), dtype=np.float32))
                t = ln["at"]
        samples, sr = k.create(ln["text"], voice=voice, speed=ln.get("speed", speed), lang="en-us")
        assert sr == SR
        s = trim(samples.astype(np.float32))
        dur = len(s) / SR
        lines.append({"id": ln["id"], "text": ln["text"], "start": round(t, 3), "end": round(t + dur, 3),
                      "words": word_times(ln["text"], t, t + dur)})
        audio.append(s)
        gap = ln.get("pauseAfter", 0.25)
        audio.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += dur + gap
    total = script.get("totalDuration")
    tail = (total - t) if total else script.get("tail", 0.8)
    audio.append(np.zeros(max(0, int(tail * SR)), dtype=np.float32))
    y = np.concatenate(audio)
    y = y / (np.abs(y).max() + 1e-9) * 0.89  # peak ~ -1 dBFS
    os.makedirs(out_dir, exist_ok=True)
    sf.write(f"{out_dir}/narration.wav", y, SR, subtype="PCM_16")
    timeline = {"fps": script.get("fps", 30), "duration": round(len(y) / SR, 3), "voice": voice,
                "engine": "kokoro-v1.0 (temporary)", "lines": lines}
    json.dump(timeline, open(timeline_path, "w"), indent=2)
    print(json.dumps({l["id"]: [l["start"], l["end"]] for l in lines}), "total", timeline["duration"])


if __name__ == "__main__":
    main(*sys.argv[1:4])
