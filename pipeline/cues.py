"""Adds named cues to a timeline JSON. Cues are expressed relative to narration
words, so if the voice or pacing changes, every animation and sound effect
moves with it. Rules live in a per-video cue file.

Rule syntax:  "<line>.<wordIndex|start|end>[.start|.end] [+/- seconds]"
  e.g. "l1.-1.start"  -> start of last word of line l1
       "l2.start -0.15" -> 150 ms before line l2 begins
       "end"            -> end of timeline

Usage: python -I pipeline/cues.py studio/timelines/edu-preview.json scripts/edu-preview.cues.json
"""
import json, sys


def resolve(rule, tl):
    parts = rule.split()
    base, off = parts[0], float(parts[1]) if len(parts) > 1 else 0.0
    try:  # absolute seconds (e.g. a music pick)
        return float(base) + off
    except ValueError:
        pass
    if base == "end":
        return tl["duration"] + off
    lines = {l["id"]: l for l in tl["lines"]}
    seg = base.split(".")
    ln = lines[seg[0]]
    if seg[1] in ("start", "end"):
        return ln[seg[1]] + off
    w = ln["words"][int(seg[1])]
    return w[seg[2] if len(seg) > 2 else "start"] + off


def main(tl_path, rules_path):
    tl = json.load(open(tl_path))
    rules = json.load(open(rules_path))
    tl["cues"] = {k: round(resolve(v, tl), 3) for k, v in rules.items()}
    json.dump(tl, open(tl_path, "w"), indent=2)
    for k, v in tl["cues"].items():
        print(f"{k:14s} {v:6.2f}s  f{round(v * tl['fps'])}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
