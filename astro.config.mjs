// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Confirmation and thank-you pages: noindex in the page and in public/_headers,
// and left out of the sitemap so a crawler is never pointed at them.
const NOT_FOR_SEARCH = /\/(thank-you|thank-you-consulting|consulting-intake-received|feedback-received|review-received|newsletter-confirm)\/?$/;

export default defineConfig({
  site: 'https://purpledirective.com',
  integrations: [sitemap({ filter: (page) => !NOT_FOR_SEARCH.test(page) })],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
