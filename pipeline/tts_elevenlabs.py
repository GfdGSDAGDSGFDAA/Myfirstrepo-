"""ElevenLabs narration with TRUE word timestamps. Drop-in for tts_sections.py (same script + timeline format).

!! UNTESTED against the live API: it was written in a cloud box that cannot reach api.elevenlabs.io and has no key.
   First run on your PC with --dry-run, then a single short section.

Setup:   set the key as an environment variable (never in a file/chat):  ELEVENLABS_API_KEY
Voices:  python -I pipeline/tts_elevenlabs.py --list-voices          (pick by ear in the ElevenLabs website, copy the voice_id)
Preview: python -I pipeline/tts_elevenlabs.py scripts/doors-v3.json OUT_DIR TIMELINE.json --dry-run     (shows character count; spends nothing)
Run:     python -I pipeline/tts_elevenlabs.py scripts/doors-v3.json studio/public/audio/doors-v3 studio/timelines/doors-v3.json

Script JSON extras (all optional):
  "elevenVoiceId": "...", "elevenModel": "eleven_multilingual_v2",
  "elevenSettings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true, "speed": 1.05}
Responses are cached in <OUT_DIR>/.eleven_cache/ so re-rendering identical text never bills twice.
Tip: for fewer pauses, write sections with few commas (the voice pauses at punctuation).
Uses only the standard library + numpy/soundfile (already in requirements) + ffmpeg.
"""
import base64, hashlib, json, os, subprocess, sys, tempfile, urllib.error, urllib.request
import numpy as np
import soundfile as sf

API = "https://api.elevenlabs.io/v1"
SR = 44100


def key():
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        sys.exit("Set ELEVENLABS_API_KEY as an environment variable first (never paste it into chat or a file).")
    return k


def call(path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs error {e.code}: {e.read().decode()[:400]}")


def list_voices():
    for v in call("/voices").get("voices", []):
        lab = v.get("labels") or {}
        print(f"{v['voice_id']}  {v['name']:24s} {lab.get('gender', '')} {lab.get('accent', '')} {lab.get('descriptive', '')}")


def synth(text, voice, model, settings, cache_dir):
    h = hashlib.sha256(json.dumps([text, voice, model, settings], sort_keys=True).encode()).hexdigest()[:20]
    f = os.path.join(cache_dir, h + ".json")
    if os.path.exists(f):
        return json.load(open(f))
    r = call(f"/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
             {"text": text, "model_id": model, "voice_settings": settings})
    os.makedirs(cache_dir, exist_ok=True)
    json.dump(r, open(f, "w"))
    return r


def decode(b64):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       input=base64.b64decode(b64), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32)


def words_from_alignment(text, al):
    """Group per-character times into the script's whitespace-separated words."""
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur = [], None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur:
                out.append(cur)
                cur = None
        elif cur is None:
            cur = {"w": c, "start": a, "end": b}
        else:
            cur["w"] += c
            cur["end"] = b
    if cur:
        out.append(cur)
    return out


def polish(src, dst):
    chain = ",".join(["highpass=f=75", "equalizer=f=3400:t=q:w=1.2:g=1.5", "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2",
                      "loudnorm=I=-14:TP=-1.2:LRA=6"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", chain, "-ar", "48000", dst], check=True)


def main(script_path, out_dir, tl_path, dry=False):
    sc = json.load(open(script_path))
    voice = sc.get("elevenVoiceId") or sys.exit('Add "elevenVoiceId" to the script JSON (run --list-voices).')
    model = sc.get("elevenModel", "eleven_multilingual_v2")
    settings = sc.get("elevenSettings", {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True})
    chars = sum(len(s["text"]) for s in sc["sections"])
    print(f"{len(sc['sections'])} sections, {chars} characters will be billed (cached sections are free).")
    if dry:
        return
    cache = os.path.join(out_dir, ".eleven_cache")
    t, placed = 0.2, []
    for s in sc["sections"]:
        r = synth(s["text"], voice, model, settings, cache)
        clip = decode(r["audio_base64"])
        idx = np.where(np.abs(clip) > 0.006)[0]
        head = max(0, int(idx[0]) - int(0.03 * SR)) if len(idx) else 0
        tail = min(len(clip), int(idx[-1]) + int(0.03 * SR)) if len(idx) else len(clip)
        clip = clip[head:tail]
        words = words_from_alignment(s["text"], r.get("alignment") or r["normalized_alignment"])
        dur = len(clip) / SR
        if "endBy" in s:
            t = max(0.12, s["endBy"] - dur)
        if "at" in s:
            if s["at"] < t - 1e-3:
                print(f"WARN {s['id']} wanted {s['at']} but previous ends {t:.2f}")
            t = max(t, s["at"])
        placed.append((s, clip, t, words, head / SR))
        t += dur + s.get("pauseAfter", 0.2)
    total = sc.get("totalDuration", t + 1)
    y = np.zeros(int(total * SR), dtype=np.float32)
    lines = []
    for s, clip, st, words, off in placed:
        i = int(st * SR)
        y[i:i + len(clip)] += clip[: len(y) - i]
        ws = [{"w": w["w"], "start": round(st + w["start"] - off, 3), "end": round(st + w["end"] - off, 3)} for w in words]
        if len(ws) != len(s["text"].split()):
            print(f"WARN {s['id']}: {len(ws)} timed words vs {len(s['text'].split())} script words; check word indexes")
        lines.append({"id": s["id"], "text": s["text"], "start": round(st, 3), "end": round(st + len(clip) / SR, 3), "words": ws})
    os.makedirs(out_dir, exist_ok=True)
    raw = os.path.join(tempfile.mkdtemp(), "raw.wav")
    sf.write(raw, y / (np.abs(y).max() + 1e-9) * 0.9, SR, subtype="PCM_16")
    polish(raw, os.path.join(out_dir, "narration.wav"))
    json.dump({"fps": sc.get("fps", 30), "duration": total, "voice": voice, "engine": "elevenlabs " + model, "lines": lines},
              open(tl_path, "w"), indent=1)
    for l in lines:
        print(f"{l['id']:10s} {l['start']:6.2f}-{l['end']:6.2f}")


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    if "--list-voices" in sys.argv:
        list_voices()
    else:
        main(*a[:3], dry="--dry-run" in sys.argv)
