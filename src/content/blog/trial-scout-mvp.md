---
title: "How We Built Trial Scout: Automated Study Intelligence for Small CROs"
date: 2026-03-17
summary: "Manually checking ClinicalTrials.gov doesn't scale. We built a pipeline that pulls 500+ studies daily, scores them against therapeutic focus, and surfaces the ones worth pursuing — so small CROs stop missing opportunities."
tags: ["tools", "clinical-research", "automation"]
author: "Tyrian Murex"
---

Running a small CRO means wearing every hat — business development, study coordination, regulatory, finance. One thing that consistently fell through the cracks was proactively monitoring for new clinical trial opportunities. Checking ClinicalTrials.gov manually when we remembered wasn't cutting it.

Trial Scout is the fix. It's a Python pipeline that runs daily on a dedicated server and surfaces relevant studies automatically.

## What it does

**Data sources:**
- ClinicalTrials.gov API v2 — the primary source, structured and well-documented
- openFDA — drug and device data to enrich study context

**Pipeline flow:**
1. Daily cron hits the ClinicalTrials.gov API with a broad therapeutic area filter
2. Results are deduplicated against a local SQLite database
3. Each study is scored against a priority model
4. High-priority studies trigger a push notification
5. Everything is queryable via the private dashboard

## The scoring model

Scoring was the hardest part to get right. The initial threshold was 70/100. After the first run returned 81 "high-priority" studies — which is too many to actually act on — I restructured it:

- Threshold raised to 80
- Therapeutic area weights tuned: obesity/diabetes/weight loss = high, Crohn's/UC = low (capacity constraints)
- Phase 1 studies excluded (site lacks phase 1 infrastructure)

Result: 81 studies → 31 genuinely actionable. That's a number a one-person BD operation can realistically work through.

## What we learned building it

**The data is messier than the API documentation implies.** Study status transitions (recruiting → active, not recruiting) aren't always reflected promptly. The pipeline now cross-references enrollment status against estimated completion dates to flag studies that are likely stale.

**Scoring is a proxy for fit, not a substitute for judgment.** A score of 85 doesn't mean we can execute the study. It means it's worth a closer look. The alert is a triage tool, not a decision.

**The real bottleneck isn't discovery.** We already had uncollected payments and unanswered sponsor emails — adding a discovery layer before fixing the BD pipeline would just surface more opportunities we weren't equipped to pursue. The right move was to build Trial Scout AND simultaneously address the BD backlog, not instead of it.

## Current state

The pipeline has been running daily since deployment. The SQLite database now has several hundred deduplicated studies. The scoring algorithm continues to be adjusted as we learn which study types actually convert to site agreements.

The pipeline is zero external AI dependencies and runs on any machine with Python and an internet connection. The architecture is simple enough to adapt for any therapeutic area or study type filter.
