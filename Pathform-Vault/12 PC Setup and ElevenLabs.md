---
tags: [pathform, setup, windows, elevenlabs]
source: docs/PC_SETUP.md
---
# PC setup and ElevenLabs

## What to install (and what NOT to)
| Tool | Needed? | How |
|---|---|---|
| Git, Node.js LTS, Python 3.12, FFmpeg, VS Code, Obsidian | **Yes** | `setup/windows-setup.ps1` installs all of them via winget |
| **Remotion** | **Yes**, but not as a global app | It's an npm dependency of `studio/` (installed by `npm ci`). Live preview: `npx remotion studio` |
| Official Remotion skills for Claude | Recommended | `cd studio` then `npx skills add remotion-dev/skills` (command from Remotion's own README) |
| **ElevenLabs** | Yes (voice) | Account + API key (below). Our script `pipeline/tts_elevenlabs.py` uses it. No extra package needed |
| Claude Code | You already have it | |
| **Three.js** | **No, not now.** | Our 3D is a custom camera over SVG, which already works. Only add `@remotion/three` if a scene truly needs real 3D models. Adding it now = more dependencies for no gain |
| Audacity (free) | Optional | To actually *listen to and inspect* narration/music yourself, since Claude can't hear |
| yt-dlp / downloaders | Skip for now | Easy to cross copyright/ToS lines. Screen-record a TikTok sound instead |
| CapCut / DaVinci | Skip | The whole point is the code-driven pipeline |

## One-time setup (about 15 min, mostly downloads)
1. Open **PowerShell**.
2. `git clone https://github.com/GfdGSDAGDSGFDAA/Myfirstrepo- $HOME\Pathform`
3. `cd $HOME\Pathform` then `git checkout claude/tender-albattani-ujjnrp`
4. **Read** `setup\windows-setup.ps1` (it's short and commented), then run:
   `powershell -ExecutionPolicy Bypass -File setup\windows-setup.ps1`
5. If anything turns red, paste the error to Claude. The script was written on Linux and **has not been run on Windows yet**.
6. On a PC, Remotion downloads its own Chrome. Do **not** set `REMOTION_BROWSER`.

## ElevenLabs
1. Make an account at elevenlabs.io (check their pricing page yourself; I couldn't verify current prices or the commercial-use terms of your plan. **Confirm your plan allows commercial use for monetized/TikTok content.**)
2. Profile > **API Keys** > create a key. Copy it.
3. The setup script asks for it once and saves it as the Windows user variable `ELEVENLABS_API_KEY`. (Manual: `setx ELEVENLABS_API_KEY "paste-key"`, then open a new terminal.) **Never paste the key into a chat, a file, or git.**
4. Pick a voice **by ear** in the ElevenLabs site (Voices page). Filter: American, female, "conversational"/"calm". Add 2-3 to "My Voices", compare them reading our actual script, and copy the voice_id.
   List what you have: `.venv\Scripts\python -I pipeline\tts_elevenlabs.py --list-voices`
5. Put the id in the script JSON: `"elevenVoiceId": "..."` (optional: `elevenModel`, `elevenSettings`; see the top of `pipeline/tts_elevenlabs.py`).
6. Dry run (spends nothing): `.venv\Scripts\python -I pipeline\tts_elevenlabs.py scripts\doors-v3.json studio\public\audio\doors-v3 studio\timelines\doors-v3.json --dry-run`
7. Real run: same command without `--dry-run`. Responses are cached, so re-rendering the same text is free.
8. Then continue as usual (SFX, render). **The script is untested against the live API**; if it errors, paste the message to Claude.
- Official integrations I verified exist: PyPI `elevenlabs` (github.com/elevenlabs/elevenlabs-python), PyPI `elevenlabs-mcp` (published by an @elevenlabs.io address), npm `@elevenlabs/elevenlabs-js`. We use none of them yet (raw API, fewer dependencies). An MCP server could later let Claude Code call ElevenLabs directly; it would need the same key, so decide that deliberately.

## Obsidian
Open Obsidian > **Open folder as vault** > `Pathform\Pathform-Vault`. It's a separate vault from your Roblox one.

## Daily workflow on the PC
`cd studio` then `npx remotion studio` to scrub the video live. Then ask Claude Code (running in this repo on your PC) to make changes; it can now run renders locally, much faster than the cloud box.

Back to [[00 Home]]
