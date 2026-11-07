---
tags: [pathform, audio]
source: docs/HANDOFF.md
---

# 07 Audio

ElevenLabs: [[12 PC Setup and ElevenLabs]].

Back to [[00 Home]]

## 10. Audio details (everything)

| Topic | Answer |
|---|---|
| Voice engine | **Kokoro v1.0 (ONNX, Apache-2.0, runs offline)**, voice **`af_heart`** (owner: "female voice sounds best"). Speed ~1.04–1.12 per section. Tested alternatives: `am_michael/fenrir/puck`, `af_bella/nicole/sarah/nova/aoede/kore`. |
| Why temporary | Owner wants "more human, less AI". **ElevenLabs** is the plan (set up on the PC with their key). ElevenLabs' `/with-timestamps` gives true character timings; the pipeline's timeline JSON format can stay the same. (**Unverified:** I could not reach ElevenLabs from the cloud.) |
| Word timing | **Parakeet-TDT 0.6B v2 int8 via sherpa-onnx** (cloud-reachable via GitHub releases). Whisper small.en is also installed (used for reference transcripts and early round-trip checks). |
| Music understanding | `librosa`: tempo, beats, onsets, bass/energy per second, section boundaries. It finds **where** things change; a human decides what's "the drop". It can't judge mood/genre. A **Gemini** audio pass could add semantic understanding (**proposed; needs the owner's key; unverified**). |
| What the owner should send for a new sound | An **MP4 screen-recording of the TikTok sound** (as they did for VYZEE) or an audio file, plus a note on the key moments. Links don't work (TikTok blocked). |
| Loudness | Narration −14 LUFS before mixing; final mix ≈ **−13.4 LUFS**; music bed ≈ −19.5 LUFS under the voice; true-peak ≤ −1.2 dB. |
| SFX | Synthesized in code (`sfx_v4.py`); restrained by design. |
| Licensing rule | Analysis ≠ redistribution. Post `…Clean`; add licensed platform music inside TikTok/Instagram. Document any music license used. |
