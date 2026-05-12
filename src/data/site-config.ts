/**
 * Site-wide configuration — things that are swapped infrequently
 * but need central editing.
 */

export const siteConfig = {
  // =============================================================
  // Giscus — GitHub Discussions-backed comment system for blog posts
  // =============================================================
  //
  // Setup (one-time, ~5 minutes):
  //   1. Create (or pick) a PUBLIC GitHub repo to host Discussions.
  //      Recommended: https://github.com/PurpleDirective/comments
  //      (An empty repo with just a README is fine — it's just the backend.)
  //   2. On that repo: Settings → General → Features → tick "Discussions".
  //   3. Install the Giscus GitHub App: https://github.com/apps/giscus
  //      (Grant it access to the repo from step 1.)
  //   4. Go to https://giscus.app → fill out the form:
  //        - Repository: PurpleDirective/comments
  //        - Mapping: "Discussion title contains page pathname"
  //        - Discussion Category: create one called "Blog Comments"
  //        - Features: enable reactions, lazy loading (recommended)
  //        - Theme: "preferred_color_scheme" (auto-adapts to viewer)
  //   5. Giscus outputs a `<script>` tag with data-* attributes.
  //      Copy the values of data-repo, data-repo-id, data-category,
  //      data-category-id into the block below and set `enabled: true`.
  //
  // Once enabled, comments appear on every /blog/[id] post automatically.
  // =============================================================
  giscus: {
    enabled: false,
    repo: 'PurpleDirective/comments',      // format: "org/repo"
    repoId: '',                             // from giscus.app output
    category: 'Blog Comments',              // from giscus.app output
    categoryId: '',                         // from giscus.app output
    mapping: 'pathname',                    // recommended
    theme: 'preferred_color_scheme',        // auto-adapts
    reactionsEnabled: '1',
    inputPosition: 'top',
    lang: 'en',
  },

  // =============================================================
  // Email capture / newsletter
  // =============================================================
  //
  // Provider resolution order in EmailCapture.astro:
  //   1. beehiiv.publicationId set → render our own form, POST to
  //      /api/subscribe (Cloudflare Pages Function proxies to Beehiiv
  //      API using BEEHIIV_API_KEY env var). Brand-matched UI.
  //   2. beehiiv.formUuid set → render Beehiiv's loader.js widget
  //      (cross-origin iframe; visual = Beehiiv defaults). Legacy.
  //   3. newsletterFormAction set → render generic HTML form POST.
  //   4. none set → fallback mailto message.
  //
  // Active provider: Beehiiv-API (custom form, our brand styling).
  // Publication: "Practitioner Notes: Clinical Research × Regulation"
  // at purpledirective.beehiiv.com.
  //
  // Server-side env vars (set in Cloudflare Pages dashboard):
  //   BEEHIIV_API_KEY        — secret, Bearer token. Get from
  //                            app.beehiiv.com → Settings → API.
  //   BEEHIIV_PUBLICATION_ID — required, e.g. "pub_6f5579d5-..."
  //                            (matches publicationId below; the
  //                            client uses publicationId for nothing
  //                            sensitive, only display/debug).
  // =============================================================
  beehiiv: {
    // Non-secret publication identifier. Mirrors the BEEHIIV_PUBLICATION_ID
    // server env var. Kept here for traceability; the Pages Function
    // reads its own env var, not this value.
    publicationId: 'pub_6f5579d5-0f7c-4690-b671-41753cf7b391',
    // Legacy: form UUID for the Beehiiv-hosted widget (iframe-based).
    // Empty = use the API-backed custom form via /api/subscribe.
    formUuid: '',
    attribution: false,
  },

  // Legacy / alternate provider config — used only when both
  // beehiiv.publicationId and beehiiv.formUuid are empty.
  newsletterFormAction: '',
  newsletterFormHiddenFields: {} as Record<string, string>,
} as const;
