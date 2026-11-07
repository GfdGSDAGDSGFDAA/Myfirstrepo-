"""SFX for Apply v2 (v1 helpers) — REAL RECORDINGS (CC0), placed from the narration timeline.

Samples live in studio/public/audio/apply-v1/sfx-src (see CREDITS.md there): Kenney packs and
OpenGameArt artists (rubberduck, artisticdude), via the Alvana Audio collection. No synthesized SFX.
Restrained by design: ambience beds + a few motivated hits. Times mirror studio/src/scenes/apply-v1/timing.ts.

Usage: python -I pipeline/sfx_apply2.py studio/timelines/apply-v2.json studio/public/audio/apply-v1/sfx-src out.wav
"""
import json, os, sys
import numpy as np, soundfile as sf

SR = 48000
tl = json.load(open(sys.argv[1]))
SRC = sys.argv[2]
L = {l["id"]: l for l in tl["lines"]}
w = lambda sid, i: L[sid]["words"][i]["start"]
sec = lambda sid: L[sid]

# ---- story beats (same derivation as studio/src/scenes/apply-v2/timing.ts)
T = dict(
    unreal=w("hook", 6), jobs=w("hook", 7) - 0.08, apply=w("hook", 8), company=w("hook", 11), started=w("hook", 13), somebody=w("hook", 15), idea=w("hook", 17),
    plan=sec("plan")["start"] - 0.1, signs=[w("plan", i) for i in (10, 11, 13, 14)], nobody=w("plan", 15),
    start=w("opinions", 0), publish=w("opinions", 1) + 0.15, everyone=w("opinions", 4), bubbles=[w("opinions", i) for i in (7, 9, 11)], opEnd=sec("opinions")["end"],
    dash=sec("flop")["start"] - 0.1, flop1=w("flop", 6), flop2=w("flop", 10),
    safe=sec("safe")["start"] - 0.1, hours=w("safe", 9), pay=w("safe", 13), dayOff=w("safe", 19),
    story=sec("story")["start"] - 0.1, replying=w("story", 8), yourStory=w("story", 11), asking=w("story", 12),
    loop=sec("loop")["start"] - 0.1, anyway=w("loop", 2), because=w("loop", 3) - 0.06,
)
T["end"] = sec("loop")["end"] + 0.32
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



# Restrained: the song carries the energy. Only human foley + real phone/UI sounds. Nothing at the opening cut.
# ---------------------------------------------------------------- hook (street → job app)
bed("ambience_highway", 0.0, T["jobs"], -36, fade=0.2)               # night street, distant
for k, at in enumerate([0.45, 0.7, 1.0, 1.9]):                       # friends moving as they laugh
    put("foley_cloth-1" if k % 2 else "foley_cloth-2", at, -25 - k, pan=0.35)
taps = [T["apply"] - 0.06 + i * 0.19 for i in range(3)]
for i, at in enumerate(taps):                                         # three Quick-apply taps
    put("ui_click-001", at, -18 + i, pan=0.05 * i)
put("ui_click-001", T["company"] - 0.08, -19)                         # tap the company
put("whoosh_swish-7", T["company"], -22)                              # page slides in
put("notification_confirm-002", T["somebody"], -17)                  # order #1
# ---------------------------------------------------------------- the plan (sign snaps)
bed("ambience_machine-02", T["plan"], T["dash"], -33, fade=0.25)
for i, at in enumerate(T["signs"]):
    put("whoosh_swish-9" if i % 2 else "whoosh_swish-7", at - 0.24, -17)  # camera whip
    put("mechanical_switch-01" if i % 2 == 0 else "mechanical_switch-02", at - 0.02, -20)  # sign light on
put("foley_cloth-2", T["nobody"], -18, pan=-0.2)                     # push off
put("body_breath", T["nobody"] + 0.05, -26, pan=-0.2)
put("footsteps_concrete-002", T["nobody"] + 0.6, -13, pan=-0.25)     # lands
put("footsteps_concrete-004", T["nobody"] + 0.78, -17, pan=-0.25)
put("foley_cloth-1", T["start"] - 0.4, -24, pan=-0.2)               # phone out of pocket
put("ui_click-001", T["publish"] - 0.02, -17)
put("notification_confirm-002", T["publish"] + 0.05, -18)            # store is live
# ---------------------------------------------------------------- flops
for at in (T["flop1"], T["flop2"]):
    put("ui_drop-002", at, -16)                                       # CLOSED
    put("whoosh_swish-7", at + 0.32, -20)                            # card swiped away
# ---------------------------------------------------------------- the safe route
bed("ambience_highway", T["safe"], T["story"], -40, fade=0.2)
for k in range(4):                                                    # items on the counter
    put("foley_items-01", T["safe"] + 0.25 + k * 0.45, -28 - k, pan=0.2)
for at in (T["hours"], T["pay"], T["dayOff"]):
    put("notification_question-001", at - 0.05, -17)                 # three work notifications
# ---------------------------------------------------------------- story replies (typing → ping)
for at in (T["replying"], T["yourStory"], T["asking"] + 0.25):
    for j in range(3):
        put(f"keyboard_key-{['003', '007', '012', '019'][j]}", at - 0.24 + j * 0.06, -30, pan=0.1)
    put("notification_confirm-002", at, -20)
# ---------------------------------------------------------------- start anyway → loop
put("ui_click-001", T["anyway"] - 0.05, -14)
put("notification_confirm-002", T["anyway"], -15)
bed("ambience_highway", T["because"], T["end"], -36, fade=0.15)
for i in range(4):                                                    # friends walking back in
    put(f"footsteps_concrete-00{i}", T["because"] + 0.1 + i * 0.24, -24 - i, pan=0.4)

out *= 10 ** (6 / 20)
peak = np.abs(out).max()
if peak > 0.89:
    out *= 0.89 / peak
sf.write(sys.argv[3], out.astype(np.float32), SR, subtype="PCM_16")
print(f"sfx: {len(out) / SR:.2f}s peak {20 * np.log10(np.abs(out).max() + 1e-9):.1f} dBFS")
