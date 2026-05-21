---
title: "Site Delegation Log vs. Form FDA 1572: How They Align (and Where Sites Get It Wrong)"
date: 2026-05-21
summary: "The DOA log and Form 1572 are the two documents most monitors check first. They have to agree — exactly — and most sites can't prove they do. Here's what alignment looks like, and the five misalignments that show up in BIMO observations."
tags: ["sops", "delegation-log", "form-1572", "compliance", "ich-gcp", "e6-r3"]
author: "Tyrian Murex"
---

A monitor walks into your site for the first interim monitoring visit. They sit down at the regulatory binder, and they don't open it to the protocol or the IRB approval. They open it to two specific documents: your **Site Delegation of Authority Log** (the DOA log) and your most current **Form FDA 1572**.

They lay them side by side. They check that every name appears on both, that every name on both is performing the role each document claims, and that both documents were signed by the current Principal Investigator on or before the dates the work was performed.

This pair of documents is the operational core of investigator oversight. ICH E6(R2) §4.1.5 requires the investigator to maintain a list of qualified persons delegated significant trial-related duties. ICH E6(R3) refined the language but didn't soften it — investigator accountability for delegated tasks is now even more explicit (R3.5.1.5). The DOA log is how a site documents that the PI knows who is doing what. Form 1572 is the parallel commitment to the sponsor and to FDA. When the two disagree, the site is, by definition, out of compliance.

Most BIMO observations involving delegation aren't about *whether* the site delegated correctly. They're about whether the paper agrees with itself.

## What the DOA log captures

The Site Delegation of Authority Log is a site-level document. It lists every member of the study team — the PI, sub-investigators, study coordinators, regulatory specialists, pharmacy staff, anyone touching the protocol — and records, for each:

- The specific trial-related duties they are authorized to perform
- The dates from which (and through which) they were delegated those duties
- Their initial training on the protocol
- The PI's signature delegating the authority
- The team member's signature accepting the delegation

It is a living document. Every new staff member is added before they perform protocol-related work. Every departure is recorded with an end date. Every PI signature change triggers a new revision.

## What Form 1572 captures

Form FDA 1572, the Statement of Investigator, is a sponsor-level document. The PI signs it once per study and submits it to the sponsor before enrolling the first subject. Section 6 lists sub-investigators — anyone "who will assist the investigator and make a direct and significant contribution to the data."

The 1572 is not site-internal. It travels to the sponsor, to the IRB on request, and to FDA during an inspection. A change to Section 6 — adding or removing a sub-investigator — requires an updated, re-signed 1572.

## The alignment requirement

The simple version: every sub-investigator on Form 1572 Section 6 must appear on the DOA log with corresponding duties and dates. Every person on the DOA log performing sub-investigator-level duties (assessing eligibility, evaluating safety, making medical judgments) must appear on Form 1572.

The DOA log can — and should — be broader. It includes coordinators, pharmacy, regulatory staff who don't belong on Form 1572. But the *intersection* between the two documents has to be airtight.

## The five misalignments that show up in BIMO

After parsing FY2022–2024 FDA Form 483 observations at clinical investigator sites ([the full taxonomy is here](/bimo-taxonomy)), the same delegation-paper failure modes appear repeatedly:

**1. Sub-investigator on DOA log, not on 1572.** A new physician joins mid-study, gets added to the DOA log, but the 1572 is never updated and resubmitted to the sponsor. They evaluate subjects. The sponsor's regulatory file is out of sync with the site's. Finding.

**2. Sub-investigator on 1572, not on DOA log.** The 1572 lists three sub-Is from the study activation packet, but the DOA log only formalized delegation for two. The third performs work without a documented delegation. Finding.

**3. Delegation dates that don't survive scrutiny.** The DOA log shows a delegation date of June 1, but the staff member's protocol training certificate is dated June 8. The delegation precedes the qualification. Finding.

**4. Stale PI signature.** The DOA log was signed when the protocol launched. The PI's signature has not been refreshed across protocol amendments, even though Section 6 on the 1572 was updated when the study expanded. Finding.

**5. Departed staff still listed.** A coordinator left the site eight months ago. Their DOA log row still has no end date. A monitor asks who initialed the source document on a visit from last month — and it's still listed as the departed coordinator. Finding (and possibly a data integrity escalation).

None of these are about the site doing the wrong work. They are paperwork failures. Which is exactly why they keep happening — sites underestimate how operational the delegation paperwork really is, treat it as a study-startup task instead of a study-lifecycle task, and don't reconcile DOA and 1572 at any regular cadence.

## The remediation pattern

A site that aligns DOA and 1572 consistently does four things:

**Reconcile on a calendar.** Quarterly is the floor; monthly is better. Pull the DOA log, pull the current 1572, line up Section 6 against the sub-investigator rows, check signatures, check dates. Document the reconciliation.

**Tie reconciliation to study events.** Any time a sub-investigator joins or leaves, any time a protocol amendment touches eligibility or safety assessments, any time the IRB requires a re-consent — assume both documents need to change and verify they have.

**Date-stamp every change.** Don't update the DOA log "in place." Pen-and-ink corrections with date, initial, and reason. Electronic version control with full history if your site uses an eRegulatory system.

**Audit your own paper before sponsors do.** Run a mock monitoring visit where the only documents on the table are DOA and 1572. If they don't reconcile in front of an internal reviewer, they won't reconcile in front of a CRA.

## The site-level pattern

Sites that align DOA and 1572 consistently share three things: a clear SOP-002 Essential Documents process, a templated DOA log that prompts the right fields (especially end dates, which sites consistently forget), and PI signature discipline that doesn't lapse across amendments.

The [Purple Directive SOP Template Bundle](/sop-bundle) includes SOP-002 Essential Documents, which walks through the DOA log + 1572 reconciliation pattern (Section 5, Tab 5 — Delegation), and 12 other site-level SOPs aligned to E6(R2/R3). $249.99 for the bundle, $29 for any individual SOP.

The paperwork is small. The findings it prevents are not.

---

*Purple Directive builds compliance-grade infrastructure for clinical research sites. The [BIMO Form 483 Taxonomy](/bimo-taxonomy) is a free reference for what FDA is actually citing at sites in FY2022–2024.*
