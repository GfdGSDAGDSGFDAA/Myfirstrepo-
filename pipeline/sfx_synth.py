"""Original sound design, synthesized from scratch (no samples => no licensing
questions). Reads cue times from the timeline and writes a stereo bed.

Usage: python -I pipeline/sfx_synth.py studio/timelines/edu-preview.json studio/public/audio/edu-preview/sfx.wav
"""
import json, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(7)


def env_adsr(n, a, d, peak=1.0):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / d))
    return e * peak


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def place(buf, x, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * l * gain
    buf[i:i + len(x), 1] += x * r * gain


def db(v):
    return 10 ** (v / 20)


def main(tl_path, out):
    tl = json.load(open(tl_path))
    c, T = tl["cues"], tl["duration"]
    N = int(T * SR)
    dry = np.zeros((N, 2))
    wet_send = np.zeros((N, 2))
    t = np.arange(N) / SR

    # 1. Room drone: low fifth + filtered air. Present from frame 0 (no silent intro).
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)
    drone = (np.sin(2 * np.pi * 55 * t) * 0.6 + np.sin(2 * np.pi * 82.4 * t + 1) * 0.35
             + np.sin(2 * np.pi * 110.2 * t) * 0.15 * lfo)
    air = lp(rng.standard_normal(N), 900) * 0.25
    denv = np.clip(t / 0.25, 0, 1) * np.clip((T - t) / 0.9, 0, 1)
    # lift during the reveal, settle after
    lift = 1 + 0.6 * np.exp(-((t - (c["pullEnd"] - 0.6)) / 1.4) ** 2)
    bed = (drone + air) * denv * lift
    dry[:, 0] += bed * db(-27)
    dry[:, 1] += np.roll(bed, 240) * db(-27)

    # 2. Flare on "same door": soft bloom (filtered noise + low sine body)
    n = int(1.6 * SR)
    fl = bp(rng.standard_normal(n), 300, 2500) * env_adsr(n, 0.02, 0.35) * 0.5
    fl += np.sin(2 * np.pi * 146.8 * np.arange(n) / SR) * env_adsr(n, 0.01, 0.6)
    place(dry, fl, c["flare"] - 0.01, 0, db(-22))
    place(wet_send, fl, c["flare"] - 0.01, 0, db(-18))

    # 3. Camera pull-back whoosh: band sweep that follows the move's velocity
    a, b = c["pullStart"], c["pullEnd"]
    n = int((b - a + 0.6) * SR)
    tt = np.arange(n) / n
    noise = rng.standard_normal(n)
    lo_band = bp(noise, 150, 600)
    hi_band = bp(noise, 600, 3000)
    vel = np.sin(np.pi * np.clip(tt * 1.12, 0, 1)) ** 2  # ease in/out velocity profile
    wh = (lo_band * (1 - tt) + hi_band * tt * 0.6) * vel
    place(dry, wh, a, -0.1, db(-21))
    place(wet_send, wh, a, 0, db(-24))

    # 4. Door ignitions: glassy pings, panned by wall side, pentatonic, staggered
    notes = [659.3, 784.0, 880.0, 987.8, 1174.7, 1318.5, 1568.0, 1760.0]
    side = [-1, 1, -1, 1, -1, 1, -1, 1]
    start, span = c["doorsStart"], (c["collegeLabel"] - 0.35) - c["doorsStart"]
    for i, f in enumerate(notes):
        at = start + span * (i / (len(notes) - 1)) ** 0.85
        n = int(1.2 * SR)
        tt = np.arange(n) / SR
        p = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)) * env_adsr(n, 0.004, 0.28)
        p += bp(rng.standard_normal(n), 2000, 7000) * env_adsr(n, 0.001, 0.015) * 0.3
        place(dry, p, at, side[i] * 0.55, db(-30))
        place(wet_send, p, at, side[i] * 0.3, db(-24))

    # 5. Swell into "only one" + soft sub landing
    s = c["swell"]
    n = int(1.4 * SR)
    tt = np.arange(n) / n
    sw = bp(rng.standard_normal(n), 400, 5000) * tt ** 3 * 0.6
    place(dry, sw, s - 1.15, 0, db(-26))
    place(wet_send, sw, s - 1.15, 0, db(-22))
    n = int(2.2 * SR)
    tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 18)) * tt) * env_adsr(n, 0.006, 0.7)
    place(dry, sub, s + 0.22, 0, db(-17))
    shimmer = sum(np.sin(2 * np.pi * f * tt) for f in (659.3, 987.8, 1318.5)) * env_adsr(n, 0.25, 0.9) / 3
    place(wet_send, shimmer, s + 0.22, 0, db(-26))

    # Reverb: synthetic exponential-decay IR (decorrelated L/R)
    ir_n = int(2.4 * SR)
    irt = np.arange(ir_n) / SR
    ir = [lp(rng.standard_normal(ir_n), 5000) * np.exp(-irt / 0.55) for _ in range(2)]
    wet = np.stack([fftconvolve(wet_send[:, i], ir[i])[:N] for i in range(2)], 1) * 0.12

    mix = dry + wet
    mix = np.tanh(mix * 1.2) / 1.2
    peak = np.abs(mix).max()
    if peak > db(-3):
        mix *= db(-3) / peak
    sf.write(out, mix.astype(np.float32), SR, subtype="PCM_16")
    print("sfx peak dBFS %.1f, rms dBFS %.1f" % (20 * np.log10(np.abs(mix).max()), 20 * np.log10(np.sqrt((mix ** 2).mean()))))


if __name__ == "__main__":
    main(*sys.argv[1:3])
