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
  //   1. beehiiv.formUuid set → render Beehiiv subscribe-form widget
  //   2. newsletterFormAction set → render HTML form POST
  //   3. neither set → fallback mailto message
  //
  // Active provider: Beehiiv (publication "Practitioner Notes:
  // Clinical Research × Regulation", purpledirective.beehiiv.com).
  //
  // To swap providers later: clear the active one's config and set the
  // other. Beehiiv form UUIDs are visible in the Beehiiv dashboard at
  // /subscribe_forms; each form has its own embed snippet.
  // =============================================================
  beehiiv: {
    // Form UUID from app.beehiiv.com → Audience → Subscribe forms.
    // Used as data-beehiiv-form attribute on the loader script.
    formUuid: '0b2d5779-2104-4e90-b87e-d8cf4be72f78',
    // Set true to also inject the UTM attribution script. Off by default
    // to keep external JS minimal; turn on if running paid acquisition.
    attribution: false,
  },

  // Legacy / alternate provider config — used only if beehiiv.formUuid
  // is empty. Substack example URL pattern:
  //   `https://<publication>.substack.com/api/v1/free?nojs=true`
  // ConvertKit:
  //   `https://app.kit.com/forms/<form-id>/subscriptions`
  newsletterFormAction: '',
  newsletterFormHiddenFields: {} as Record<string, string>,
} as const;
