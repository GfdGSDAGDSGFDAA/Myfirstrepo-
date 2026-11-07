# Supply-chain security rules (slopsquatting defense)

AI assistants sometimes invent plausible package names. Attackers register those names and wait.
These rules apply to any human or AI working in this repo.

## Before adding ANY dependency
1. **Check it exists and is the right one**: `npm view <pkg>` / `pip index versions <pkg>`; compare the name character by character against the project's official docs.
2. **Check provenance**: age (>180 days), maintainer matches the official project, repo link matches the docs.
3. **Prefer fewer deps.** Don't install anything "just in case" (an unused `faster-whisper` once dragged in 8 extra packages).
4. **Pin exact versions** (no `^`/`~`, `==` for pip). Commit the lockfile. Use `npm ci`, not `npm install`, in fresh environments.
5. Run `python3 pipeline/verify_deps.py`. It must print "All direct dependencies verified."

## Never
- Run a script from a repo/URL that hasn't been read first (`curl | bash`, `postinstall` from unknown packages).
- Put API keys in code, scripts, env files, or chat. Keys go in the environment's secret store only.
- Load pickle/`.pt`/`.bin` model files from untrusted sources. We use ONNX (data-only) models from the official repos below.

## Known-good sources used so far
| Thing | Source |
|---|---|
| Kokoro TTS model + voices | github.com/thewh1teagle/kokoro-onnx (release `model-files-v1.0`), same maintainer as the PyPI `kokoro-onnx` |
| Whisper / Parakeet ASR models | github.com/k2-fsa/sherpa-onnx (release `asr-models`), same org as PyPI `sherpa-onnx` |
| Remotion | npm `remotion`, `@remotion/*` (github.com/remotion-dev/remotion) |
| Fonts | `@fontsource/*` (Inter Tight, IBM Plex Mono, OFL-licensed) |

## Install-time code
Only `esbuild` (Remotion's bundler) runs an install script; it is allowlisted in `verify_deps.py`.
Any new package with an install script must be reviewed before it is added to the allowlist.

## Audit log
- 2026-11-07: full audit. 300 npm packages hash-locked to registry.npmjs.org, `npm audit` = 0 vulnerabilities.
  Pip tree reviewed; unused `faster-whisper` chain (incl. `httpx2`/`httpcore2`, legit: Tom Christie / pydantic/httpx2, pulled by huggingface_hub) removed.
- 2026-11-07: third-party vetting (read-only review, nothing executed):
  - `jackywest/idea-to-3d` @ `9bb6749610223cd0ffc009abee38fc3bc62f3716`: 3 commits / 2 days old, 1 author. `install.mjs` = 15 lines, only copies the skill folder to `~/.claude/skills`. SKILL.md clean. Dev dep puppeteer-core (Google). Verdict: OK to install **pinned to this commit**; it's brand new, so re-read the diff before updating.
  - `EssouliAnas/claude-animated-shorts` @ `772f51f425fcc9e17f205d454946efe035134e6f`: 1 commit / 5 days old, 1 author. `setup.ps1` only checks tools, `pip --user numpy scipy`, `npm install`, downloads CC0 Kenney models from kenney.nl, sets REMOTION_TMP, links the skill. SKILL.md clean. Deps are real (three, @react-three/fiber, postprocessing, @remotion/three). Verdict: OK as a **reference / separate folder**; use `npm ci` (not `npm install`); don't run inside the Pathform repo.
  - `m-bain/whisperX`: real (PyPI `whisperx` 3.8.6, since 2024). Don't use `uvx git+https://...` (unpinned HEAD); if ever needed: `pip install whisperx==3.8.6` in a venv. Not needed now (Parakeet + ElevenLabs timestamps cover it).
  - `npx skills add remotion-dev/skills`: npm `skills` = github.com/vercel-labs/skills (maintainers include Vercel's CEO); installs Remotion's official skills. OK.
