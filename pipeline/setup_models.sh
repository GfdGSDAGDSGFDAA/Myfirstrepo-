#!/usr/bin/env bash
# Downloads open models used by the pipeline (not committed: ~1 GB).
set -euo pipefail
DIR="${1:-models}"; mkdir -p "$DIR"; cd "$DIR"
# Kokoro TTS (Apache-2.0) — temporary narration voice
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
# Whisper small.en via sherpa-onnx — transcribing reference videos / sound checks
curl -sSLO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.en.tar.bz2
tar xjf sherpa-onnx-whisper-small.en.tar.bz2 && rm sherpa-onnx-whisper-small.en.tar.bz2
# Parakeet-TDT 0.6B v2 (int8) via sherpa-onnx — word-level timestamps for captions (used by tts_sections.py)
curl -sSLO https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2
tar xjf sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2 && rm sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2
echo "models ready in $(pwd)"
