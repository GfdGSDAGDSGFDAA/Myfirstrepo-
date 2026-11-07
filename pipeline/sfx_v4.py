"""Restrained original SFX for Doors v4. Times come from the narration timeline.
Usage: python -I pipeline/sfx_v4.py studio/timelines/doors-v3.json out.wav"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(4)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)
lp = lambda x, f: sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / d))

tl = json.load(open(sys.argv[1]))
W = {l["id"]: l["words"] for l in tl["lines"]}
S = {l["id"]: l for l in tl["lines"]}
out = np.zeros((int(38.0 * SR), 2))
def put(x, at, g, pan=0.0):
    i = int(at * SR); x = x[: max(0, len(out) - i)]
    out[i:i + len(x), 0] += x * g * (1 - max(0, pan)); out[i:i + len(x), 1] += x * g * (1 + min(0, pan))

# dinner: fork set down on a plate (two small metallic ticks)
for k, at in enumerate([0.95, 1.02]):
    n = int(0.25 * SR); t = np.arange(n) / SR
    tick = sum(np.sin(2 * np.pi * f * t) for f in (2950, 4170, 5230)) * env(n, 0.001, 0.035 - k * 0.01)
    put(tick, at, 0.08 * (1 - 0.4 * k), pan=0.3)
# soft room-tone swell under the dinner -> hallway morph
n = int(1.6 * SR); tt = np.arange(n) / n
put(lp(rng.standard_normal(n), 700) * np.sin(np.pi * tt) ** 2, 2.6, 0.12)
# footsteps on his walk to the door (one per beat) + two steps through it
walk0 = W["gpa"][9]["start"]
arrive = walk0 + 1.2
steps = [walk0 + 0.29 + i * 0.5805 for i in range(2)] + [arrive + 0.36 + i * 0.25 for i in range(2)]
for at in steps:
    n = int(0.12 * SR)
    put(lp(rng.standard_normal(n), 900) * env(n, 0.002, 0.03), at, 0.18)
# door handle click + creak as it swings open
n = int(0.08 * SR); put(bp(rng.standard_normal(n), 2000, 6000) * env(n, 0.001, 0.01), arrive - 0.09, 0.2)
n = int(0.7 * SR); t = np.arange(n) / SR
creak = np.sin(2 * np.pi * (180 + 90 * t / t[-1]) * t * (1 + 0.02 * np.sin(2 * np.pi * 31 * t))) * env(n, 0.05, 0.25)
put(bp(creak, 150, 1600), arrive - 0.06, 0.07)
# light burst on "off"
n = int(1.3 * SR); tt = np.arange(n) / n
put(bp(rng.standard_normal(n), 300, 4000) * np.sin(np.pi * tt) ** 2 * (1 - tt) * 0.8, 16.37 - 0.35, 0.3)
# order pings
for k, idx in enumerate([2, 11, 14]):
    at = W["bedroom"][idx]["start"]
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = [1318.5, 1568.0, 1760.0][k]
    put((np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 1.5 * t)) * env(n, 0.004, 0.13), at, 0.15, pan=0.25)
# phone door: small creak + rising shimmer, then soft air as we pass through
op = W["close"][17]["start"]
n = int(0.5 * SR); t = np.arange(n) / SR
put(bp(np.sin(2 * np.pi * (220 + 120 * t / t[-1]) * t) * env(n, 0.03, 0.2), 150, 2000), op - 0.1, 0.06)
n = int(1.1 * SR); t = np.arange(n) / SR
put(sum(np.sin(2 * np.pi * f * t) for f in (880, 1320, 1760)) / 3 * (t / t[-1]) ** 2, op - 0.4, 0.1)
n = int(0.9 * SR); tt = np.arange(n) / n
put(lp(rng.standard_normal(n), 2500) * np.sin(np.pi * tt), op + 0.25, 0.1)
# final: his first steps
fin = S["close"]["words"][-1]["start"]
for i in range(3):
    n = int(0.12 * SR); put(lp(rng.standard_normal(n), 900) * env(n, 0.002, 0.03), fin + 0.15 + i * 0.5805, 0.16)
out = np.tanh(out * 1.3) / 1.3
sf.write(sys.argv[2], out.astype(np.float32), SR, subtype="PCM_16")
print("sfx ok")
