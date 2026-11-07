"""Music timing file: tempo, beat grid, downbeat-ish accents, energy, sections.

Output JSON is read by scenes (beats/drops) and by humans (to choose cue points).
Automatic analysis finds WHERE things change; deciding which change is "the drop"
the video should hit is still a human call — record it under "picks".

Usage: python -I pipeline/analyze_music.py song.wav studio/timelines/music-<name>.json [maxSeconds]
"""
import json, sys
import numpy as np
import librosa


def main(path, out, max_s=None):
    y, sr = librosa.load(path, sr=22050, mono=True, duration=float(max_s) if max_s else None)
    hop = 512
    _, P = librosa.effects.hpss(y)
    tempo, beats = librosa.beat.beat_track(y=P, sr=sr, units="time")
    S = np.abs(librosa.stft(y, hop_length=hop))
    f = librosa.fft_frequencies(sr=sr)
    t = librosa.times_like(S, sr=sr, hop_length=hop)
    bass = S[f < 120].mean(0)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    pk = librosa.util.peak_pick(on, pre_max=8, post_max=8, pre_avg=20, post_avg=20, delta=1.2, wait=10)
    accents = sorted(((float(on[i]), float(t[i])) for i in pk), reverse=True)[:24]
    # bass in/out changes (1 s smoothing) = candidate drops / breakdowns
    k = int(sr / hop)
    sm = np.convolve(bass, np.ones(k) / k, mode="same")
    hi_state = sm > (np.median(sm) * 1.5)
    changes = [float(t[i]) for i in range(1, len(t)) if hi_state[i] != hi_state[i - 1]]
    energy = [round(float(20 * np.log10(rms[(t >= s) & (t < s + 1)].mean() + 1e-9)), 1) for s in range(int(len(y) / sr))]
    data = {
        "source": path.split("/")[-1],
        "tempo": round(float(np.atleast_1d(tempo)[0]), 2),
        "beats": [round(float(b), 3) for b in beats],
        "accents": sorted(round(b, 3) for _, b in accents),
        "bassChanges": [round(c, 2) for c in changes],
        "energyPerSecondDb": energy,
        "picks": {},
    }
    json.dump(data, open(out, "w"), indent=1)
    print(f"tempo {data['tempo']}  beats {len(data['beats'])}  bass changes {data['bassChanges'][:10]}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
