"""Narration v2: section-based Kokoro synthesis + voice polish + real word timings.

- Each section is synthesized in ONE pass (natural prosody across sentences —
  no robotic gaps between lines). Only sections that must hit a musical moment
  are pinned: "at" (start time) or "endBy" (finish before e.g. a drop).
- Voice polish chain (ffmpeg): rumble cut, warmth, presence, de-ess, gentle
  compression, tiny room ambience  →  less dry/"AI" sounding.
- Word timings come from Parakeet-TDT (sherpa-onnx) token timestamps, aligned
  back to the script words.

Usage: python -I pipeline/tts_sections.py scripts/doors-v3.json studio/public/audio/doors-v3 studio/timelines/doors-v3.json
Env: KOKORO_DIR (kokoro-v1.0.onnx, voices-v1.0.bin), PARAKEET_DIR
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SR = 24000


def trim(x, thr=0.006, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(pad * SR)): min(len(x), idx[-1] + int(pad * SR))]


def squeeze(x, max_gap=0.15, thr=0.012, win=0.01):
    """Cap internal pauses (TikTok pacing: no dead air mid-section)."""
    n = int(win * SR)
    frames = len(x) // n
    loud = np.array([np.abs(x[i * n:(i + 1) * n]).max() > thr for i in range(frames)])
    out, i = [], 0
    while i < frames:
        j = i
        while j < frames and loud[j] == loud[i]:
            j += 1
        seg = x[i * n:j * n]
        if not loud[i] and (j - i) * win > max_gap and i > 0 and j < frames:
            keep = int(max_gap * SR) // 2
            seg = np.concatenate([seg[:keep], seg[-keep:]])
        out.append(seg)
        i = j
    out.append(x[frames * n:])
    return np.concatenate(out)


def polish(src, dst):
    chain = ",".join([
        "highpass=f=75",
        "equalizer=f=220:t=q:w=1.0:g=1.5",   # warmth
        "equalizer=f=3400:t=q:w=1.2:g=2.0",  # presence / clarity
        "equalizer=f=9000:t=q:w=1.5:g=-1.5", # tame digital fizz
        "deesser=i=0.35",
        "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2",
        "aecho=0.9:0.9:18|31:0.07|0.04",     # tiny room, not a hall
        "loudnorm=I=-14:TP=-1.2:LRA=6",
    ])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", chain, "-ar", "48000", dst], check=True)


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower().replace("-", ""))


def align(script_words, asr_tokens, asr_times, total):
    """Map script words to ASR word start times (greedy fuzzy walk)."""
    # rebuild ASR words from BPE-ish tokens (leading space = new word)
    words, starts = [], []
    for tok, ts in zip(asr_tokens, asr_times):
        if tok.startswith(" ") or not words:
            words.append(tok.strip())
            starts.append(ts)
        else:
            words[-1] += tok
    A = [norm(w) for w in words]
    out, j = [], 0
    for sw in script_words:
        n = norm(sw)
        best = None
        for k in range(j, min(j + 4, len(A))):
            a = A[k]
            if a and n and (a == n or a.startswith(n[:4]) or n.startswith(a[:4])):
                best = k
                break
        if best is None:
            out.append(None)
        else:
            out.append(starts[best])
            j = best + 1
    # interpolate misses
    for i, v in enumerate(out):
        if v is None:
            prev = next((out[k] for k in range(i - 1, -1, -1) if out[k] is not None), 0.0)
            nxt = next((out[k] for k in range(i + 1, len(out)) if out[k] is not None), total)
            out[i] = prev + (nxt - prev) * 0.5
    return out, words


def main(script_path, out_dir, tl_path):
    sc = json.load(open(script_path))
    k = Kokoro(f"{os.environ['KOKORO_DIR']}/kokoro-v1.0.onnx", f"{os.environ['KOKORO_DIR']}/voices-v1.0.bin")
    voice, speed = sc["voice"], sc.get("speed", 1.0)
    clips = []
    for s in sc["sections"]:
        a, sr = k.create(s["text"], voice=voice, speed=s.get("speed", speed), lang="en-us",
                         sentence_pause=sc.get("sentencePause", 0.2), clause_pause=sc.get("clausePause", 0.08))
        clips.append(squeeze(trim(a.astype(np.float32)), s.get('maxGap', sc.get('maxGap', 0.15))))
    # place sections
    t, placed = 0.2, []
    for s, c in zip(sc["sections"], clips):
        dur = len(c) / SR
        if "endBy" in s:
            t = max(0.12, s["endBy"] - dur)
        if "at" in s:
            if s["at"] < t - 1e-3:
                print(f"WARN {s['id']} wanted {s['at']} but previous ends {t:.2f}")
            t = max(t, s["at"])
        placed.append((s, c, t))
        t += dur + s.get("pauseAfter", 0.2)
    total = sc.get("totalDuration", t + 1)
    y = np.zeros(int(total * SR), dtype=np.float32)
    for s, c, st in placed:
        i = int(st * SR)
        y[i:i + len(c)] += c[: len(y) - i]
    os.makedirs(out_dir, exist_ok=True)
    raw = os.path.join(tempfile.mkdtemp(), "raw.wav")
    sf.write(raw, y / (np.abs(y).max() + 1e-9) * 0.9, SR, subtype="PCM_16")
    polish(raw, f"{out_dir}/narration.wav")

    # word timings via Parakeet
    import sherpa_onnx, librosa
    P = os.environ["PARAKEET_DIR"]
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx", joiner=f"{P}/joiner.int8.onnx",
        tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)
    lines = []
    for s, c, st in placed:
        y16 = librosa.resample(c, orig_sr=SR, target_sr=16000)
        stream = rec.create_stream()
        stream.accept_waveform(16000, y16)
        rec.decode_stream(stream)
        r = stream.result
        sw = s["text"].split()
        starts, asr_words = align(sw, r.tokens, r.timestamps, len(c) / SR)
        dur = len(c) / SR
        words = []
        for i, w in enumerate(sw):
            a = st + starts[i]
            b = st + (starts[i + 1] if i + 1 < len(sw) else dur)
            words.append({"w": w, "start": round(a, 3), "end": round(b, 3)})
        lines.append({"id": s["id"], "text": s["text"], "start": round(st, 3), "end": round(st + dur, 3), "words": words,
                      "asr": r.text})
        print(f"{s['id']:9s} {st:6.2f}-{st + dur:6.2f}  asr: {r.text}")
    json.dump({"fps": sc.get("fps", 30), "duration": total, "voice": voice, "engine": "kokoro-v1.0 + polish",
               "lines": lines}, open(tl_path, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:4])
