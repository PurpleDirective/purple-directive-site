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
  // Paste the form action URL + any hidden fields after setting up
  // your newsletter provider (Substack recommended; see
  // 1.Products/Research-Report/10-newsletter-launch-guide.md).
  //
  // Substack example: `https://<publication>.substack.com/api/v1/free?nojs=true`
  // ConvertKit example: `https://app.kit.com/forms/<form-id>/subscriptions`
  //
  // Leave blank string to show the fallback mailto: message.
  // =============================================================
  newsletterFormAction: '',
  newsletterFormHiddenFields: {} as Record<string, string>,
} as const;
