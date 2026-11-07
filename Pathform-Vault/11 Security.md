---
tags: [pathform, security]
source: docs/HANDOFF.md
---

# 11 Security


Back to [[00 Home]]

## 14. Security rules (full text in `docs/security.md`)

Triggered by a video on **slopsquatting** (AI hallucinates a package name → attacker registers it → install = malware).
- Before any install: verify the package exists and matches the official docs; check age, maintainer, repo; **pin exact versions**; commit lockfiles; use `npm ci`.
- Run `python3 pipeline/verify_deps.py` (fails on missing/young/unpinned/unallowlisted-install-script packages).
- **Audit (2026-11-07):** 12 npm + 6 pip direct deps all legit; `npm audit` = 0 vulnerabilities; 300 npm packages hash-locked to registry.npmjs.org; only `esbuild` runs an install script (allowlisted); unused `faster-whisper` chain (incl. `httpx2`/`httpcore2`, legit: Tom Christie / pydantic/httpx2, pulled by huggingface_hub) removed.
- Never run unread scripts; never put API keys in code, files or chat; use ONNX (data-only) models from the official repos only.
