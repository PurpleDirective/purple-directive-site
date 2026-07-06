#!/usr/bin/env python3
"""Regenerate the DEPLOYED chat system prompt from system-prompt.txt (canonical source).

The site assistant ships functions/api/_chat-system-prompt.ts — chat.ts imports
SYSTEM_PROMPT from it. THAT is the file this script regenerates. Edit
system-prompt.txt, then run:  python3 previews/chat-agent/build-prompt.py

Keep system-prompt.txt a faithful mirror of what should ship: a stale edit here
now writes production, so review the diff. Nexrial prices are live-Stripe truth —
verify against Stripe before changing any price (see the nexrial stripe-catalog memory)."""
import json, pathlib
here = pathlib.Path(__file__).parent
site_root = here.parents[1]                      # .../3.Brand/1.Site
txt = (here / "system-prompt.txt").read_text(encoding="utf-8")
out = ("// GENERATED FILE — do not edit by hand.\n"
       "// Source of truth: previews/chat-agent/system-prompt.txt\n"
       "// Regenerate: python3 previews/chat-agent/build-prompt.py\n"
       f"export const SYSTEM_PROMPT = {json.dumps(txt)};\n")
target = site_root / "functions" / "api" / "_chat-system-prompt.ts"
target.write_text(out, encoding="utf-8")
print(f"wrote {target.relative_to(site_root)} ({len(out)} bytes)")
