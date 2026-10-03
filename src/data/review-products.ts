/**
 * Products this site takes reviews for, and the items under each.
 *
 * Reviews are stored and moderated by the shared reviews Worker, routed on
 * this domain at /api/reviews/* (infra/reviews-worker in the main repo). A key
 * here must also be in that Worker's PRODUCTS var or every submit is refused.
 * Item ids must match what the product's server puts in its review links
 * (SOP delivery: "sop-bundle" or "sop-001" … "sop-013").
 */

export interface ReviewItem {
  id: string;
  /** Short label shown next to a review on pages that list every item. */
  short: string;
  /** Longer label for the review form. */
  label: string;
}

export interface ReviewProduct {
  key: string;
  label: string;
  items: ReviewItem[];
}

const sopTitles: [string, string][] = [
  ['001', 'Training & Qualification of Study Staff'],
  ['002', 'Essential Documents & Regulatory Binder'],
  ['003', 'Study Start-Up & Feasibility'],
  ['004', 'Informed Consent'],
  ['005', 'Recruitment & Retention'],
  ['006', 'Investigational Product Management'],
  ['007', 'Data Management & Documentation'],
  ['008', 'Adverse Events & Protocol Deviations'],
  ['009', 'Quality Control / Quality Assurance'],
  ['010', 'Sponsor Interactions & Monitoring'],
  ['011', 'Remote Monitoring Visits'],
  ['012', 'Study Close-Out'],
  ['013', 'HIPAA Authorization for Use & Disclosure of PHI'],
];

export const reviewProducts: ReviewProduct[] = [
  {
    key: 'sops',
    label: 'SOP templates',
    items: [
      { id: 'sop-bundle', short: 'SOP bundle', label: 'The SOP bundle (all 13)' },
      ...sopTitles.map(([n, t]) => ({ id: `sop-${n}`, short: `SOP-${n}`, label: `SOP-${n} — ${t}` })),
    ],
  },
];

export function findProduct(key: string | null | undefined): ReviewProduct | undefined {
  return reviewProducts.find((p) => p.key === key);
}

export function findItem(product: ReviewProduct | undefined, id: string | null | undefined): ReviewItem | undefined {
  return product?.items.find((i) => i.id === id);
}
