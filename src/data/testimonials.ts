/**
 * Hand-curated consulting testimonials (rendered by
 * src/components/Testimonials.astro on /consulting).
 *
 * Product reviews (SOPs and other products) no longer come from here: they are
 * submitted at /review, moderated in the shared reviews Worker and rendered by
 * src/components/Reviews.astro. Consulting is not a product in that Worker, so
 * consulting quotes are still added here by hand, for example from a /feedback
 * entry whose sender ticked "You may quote me publicly".
 *
 * Only `published: true` entries render. Every entry must be a real quote from
 * a real client who agreed to be quoted. Do not invent testimonials. The
 * commit is the approval.
 */

export type TestimonialProduct = 'consulting';

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
