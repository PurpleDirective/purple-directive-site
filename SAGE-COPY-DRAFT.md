# SAGE-COPY-DRAFT — About Page Path B Rewrite

**Task:** TASK-0512-004
**Date:** 2026-05-12
**Author:** Sage (Communications Director)

---

## Voice Decision

**First-person plural throughout.** "We" and "our" refer accurately to Tyrian Murex and the AI-augmented engineering practice — consistent with `feedback-plural-pronouns-accurate.md`. The existing hero, principles, and connect sections already use this voice; switching mid-page would fragment the read. The AI disclosure section below names Tyrian explicitly as the human decision-maker, so "we" never becomes cover for an AI legal claim.

---

## Section 1 — Hero (lines 8–17)

**Recommendation: keep as-is.**

The current hero copy already aligns with the first-person plural voice and makes no claims about team composition. The one change required is the `<title>` / `description` meta — "Meet the team behind the work" in the `<Base>` description tag implies multiple humans. Replace with: "Meet the founder behind the work."

```
<!-- Meta description replacement only -->
description="Purple Directive builds compliance-grade software and operations infrastructure for clinical research. Meet the founder behind the work."
```

No hero body copy changes needed.

---

## Section 2 — "How We Got Here" Rewrite (lines 23–38)

**Placement:** Same position in the page — immediately after hero, left column of the split layout.

### Heading
How We Got Here

### Paragraphs

> Purple Directive started where most small research sites start: active studies, borrowed SOPs, and commercial platforms sized for organizations ten times as large. The tools that existed were either too expensive, too rigid, or both — built for 500-person CROs with dedicated IT, not for coordinators who also handle regulatory submissions and study close-out in the same week.

> So we started building. SOPs aligned to ICH E6(R2/R3), written to cover the full study lifecycle without the filler. A clinical trial management system with a real audit trail and the workflows that coordinators actually use. Each tool was built because we needed it ourselves — developed during active work on FDA-regulated studies at a 21-hospital US academic health system. If it didn't hold up under a real monitoring visit, it didn't ship.

> That internal pressure is what turned Purple Directive from a tooling effort into a product company. Other sites were running into the same problems. The gap between what clinical research software promises and what it actually delivers in a small-site context was consistent enough to be worth closing.

**Word count:** ~153 words. Matches the existing 3-paragraph arc and rhythm.

**Notes:** Removed all "two co-founders" language. "We" here refers to the practice. "A 21-hospital US academic health system" is the Northwell substitute per brief instructions. No TBDs needed for this section.

---

## Section 3 — "The Team" Section Header (line 79)

**Recommendation:** Replace the section name and subhead entirely.

### Old
```
<h2>The Team</h2>
<p>Two co-founders. One builds the operations. The other builds the systems.</p>
```

### New
```
<h2>Founder</h2>
<p>Purple Directive is run by a practitioner — someone currently doing the work, not just advising on it.</p>
```

**Rationale:** "The Team" works for multi-person orgs; for a solo founder, "Founder" is cleaner and more accurate. The subhead replaces the two-person framing with a credibility claim that's honest and specific — the practitioner-in-the-field angle is the actual differentiator.

Alternative if Tyrian prefers a section header that scales better when contractors or staff are added: "Who's Behind This" — neutral, allows expansion without feeling wrong when it's one person.

---

## Section 4 — Single Founder Card (replacing lines 82–114)

