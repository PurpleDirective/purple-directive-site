/**
 * Automated clients, for the form handlers in this folder.
 *
 * The same matcher the buy links use, copied from the buy-link worker
 * (PurpleSpace: infra/stripe-fulfillment/src/analytics.ts). Two repos, so two
 * copies: change both together. It is conservative on purpose. Every entry is
 * a crawler or tool name that no person's browser carries, because a false
 * match turns a customer away. It stops clients that announce themselves; a
 * headless browser with a stock Chrome user agent is not caught here.
 */
const BOT_PARTS = [
  "crawl", "spider", "slurp", "facebookexternalhit", "facebot",
  "headless", "phantomjs", "selenium", "lighthouse", "googleother",
  "bingpreview", "skypeuripreview", "google web preview", "embedly",
  "whatsapp/", "curl/", "wget/",
  "python-requests", "python-urllib", "python-httpx", "aiohttp", "go-http-client",
  "okhttp/", "apache-httpclient", "libwww", "node-fetch", "undici", "axios/",
  "scrapy", "postman", "uptime-kuma", "pingdom", "statuscake", "gtmetrix",
  "pagespeed", "httrack", "zgrab", "masscan", "nikto", "sqlmap", "wpscan",
  "playwright", "puppeteer", "cypress", "webdriver", "healthcheck", "uptimerobot",
];

// "<Name>bot" followed by a version or a delimiter (Googlebot/2.1, bingbot/2.0;).
// "cubot" is a phone brand, not a crawler.
const BOT_TOKEN = /(?<!cu)bot(?=[\/\-;),:]|$)/;
// "Java/1.8" style scripted clients, only at the start of a token.
const JAVA_CLIENT = /(^|[\s(;])java\/\d/;

export function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return (
    !ua || BOT_TOKEN.test(ua) || JAVA_CLIENT.test(ua) || BOT_PARTS.some((b) => ua.includes(b))
  );
}

/**
 * The reply an automated client gets from a form handler: nothing is sent or
 * stored. It is worded for a person, in case a real browser is ever matched.
 */
export function botRefusal(): Response {
  return new Response(
    'This form needs a web browser. If you are a person seeing this, email info@purpledirective.com and we will pick it up.',
    { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
}
