"""Slopsquatting guard. Run BEFORE installing anything new, and in CI.

For every direct dependency in studio/package.json and pipeline/requirements.txt it asks the
real registry and FAILS if a package:
  - doesn't exist (an AI may have invented the name),
  - is younger than MIN_AGE_DAYS (fresh names are how squatters get in),
  - has no source-repository link,
  - isn't pinned to an exact version.
It also lists npm packages that run code at install time (only allowlisted ones may).

Usage: python3 pipeline/verify_deps.py
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone

MIN_AGE_DAYS = 180
INSTALL_SCRIPT_ALLOWLIST = {"node_modules/esbuild"}  # Remotion's bundler; verifies its native binary


def get(url):
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        return None


def age_days(iso):
    t = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return (datetime.now(timezone.utc) - t).days


problems = []

pkg = json.load(open("studio/package.json"))
for name, ver in {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}.items():
    if not re.fullmatch(r"\d+\.\d+\.\d+", ver):
        problems.append(f"npm {name}@{ver}: not pinned to an exact version")
    d = get(f"https://registry.npmjs.org/{name.replace('/', '%2F')}")
    if not d:
        problems.append(f"npm {name}: NOT FOUND on registry (possibly hallucinated)")
        continue
    created = d.get("time", {}).get("created")
    repo = (d.get("repository") or {}).get("url") if isinstance(d.get("repository"), dict) else d.get("repository")
    if created and age_days(created) < MIN_AGE_DAYS:
        problems.append(f"npm {name}: only {age_days(created)} days old")
    if not repo:
        problems.append(f"npm {name}: no repository link")
    print(f"npm  {name:30s} ok  first published {str(created)[:10]}")

for line in open("pipeline/requirements.txt"):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    m = re.fullmatch(r"([A-Za-z0-9_.\-]+)==([\w.]+)", line)
    if not m:
        problems.append(f"pip {line}: not pinned with ==")
        continue
    name = m.group(1)
    d = get(f"https://pypi.org/pypi/{name}/json")
    if not d:
        problems.append(f"pip {name}: NOT FOUND on PyPI (possibly hallucinated)")
        continue
    first = min((f["upload_time_iso_8601"] for v in d["releases"].values() for f in v), default=None)
    urls = d["info"].get("project_urls") or {}
    if first and age_days(first) < MIN_AGE_DAYS:
        problems.append(f"pip {name}: only {age_days(first)} days old")
    if not (d["info"].get("home_page") or urls):
        problems.append(f"pip {name}: no project/source link")
    print(f"pip  {name:30s} ok  first release {str(first)[:10]}")

lock = json.load(open("studio/package-lock.json"))["packages"]
for k, v in lock.items():
    if v.get("hasInstallScript") and k not in INSTALL_SCRIPT_ALLOWLIST:
        problems.append(f"{k}: runs an install script and is not allowlisted")
    if k and not v.get("integrity"):
        problems.append(f"{k}: no integrity hash in lockfile")

print()
if problems:
    print("PROBLEMS:")
    for p in problems:
        print("  -", p)
    sys.exit(1)
print("All direct dependencies verified.")