**Placement:** Same founders-grid section, single card centered (Indigo's call on CSS — single-card centering vs. full-width).

### Card Copy

**Heading:** Tyrian M.

**Role label:** Founder & Principal

**Bio paragraph (~60 words):**

> Clinical research operations, regulatory compliance, and the engineering to put both into practice. Currently working on FDA-regulated Phase I–IV studies at a 21-hospital US academic health system. Background in GCP, ICH E6, and site start-up — the daily reality of running studies with lean teams, real regulators, and real deadlines. Founded Purple Directive to build the tools that didn't exist.

**Domain tags:** Clinical Ops | Regulatory | Engineering

**Notes:** "Engineering" replaces "Business" from the current card — more accurate given Tyrian built the CTMS and SOP library. Removed "co-founder" language. No AI partnership references. LinkedIn/contact link left for Indigo to wire from existing social data object; no new link needed, the connect section handles it.

---

## Section 5 — "What We Build" New Section

**Placement:** After the Founder section, before "How We Work" (Principles). This ordering makes sense: visitor learns who built it → what they built → how they work. The new section creates the portfolio breadth moment that Path B requires before sending them deeper into individual products.

### Section Header

```
<h2>What We Build</h2>
<p>Tools and resources for clinical research sites, sponsors, and the teams who run them.</p>
```

### Intro (optional — use if card grid needs more context)

> Everything we ship comes from working in clinical research. The products below are available now.

### Product Cards (4 — Tyrian adds Volstrin/QuillPDF at implementation time)

**Card 1 — Nexrial CTMS**
- **Label:** Nexrial CTMS
- **Description:** Purpose-built trial management for independent research sites. Audit trails, eSource, and ICH E6(R3) controls without enterprise pricing.
- **Link:** https://nexrial.com
- **CTA text:** Visit Nexrial

**Card 2 — SOP Bundle**
- **Label:** SOP Bundle
- **Description:** 12 ICH E6(R3)-aligned SOPs covering the full study lifecycle. Ready to adapt and deploy.
- **Link:** /sop-bundle
- **CTA text:** See the SOPs

**Card 3 — Research Reports**
- **Label:** Research Reports
- **Description:** Analyst-grade vendor comparison and regulatory landscape reports for sites making real purchasing decisions.
- **Link:** /research-report
- **CTA text:** View Reports

**Card 4 — Consulting**
- **Label:** Consulting
- **Description:** Site start-up, compliance infrastructure, and regulatory operations support. Engagements scoped by need.
- **Link:** /hire
- **CTA text:** Work With Us

**Notes:** Card descriptions are 15–25 words each. No hype language. Nexrial card navigates away from PD domain (nexrial.com) — Indigo should use `target="_blank" rel="noopener"` for that card only. The other three are internal links.

---

## Section 6 — AI Disclosure Paragraph

**Placement:** After "What We Build," before "How We Work" (Principles). Putting it before the principles keeps it in the factual/structural zone of the page; tucking it after principles reads like a footnote disclaimer, which undersells the transparency posture.

### Refined copy (from brief — refined for rhythm, all three factual claims preserved)

> Purple Directive uses AI-augmented engineering across our software products. Code is written and reviewed by Tyrian Murex, with AI assistance from a multi-agent system used internally for development, analysis, and documentation. AI does not act as a legal entity, does not sign contracts, and does not represent the company in any business or regulatory capacity. Detailed AI engineering practices specific to each product are described on that product's site.

**Word count:** 73 words. Under the 200-word ceiling.

**Changes from brief:** "analysis, and documentation" added after "development" — more accurate description of what the system does. "Any business or regulatory capacity" instead of "business or regulatory matters" — slightly tighter. Otherwise faithful to the three required claims.

**Notes:** No heading recommended for this paragraph — it reads as a plain disclosure, not a feature. If Indigo wants a visual anchor, a small cap label "Engineering Practices" above it would work; do not use "AI Disclosure" as a heading (flags rather than informs).

---

## Recommended Page Section Order (Path B)

```
1. Hero                    → keep as-is (update meta description only)
2. How We Got Here         → rewritten (this doc, Section 2)
3. Founder                 → rewritten (this doc, Sections 3 + 4)
4. What We Build [NEW]     → new section (this doc, Section 5)
5. AI Disclosure [NEW]     → new paragraph (this doc, Section 6)
6. How We Work             → keep as-is (principles grid untouched)
7. Get in Touch            → keep as-is
```

Rationale for new section placement: "What We Build" after "Founder" creates a natural narrative — who built it → what they built → how they approach it → find them. The AI disclosure paragraph sits adjacent to the product grid, which is where it's most contextually relevant (the products are where the AI engineering lives).

---

## Quality Gate Pre-check

- [ ] "Violet M." — zero occurrences in all new copy above
- [ ] "Co-Founder" / "co-founder" — zero occurrences
- [ ] "Two co-founders" — zero occurrences
- [ ] Voice: first-person plural throughout (all new sections)
- [ ] No Northwell mention — uses "21-hospital US academic health system"
- [ ] No invented credentials, sponsor names, or study counts
- [ ] AI disclosure: ≤200 words, three factual claims present
- [ ] No medical claims, no unsubstantiated promises
- [ ] No SaaS-bro openings, no "excited to" language

## TBDs

- `{TBD: Tyrian's confirmation that "Phase I–IV" accurately describes current study scope}` — used in founder bio; if scope is narrower, simplify to "FDA-regulated studies"
- `{TBD: Tyrian's decision on Volstrin and QuillPDF inclusion in "What We Build" product grid}`
- `{TBD: Tyrian's preference on section header — "Founder" vs "Who's Behind This"}`
- `{TBD: LinkedIn URL / handle for founder card}` — Indigo can pull from `social` data object already in the codebase

## Handoff Notes for Indigo

1. The founders-grid CSS currently uses `grid-template-columns: 1fr 1fr`. With a single card, either center it (`max-width: 480px; margin: 0 auto`) or go full-width (matches the Principles section width). Single-card-centered is the cleaner read.
2. The `avatar-violet` CSS class and gradient can be removed entirely.
3. "What We Build" section needs a new card component or can reuse `.principle-card` styling with link additions.
4. Nexrial card: `target="_blank" rel="noopener"` — external domain.
5. Merge order per TASK-0512-004: TASK-0512-003 (visual fixes) lands first; this copy layer goes on top.
