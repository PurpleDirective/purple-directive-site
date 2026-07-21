# sop-bundle.astro — v1.1 Draft
# DO NOT PUBLISH. Awaiting Tyrian review.
# This file shows every content change vs. the live page (sop-bundle.astro).
# CSS and HTML structure are unchanged unless noted.
# Diff format: [OLD] → [NEW]. Sections with no change are omitted.

---

## CHANGE: <Base> meta description

[OLD]
description="12 ICH E6(R2/R3)-aligned Standard Operating Procedures for clinical research sites.
Editable Word + branded PDF, plus 11 companion forms. Ready to customize and implement."

[NEW]
description="Already running trials through Elligo, Javara, or Circuit? These 12 ICH E6(R2/R3)-aligned
SOP templates let you own your compliance infrastructure — audit-ready in a weekend. $249.99."

---

## CHANGE: .product-badge text

[OLD]
Digital Download

[NEW]
Site SOP Templates

---

## CHANGE: h1

[OLD]
Clinical Research SOP Template Bundle

[NEW]
Own Your Site SOPs. Pass Any Sponsor Audit.

---

## CHANGE: .product-tagline

[OLD]
12 Standard Operating Procedures covering the full clinical study lifecycle.
Built on ICH E6(R2/R3), editable in Word, ready to brand for your site.

[NEW]
You're already running trials. Elligo, Javara, or Circuit got you started.
Now sponsors are asking about your SOPs — and "our enablement firm handles that"
isn't going to hold up at a pre-study audit. These 12 templates give your site
a clean, 1572-compatible SOP library you actually own. ICH E6(R2/R3)-aligned,
editable in Word, named-investigator ready.

---

## CHANGE: .product-price-row

[OLD]
<span class="product-price">$249.99</span>
<span class="product-price-note">or $29 per individual SOP</span>

[NEW — two-tier pricing block]
NOTE: Requires new HTML structure. Suggested markup:

  <div class="product-tiers">

    <!-- Tier 2: Anchor -->
    <div class="tier tier-anchor">
      <span class="tier-label">Site SOP Bundle</span>
      <span class="tier-price">$249.99</span>
      <span class="tier-desc">
        All 12 SOPs + 11 forms + a 60-min customization session with Purple Directive.
        We walk through your site's protocols, flag any placeholder decisions,
        and confirm audit-readiness before you file.
      </span>
      <a href="[STRIPE-LINK-BUNDLE-$249.99-TBD]" class="buy-btn buy-btn-anchor">Get Site Bundle</a>
    </div>

    <!-- Tier 1: Solo -->
    <div class="tier tier-primary">
      <span class="tier-label">Solo Investigator Bundle</span>
      <span class="tier-price">$249</span>
      <span class="tier-desc">
        All 12 SOPs + 11 companion forms. PDF + editable Word.
        Customize the placeholders yourself, get PI sign-off, file.
        Most single-site practices need nothing more.
      </span>
      <a href="https://buy.stripe.com/4gM7sLfLxa095iG0VT3gk02" class="buy-btn">Get Solo Bundle</a>
    </div>

    <!-- Tier 0: Individual -->
    <div class="tier tier-individual">
      <span class="tier-label">Individual SOPs</span>
      <span class="tier-price">$29</span>
      <span class="tier-desc">Per SOP. Need one missing piece? Buy only what you need.</span>
      <a href="#individual" class="buy-btn buy-btn-ghost">Browse SOPs</a>
    </div>

  </div>

---

## CHANGE: "Why Now" section — full rewrite of 4 cards

[OLD heading]
Why Sites Need Updated SOPs Now

[NEW heading]
Why This Matters If You're Elligo, Javara, or Circuit-Enabled

[OLD card 1: "ICH E6(R3) Is Here"]
[NEW card 1]

  <h3>Your enablement partner's SOPs protect them, not you.</h3>
  <p>
    Elligo, Javara, and Circuit Clinical provide operational support —
    but their master SOPs cover their network, not your site specifically.
    When an FDA inspector or sponsor auditor walks in, they want to see
    your site's signed documents, your training logs, your 1572 signatories.
    Network-level documentation doesn't satisfy site-level scrutiny.
  </p>

[OLD card 2: "Sponsors Are Already Asking"]
[NEW card 2]

  <h3>Sponsor audit next month? Audit-ready in a weekend.</h3>
  <p>
    Pre-study audits from sponsors running Elligo-enabled sites increasingly
    include a document review phase. They want to see ICH E6(R2/R3)-aligned
    SOPs with actual PI signatures, not a reference to network policy.
    Twelve templates. One weekend. Clean binder.
  </p>

[OLD card 3: "Inspections Will Reference R3"]
[NEW card 3]

  <h3>Going independent? SOPs are table stakes.</h3>
  <p>
    Sites transitioning from site-enablement to independent trial-of-record
    status need a site-specific SOP library before sponsors will sign a direct
    contract. These 12 templates cover every document FDA BIMO inspectors
    reference under 21 CFR Parts 50, 56, and 312 — including ALCOA+ data
    integrity procedures and the 1572-linked training/delegation requirements.
    You're not starting from scratch; you're installing a foundation.
  </p>

