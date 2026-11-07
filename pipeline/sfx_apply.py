"""SFX for Apply v1 — REAL RECORDINGS (CC0), placed from the narration timeline.

Samples live in studio/public/audio/apply-v1/sfx-src (see CREDITS.md there): Kenney packs and
OpenGameArt artists (rubberduck, artisticdude), via the Alvana Audio collection. No synthesized SFX.
Restrained by design: ambience beds + a few motivated hits. Times mirror studio/src/scenes/apply-v1/timing.ts.

Usage: python -I pipeline/sfx_apply.py studio/timelines/apply-v1.json studio/public/audio/apply-v1/sfx-src out.wav
"""
import json, os, sys
import numpy as np, soundfile as sf

SR = 48000
tl = json.load(open(sys.argv[1]))
SRC = sys.argv[2]
L = {l["id"]: l for l in tl["lines"]}
w = lambda sid, i: L[sid]["words"][i]["start"]
sec = lambda sid: L[sid]

# ---- story beats (same derivation as timing.ts)
T = dict(
    sketch=0.15, unreal=w("hook", 5), then=w("hook", 6), company=w("hook", 10), started=w("hook", 12), idea=w("hook", 15),
    belt=sec("plan")["start"] - 0.12, gates=[w("plan", i) for i in (10, 11, 13, 14, 15)], nobody=w("plan", 16),
    starting=w("opinions", 2), bubbles=[w("opinions", i) for i in (9, 11, 13)], opEnd=sec("opinions")["end"],
    flop1=w("flop", 4), rebuild=w("flop", 5), flop2=w("flop", 8), but=w("flop", 9), companies=w("flop", 16),
    lay=w("flop", 17), off=w("flop", 19),
    phones=sec("flip")["start"] - 0.12, scrolling=w("flip", 6) - 0.12, hiring=w("flip", 12), yours=w("flip", 14),
    close=sec("close")["start"] - 0.12, whatIf=w("close", 9),
)
T["end"] = sec("close")["end"] + 1.75
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


# ---------------------------------------------------------------- hook: plaza, the laugh, the rewind
bed("ambience_highway", 0.0, T["belt"], -34, fade=0.3)               # distant city
put("paper_paper-02", T["sketch"], -17, pan=-0.3)                    # sketch held up
put("foley_cloth-1", 0.45, -26, pan=0.3); put("foley_cloth-2", 1.55, -26, pan=0.4)  # laughers moving
put("foley_cloth-2", T["then"] - 0.05, -24, pan=0.3)                 # they turn back to the line
put("paper_book-flip-1", T["then"] + 0.25, -24, pan=0.35)            # resumes come up
put("whoosh_air-01", T["then"] - 0.15, -21, length=1.4, fade_in=0.3) # camera pulls back
# rewind: a reversed rush of air + reversed construction, sucked into the garage
put("whoosh_air-01", T["idea"] - 2.64 + 0.05, -16, rev=True)
put("ambience_construction-site", T["started"] - 0.1, -24, rev=True, length=1.25, fade_in=0.25)
put("mechanical_switch-01", T["idea"] - 0.02, -14)                   # the bulb clicks on
put("door_close-1", T["idea"] + 0.1, -27, rate=0.8)                  # roll-up door settles

# ---------------------------------------------------------------- the belt
bed("ambience_machine-02", T["belt"], T["phones"], -30, fade=0.25)  # conveyor hum
put("impact_soft-medium-001", T["belt"], -22)                        # hard cut weight
for k, at in enumerate(T["gates"]):                                  # each gate light switches on
    put("mechanical_switch-02" if k % 2 else "mechanical_switch-01", at - 0.02, -21 - k * 1.2, pan=-0.2 + 0.1 * k)
put("foley_cloth-1", T["nobody"], -20, pan=-0.2)                     # steps off the belt
put("footsteps_concrete-002", T["nobody"] + 0.62, -15, pan=-0.25)
put("footsteps_concrete-004", T["nobody"] + 0.86, -18, pan=-0.25)
for k, at in enumerate([T["starting"], T["starting"] + 0.5, T["starting"] + 1.0]):
    put("impact_wood-light-001" if k != 1 else "impact_wood-medium-000", at + 0.18, -15 - k, pan=-0.45)  # blocks placed
for at in T["bubbles"]:
    put("ui_select-002", at - 0.05, -24, pan=0.25)                   # bubble appears (tiny tick)
# first flop
put("impact_wood-heavy-001", T["flop1"] + 0.45, -9, pan=-0.45)
put("impact_plank-medium-000", T["flop1"] + 0.5, -12, pan=-0.5)
put("impact_wood-light-001", T["flop1"] + 0.68, -20, pan=-0.5, rate=1.1)
# rebuild: four quick taps
for k in range(4):
    put("impact_wood-light-001", T["rebuild"] + k * 0.09 + 0.1, -21, pan=-0.45, rate=0.95 + 0.06 * k)
# second flop: heavier, comes apart
put("impact_wood-heavy-001", T["flop2"] + 0.45, -8, pan=-0.5, rate=0.92)
put("impact_plank-medium-002", T["flop2"] + 0.48, -10, pan=-0.55)
put("impact_wood-medium-002", T["flop2"] + 0.66, -16, pan=-0.6)
put("impact_wood-light-001", T["flop2"] + 0.8, -21, pan=-0.6, rate=1.15)
put("whoosh_air-02", T["but"] - 0.1, -24)                            # camera glides to HIRED
# layoffs: the light dies, people step off with boxes
put("mechanical_switch-01", T["lay"], -17, pan=0.1); put("mechanical_switch-02", T["lay"] + 0.16, -22, pan=0.1)
put("mechanical_metal-latch", T["lay"] + 0.4, -20, pan=0.1)
for j in range(3):
    at = T["off"] - 0.35 + j * 0.14
    put("foley_items-01", at + 0.15, -24, pan=-0.3 + 0.1 * j)        # box picked up
    put(f"footsteps_concrete-00{j}", at + 0.55, -19, pan=-0.3 + 0.1 * j)

# ---------------------------------------------------------------- phones + listings
put("impact_soft-medium-001", T["phones"], -24)
for k, at in enumerate([T["scrolling"] + 0.05, T["scrolling"] + 0.45, T["scrolling"] + 0.95]):
    put("ui_scroll-002" if k % 2 == 0 else "ui_scroll-001", at, -27 - k * 2, length=0.35)
put("ui_click-001", T["hiring"] + 0.12, -22)                          # scroll lands
put("notification_confirm-002", T["yours"], -19)                     # it's his
put("whoosh_air-02", T["close"] - 0.5, -18, length=0.6, fade_in=0.2)  # zoom into the logo
put("impact_soft-heavy-000", T["close"], -13)                        # match cut onto his tower

# ---------------------------------------------------------------- close
bed("ambience_highway", T["close"], T["end"], -33, fade=0.5)
put("whoosh_air-01", T["close"] + 0.1, -24, length=1.8, fade_in=0.2)  # long pull back
put("whoosh_air-02", T["whatIf"] - 0.9, -27, rev=True)               # lights swell
put("door_open-2", T["whatIf"] + 0.2, -30, pan=0.3)                  # his doors open, faint

out *= 10 ** (6 / 20)  # bus gain: sits ~15 LU under the voice, hits still land
peak = np.abs(out).max()
if peak > 0.89:
    out *= 0.89 / peak
sf.write(sys.argv[3], out.astype(np.float32), SR, subtype="PCM_16")
print(f"sfx: {len(out) / SR:.2f}s peak {20 * np.log10(np.abs(out).max() + 1e-9):.1f} dBFS")
