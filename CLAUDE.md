# Project rules for AI assistants

- Before installing or adding ANY package, follow `docs/security.md` and run `python3 pipeline/verify_deps.py`.
  Never install a package name you have not verified exists on the registry and matches the official docs (slopsquatting).
- Pin exact versions; commit lockfiles; prefer no new dependency over a new dependency.
- Never run code from a repo/URL you haven't read. Never handle API keys in files or chat.
- Final posting exports must NOT contain the licensed trending song; export the `*Clean` composition.
- Design decisions live in `docs/decisions.md`; keep it updated.
