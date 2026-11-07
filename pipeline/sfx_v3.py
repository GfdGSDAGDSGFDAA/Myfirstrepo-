"""Minimal original SFX for Doors v3 (owner: "a few, don't overdo").
Usage: python -I pipeline/sfx_v3.py studio/timelines/doors-v3.json out.wav"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(3)
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)
env = lambda n, a, d: np.where(np.arange(n) / SR < a, np.arange(n) / SR / a, np.exp(-(np.arange(n) / SR - a) / d))

tl = json.load(open(sys.argv[1]))
W = {l["id"]: l["words"] for l in tl["lines"]}
dur = 36.2
out = np.zeros((int(dur * SR), 2))
def put(x, at, g, pan=0.0):
    i = int(at * SR); x = x[: len(out) - i]
    out[i:i + len(x), 0] += x * g * (1 - max(0, pan)); out[i:i + len(x), 1] += x * g * (1 + min(0, pan))

# light burst whoosh (16.37)
n = int(1.4 * SR); tt = np.arange(n) / n
put(bp(rng.standard_normal(n), 300, 4000) * np.sin(np.pi * tt) ** 2 * (1 - tt) * 0.8, 16.37 - 0.35, 0.35)
# three soft notification pings on the bedroom chips
for k, at in enumerate([W["bedroom"][2]["start"], W["bedroom"][9]["start"], W["bedroom"][12]["start"]]):
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = [1318.5, 1568.0, 1760.0][k]
    ping = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 1.5 * t)) * env(n, 0.004, 0.13)
    put(ping, at, 0.16, pan=0.25)
# phone door: rising shimmer into the burst
op = W["close"][17]["start"]
n = int(1.2 * SR); t = np.arange(n) / SR
sh = sum(np.sin(2 * np.pi * f * t) for f in (880, 1320, 1760)) / 3 * (t / t[-1]) ** 2
put(sh, op - 0.9, 0.12)
n = int(1.0 * SR); t = np.arange(n) / SR
put(bp(rng.standard_normal(n), 500, 6000) * env(n, 0.01, 0.35), op + 0.05, 0.25)
out = np.tanh(out * 1.3) / 1.3
sf.write(sys.argv[2], out.astype(np.float32), SR, subtype="PCM_16")
print("sfx ok")
