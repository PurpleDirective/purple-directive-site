---
title: "Why We Built Our Own Stack Instead of Buying One"
date: 2026-02-10
summary: "Every off-the-shelf tool we evaluated for clinical research operations was either too expensive, too rigid, or designed for organizations ten times our size. So we started building."
tags: ["architecture", "clinical-research", "operations"]
author: "Tyrian Murex"
---

The first thing you learn running a small CRO is that the tooling wasn't built for you.

Enterprise CTMS platforms start at five figures annually. EDC systems assume you have a dedicated data management team. Even basic regulatory document management tools are priced for organizations running 20+ concurrent studies.

We were running two. The tools we needed existed, but the economics didn't work.

## The Build-vs-Buy Calculation

For a small research organization, the math on commercial platforms is brutal:

- **CTMS licensing:** $15K-50K/year for platforms designed around workflows we don't use
- **EDC systems:** Per-study pricing that assumes hundreds of subjects, not dozens
- **Document management:** SharePoint works, but the clinical-specific overlays are enterprise-priced

The alternative wasn't "build everything from scratch." It was "build the parts that are specific to our workflow, and use commodity tools for everything else."

## What We Actually Needed

Our requirements were simpler than what enterprise tools assume:

- Track study status, site visits, and regulatory milestones across a small portfolio
- Generate and manage SOPs that reference current ICH guidelines
- Monitor ClinicalTrials.gov for new study opportunities
- Keep a clean regulatory binder structure without manual filing
- Send alerts when deadlines approach

None of this requires a $40K platform. It requires a database, some automation, and domain knowledge about what clinical research operations actually look like at ground level.

## The Approach

We started with the most painful manual process — tracking regulatory document expiration dates — and automated it. Then study visit scheduling. Then SOP version control. Each piece was small, specific, and immediately useful.

The key decision was keeping everything modular. Each tool is independent. The CTMS doesn't depend on the SOP generator. The study scanner doesn't depend on the CTMS. If any piece breaks or gets replaced, the others keep running.

This matters because small organizations can't afford system-wide outages. When your coordinator is also your regulatory specialist and your data manager, a broken tool means everything stops.

## What We Learned

**Start with the workflow, not the architecture.** The first version of our study tracker was a SQLite database with a CLI. No web interface, no dashboard. It worked. The dashboard came later, after we understood what we actually needed to see at a glance.

**Commercial tools aren't wrong — they're just not sized for us.** Oracle's Siebel CTMS is excellent for a 500-person CRO running global Phase III trials. It's absurd for a 3-person operation running two Phase II studies in cardiology. The gap in the market isn't capability — it's scale.

**Building tools teaches you your own operations.** The process of deciding what to automate forced us to document workflows we'd been running on intuition. That documentation became the foundation for our SOPs.

We're not anti-platform. When a study grows large enough to justify commercial tooling, we'll use it. But for now, purpose-built tools that match our actual scale outperform expensive platforms we'd use 10% of.
