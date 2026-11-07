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
