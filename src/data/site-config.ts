/**
 * Site-wide configuration — things that are swapped infrequently
 * but need central editing.
 */

export const siteConfig = {
  // Disqus commenting
  // 1. Sign up at https://disqus.com (free)
  // 2. Create a new site → pick shortname (e.g. "purpledirective")
  // 3. Set DISQUS_SHORTNAME below to that value
  // Comments appear on blog posts automatically when shortname is set.
  // Leave empty string to disable comments site-wide.
  disqusShortname: '',

  // Email capture / newsletter (ConvertKit, Substack, Mailchimp, etc.)
  // Paste the form action URL + hidden form fields if using a hosted form.
  // Currently hosted on: [TBD — see project-research-report-launch-2026-04.md]
  newsletterFormAction: '',
  newsletterFormHiddenFields: {} as Record<string, string>,
} as const;