[OLD card 4: "Writing From Scratch Takes Weeks"]
[NEW card 4]

  <h3>ICH E6(R3) language, not legacy R2 boilerplate.</h3>
  <p>
    Most free SOP templates floating around clinical research communities
    reference E6(R2) monitoring language and pre-2024 electronic records
    guidance. Sponsors paying attention to the E6(R3) rollout — particularly
    risk-based monitoring and Quality by Design requirements — will notice.
    These templates are written against E6(R3) with specific callout notes
    on where R2 and R3 language diverges.
  </p>

---

## CHANGE: Sticky buy sidebar (.buy-card)

[OLD]
<span class="buy-card-amount">$249.99</span>
<a href="..." class="buy-btn">Purchase Bundle</a>
<ul class="buy-card-list">
  <li>12 SOP PDFs — ICH E6(R2/R3)-aligned</li>
  <li>12 editable Word files</li>
  <li>11 companion forms (PDF + Word)</li>
  <li>Instant email delivery</li>
  <li>Non-expiring download link</li>
</ul>

[NEW — two cards stacked]

  <!-- Anchor card -->
  <div class="buy-card buy-card-top">
    <span class="buy-card-label">Site SOP Bundle</span>
    <div class="buy-card-price">
      <span class="buy-card-amount">$249.99</span>
    </div>
    <a href="[STRIPE-LINK-BUNDLE-$249.99-TBD]" class="buy-btn">Get Site Bundle</a>
    <ul class="buy-card-list">
      <li>All 12 SOPs + 11 companion forms</li>
      <li>PDF + editable Word</li>
      <li>60-min customization walkthrough</li>
      <li>We flag placeholder decisions before you file</li>
      <li>Instant download + session scheduled within 48h</li>
    </ul>
  </div>

  <!-- Solo card -->
  <div class="buy-card buy-card-secondary" style="margin-top: 1rem; border-color: var(--border);">
    <span class="buy-card-label">Solo Investigator Bundle</span>
    <div class="buy-card-price">
      <span class="buy-card-amount">$249</span>
    </div>
    <a href="https://buy.stripe.com/4gM7sLfLxa095iG0VT3gk02" class="buy-btn buy-btn-outline">Get Solo Bundle</a>
    <ul class="buy-card-list">
      <li>All 12 SOPs + 11 companion forms</li>
      <li>PDF + editable Word</li>
      <li>Customize placeholders yourself</li>
      <li>Instant email delivery</li>
    </ul>
    <p class="buy-card-note">Secure checkout via Stripe</p>
  </div>

---

## CHANGE: FAQ additions (append after existing 5 items)

[NEW FAQ item 1]
<details class="faq-item">
  <summary>I'm running trials through Elligo or Javara. Do I still need my own SOPs?</summary>
  <p>
    Yes. Your site-enablement partner's SOPs cover their operational network.
    FDA inspections and sponsor pre-study audits require site-level documentation —
    signed by your PI, referencing your site's specific procedures. A shared network
    SOP does not satisfy 21 CFR Part 312 site documentation requirements when an
    investigator's name is on the 1572.
  </p>
</details>

[NEW FAQ item 2]
<details class="faq-item">
  <summary>What's included in the 60-min customization session (Site SOP Bundle)?</summary>
  <p>
    A working call with Purple Directive where we walk through your site's specific
    protocols, indication mix, and any non-standard procedures. We flag placeholder
    decisions that require site-specific language, confirm your regulatory binder
    structure against SOP-002, and answer questions about study-start requirements.
    This is not legal advice — it's operational review from a compliance-grade
    clinical research operations team.
  </p>
</details>

[NEW FAQ item 3]
<details class="faq-item">
  <summary>Does this cover multi-indication sites running 4–10 studies per year?</summary>
  <p>
    The 12 SOPs are indication-agnostic and scale to small-multi-site operations.
    SOP-009 (QA) includes a framework for managing concurrent studies with shared
    staff. SOP-001 (Training) covers protocol-specific training with multiple
    delegation logs. If you're running 4–10 active studies across multiple therapeutic
    areas, the bundle covers your full operational footprint.
  </p>
</details>

---

## CHANGE: Reviews section placeholder text

[OLD]
"We recently launched this bundle and are collecting feedback from early customers."

[NEW]
"First sale completed — a community-practice operations lead running Elligo-enabled trials
across 6 indications. Collecting feedback now."

NOTE: This is an internal placeholder. Before going live, either remove this sentence
or replace with an actual quote if the customer provides one. Do not publish internal
sale details publicly.

---

## NO CHANGE: SOP list, companion forms list, individual SOP section, preview strip, CSS.
## The HTML structure of the price row and buy sidebar will require code edits —
## the live Stripe link for the $249.99 Site SOP Bundle (price_1TH6ZZHnp7WF503fTKnIguOM) needs to be inserted.
