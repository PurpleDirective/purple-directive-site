/**
 * Pages Functions middleware for /api/*.
 *
 * Cloudflare Pages does not apply public/_headers to Functions responses, so the
 * noindex header for the site's own API is set here, on every response a
 * function under functions/api/ returns (including 401s and errors).
 */
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  const out = new Response(response.body, response);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
};
