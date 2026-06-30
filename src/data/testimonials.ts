/**
 * Approved testimonials — the manual-approve gate for on-site reviews.
 *
 * Reviews submitted at /review land in the REVIEWS_DB D1 table as
 * status='pending' (see functions/api/review-submit.ts). NOTHING a visitor
 * submits is shown automatically. To publish a real review:
 *
 *   1. Read it in D1:  wrangler d1 execute pd-reviews --remote \
 *        --command "SELECT * FROM reviews WHERE status='pending' ORDER BY ts DESC"
 *   2. Confirm consent_publish = 1 (the submitter ticked "OK to publish").
 *   3. Add an entry below with `published: true` and commit. The commit is the
 *      approval — review copy is version-controlled, attributable, and reversible.
 *   4. (optional) Mark it approved in D1 to keep the inbox tidy.
 *
 * Only `published: true` entries with a matching `product` render on a page
 * (see src/components/Testimonials.astro). Keep claims true: every published
 * entry must be a real review from a real buyer who consented to publication.
 * Do not invent testimonials.
 */

export type TestimonialProduct = 'sop' | 'consulting';

export interface Testimonial {
  /** Which product page(s) this renders on. */
  product: TestimonialProduct;
  /** 1..5 — drives the star display. */
  rating: number;
  /** The review text, lightly trimmed. No fabrication, no embellishment. */
  quote: string;
  /** Attribution. Use what the reviewer consented to — name, role, org, or initials. */
  name: string;
  role?: string;
  organization?: string;
  /** Must be true to render. New real reviews get flipped on here at approval. */
  published: boolean;
}

export const testimonials: Testimonial[] = [
  // No approved testimonials yet. Add real, consented reviews here with
  // `published: true`. Until then the testimonial sections render nothing.
];

/** Published testimonials for a given product, in file order. */
export function publishedFor(product: TestimonialProduct): Testimonial[] {
  return testimonials.filter((t) => t.published && t.product === product);
}
