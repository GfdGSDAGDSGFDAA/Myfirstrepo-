---
tags: [pathform, environment]
source: docs/HANDOFF.md
---

# 03 Environment

Phone-vs-PC table is at the bottom. See also [[04 Repo and Pipeline]].

Back to [[00 Home]]

## 3. The environment (what the cloud session can and can't do), verified

| Item | Fact |
|---|---|
| Type | **Executable Claude Code cloud container**, not plain chat. Ephemeral: reclaimed after inactivity. Commit + push or lose it. |
| Hardware | 4 CPU, 15 GB RAM, ~30 GB free disk |
| Runtimes | Node 22, npm 10, Python 3.13, FFmpeg 6.1, git |
| Browser | Preinstalled Chromium: `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` |
| Network | **Allowed:** `registry.npmjs.org`, `pypi.org`, GitHub (including release downloads and `raw.githubusercontent.com`). **Blocked:** huggingface.co, api.elevenlabs.io, Remotion's own Chrome download host (remotion.media), openaipublic CDN, TikTok. (Gemini host answered 404 on `/`, i.e. reachable, but no key.) |
| Remotion render | Works. **Must set** `REMOTION_BROWSER` to the Chromium path above (Remotion's own Chrome download is blocked). `remotion.config.ts` reads that env var. |
| Render speed | 1080×1920 @ 60 fps ≈ **4.5 min per 37 s video**; half-scale 30 fps ≈ 25–50 s. Long commands move to background after 10 min; wait for the completion notice. |
| Hearing audio | **Cannot.** QA is done with numbers: ASR round-trip, beat analysis, loudness (ebur128). Never claim to have "listened". |
| Seeing video | Cannot watch motion; extracts frames with FFmpeg and reads contact sheets (see §12). |
| Sending files to the owner | `SendUserFile` tool. Use `display: "render"` for a video to play, `"attach"` for downloads. Keep phone copies small (CRF ~23–25). |
| GitHub | Only via MCP tools or git push (no `gh` CLI for PRs). Don't open a PR unless asked. |
| API keys present | **None.** No ElevenLabs, no Gemini. Never ask the owner to paste a key into chat. |
| Plugins | The owner was shown an install card for the **Remotion** plugin (`plugin_01JDeXWVDGBcvjLeLqQwb5bB`); it did **not** show as installed. Official Remotion skills were instead cloned (read-only) from `github.com/remotion-dev/skills` and read. |
| Other available MCP tools (unused) | ForgeGUI (image/music/sound-effect generation; credits-based), Shopify, Spotify, Claude Docs, GitHub. None were needed. |

### Phone vs PC
| Can do on phone (cloud session) | Needs the PC |
|---|---|
| Write/edit code, render, QA with frames, send MP4s, commit/push | Live scrubbing in Remotion Studio, listening to audio, ElevenLabs/Gemini setup with keys, big 4K renders, trying other TTS/music tools |
