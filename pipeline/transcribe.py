"""Transcribe a reference video's audio in ~8s chunks (cut at quiet points).
Usage: python -I pipeline/transcribe.py models/sherpa-onnx-whisper-small.en clip.wav [...]
(Extract audio first: ffmpeg -i ref.mp4 -ac 1 -ar 16000 clip.wav)"""
import sys, numpy as np, librosa, sherpa_onnx
M = sys.argv[1]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small.en-encoder.int8.onnx", decoder=f"{M}/small.en-decoder.int8.onnx",
                                                 tokens=f"{M}/small.en-tokens.txt", language="en", task="transcribe", num_threads=4)
for w in sys.argv[2:]:
    y, sr = librosa.load(w, sr=16000)
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=160)[0]
    cuts, pos = [0], 0
    while pos + 10 * sr < len(y):
        a, b = (pos + 6 * sr) // 160, (pos + 10 * sr) // 160
        pos = (a + int(np.argmin(rms[a:b]))) * 160; cuts.append(pos)
    cuts.append(len(y))
    print("=====", w)
    for s, e in zip(cuts[:-1], cuts[1:]):
        st = rec.create_stream(); st.accept_waveform(sr, y[s:e]); rec.decode_stream(st)
        print(f"[{s/sr:5.1f}-{e/sr:5.1f}] {st.result.text.strip()}")
