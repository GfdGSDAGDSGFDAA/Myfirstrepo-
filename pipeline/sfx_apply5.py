"""SFX for Apply v5 (v1 helpers) — REAL RECORDINGS (CC0), placed from the narration timeline.

Samples live in studio/public/audio/apply-v1/sfx-src (see CREDITS.md there): Kenney packs and
OpenGameArt artists (rubberduck, artisticdude), via the Alvana Audio collection. No synthesized SFX.
Restrained by design: ambience beds + a few motivated hits. Times mirror studio/src/scenes/apply-v1/timing.ts.

Usage: python -I pipeline/sfx_apply4.py studio/timelines/apply-v5.json studio/public/audio/apply-v1/sfx-src out.wav
"""
import json, os, sys
import numpy as np, soundfile as sf

SR = 48000
tl = json.load(open(sys.argv[1]))
SRC = sys.argv[2]
L = {l["id"]: l for l in tl["lines"]}
w = lambda sid, i: L[sid]["words"][i]["start"]
sec = lambda sid: L[sid]

# ---- story beats (same derivation as studio/src/scenes/apply-v5/timing.ts)
T = dict(
    notes=[0.02, w("hook", 3) - 0.06, w("hook", 5) - 0.06],
    street=sec("idea")["start"] - 0.1, laughStart=w("idea", 8), unreal=w("idea", 13),
    dash=sec("flop")["start"] - 0.1, flop1=w("flop", 3), hours=w("flop", 8), card2=w("flop", 14) - 0.3, flop2=w("flop", 17),
    post=sec("how")["start"] - 0.1, nights=[w("how", 13), w("how", 14), w("how", 19)], hits=w("how", 21), forty=w("how", 22),
    fourteen=w("how", 25), print=w("how", 28),
    math=sec("math")["start"] - 0.1, total=w("math", 2), minus=w("math", 6), up=w("math", 15),
    friend=sec("friend")["start"] - 0.1, wants=w("friend", 6), free=w("friend", 9),
    endS=sec("end")["start"] - 0.1, forever=w("end", 4),
)
T["end"] = sec("end")["end"] + 1.8
out = np.zeros((int((T["end"] + 0.5) * SR), 2))
cache = {}


def load(name):
    if name not in cache:
        x, sr = sf.read(os.path.join(SRC, name + ".wav"), always_2d=True)
        assert sr == SR, name
        cache[name] = x.mean(axis=1)
    return cache[name]


def put(name, at, db, pan=0.0, rev=False, rate=1.0, fade_in=0.0, length=None):
    x = load(name)
    if rev:
        x = x[::-1]
    if rate != 1.0:  # simple resample for pitch/size variation
        idx = np.arange(0, len(x) - 1, rate)
        x = np.interp(idx, np.arange(len(x)), x)
    if length:
        x = x[: int(length * SR)]
    if fade_in:
        n = min(len(x), int(fade_in * SR))
        x = x.copy(); x[:n] *= np.linspace(0, 1, n)
    n = min(len(x), int(0.01 * SR))
    x = x.copy(); x[-n:] *= np.linspace(1, 0, n)  # no clicks at the tail
    g = 10 ** (db / 20)
    i = int(max(0, at) * SR)
    x = x[: max(0, len(out) - i)]
    out[i:i + len(x), 0] += x * g * (1 - max(0, pan))
    out[i:i + len(x), 1] += x * g * (1 + min(0, pan))


def bed(name, a, b, db, fade=0.4):
    """loop an ambience between a and b with fades"""
    x = load(name)
    n = int((b - a) * SR)
    y = np.tile(x, n // len(x) + 1)[:n].copy()
    f = int(fade * SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    i = int(a * SR)
    g = 10 ** (db / 20)
    out[i:i + n, 0] += y * g; out[i:i + n, 1] += y * g





# Restrained: the song carries it. Human foley + real phone/UI sounds only.
for at in T["notes"]:
    put("notification_question-001", at, -15)                        # work notifications at 11:48 PM
bed("ambience_highway", T["street"], T["dash"], -36, fade=0.2)
put("foley_cloth-1", T["street"] + 0.1, -24, pan=-0.3)
for k, at in enumerate([T["laughStart"] + 0.1, T["laughStart"] + 0.45, T["unreal"]]):
    put("foley_cloth-2" if k % 2 else "foley_cloth-1", at, -26 - k, pan=0.35)
put("ui_drop-002", T["flop1"], -16)                                   # CLOSED
put("ui_select-002", T["hours"], -20)
put("whoosh_swish-7", T["card2"], -20)
put("ui_drop-002", T["flop2"], -16)
put("ui_click-001", T["post"] + 0.05, -19)                            # post it
for at in T["nights"]:
    put("ui_select-002", at, -22)                                     # night 1 / 2 / 3
put("notification_confirm-002", T["hits"], -18)                      # it hits
for i in range(6):
    put("ui_select-002", T["hits"] + 0.1 + i * 0.22, -25, pan=0.1 * (i % 3 - 1))
put("whoosh_swish-9", T["fourteen"] - 0.2, -21)
put("notification_confirm-002", T["fourteen"] + 0.1, -18)            # paid
put("ui_click-001", T["print"], -17)
put("paper_paper-01", T["math"] + 0.05, -22)                          # the receipt
put("ui_select-002", T["minus"], -21)
put("notification_confirm-002", T["up"], -19)
for j in range(3):
    put(f"keyboard_key-{['003', '007', '012'][j]}", T["wants"] - 0.35 + j * 0.08, -29)
put("notification_question-001", T["wants"], -21)
for j in range(2):
    put(f"keyboard_key-{['019', '003'][j]}", T["free"] - 0.05 + j * 0.06, -28)
put("notification_confirm-002", T["free"] + 0.12, -20)
put("notification_question-001", T["free"] + 0.36, -22)
put("notification_confirm-002", T["endS"] + 0.2, -15)                # New order #15

out *= 10 ** (6 / 20)
peak = np.abs(out).max()
if peak > 0.89:
    out *= 0.89 / peak
sf.write(sys.argv[3], out.astype(np.float32), SR, subtype="PCM_16")
print(f"sfx: {len(out) / SR:.2f}s peak {20 * np.log10(np.abs(out).max() + 1e-9):.1f} dBFS")
