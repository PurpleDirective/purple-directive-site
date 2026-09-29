// functions/api/_middleware.ts sets X-Robots-Tag on every API response, errors included.
import { test } from "node:test";
import assert from "node:assert/strict";

const { onRequest } = await import("../functions/api/_middleware.ts");

test("noindex is set on success and error responses", async () => {
  for (const status of [200, 401, 500]) {
    const res = await onRequest({ next: async () => new Response("x", { status }) });
    assert.equal(res.status, status);
    assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.equal(await res.text(), "x");
  }
});

test("existing headers are kept", async () => {
  const res = await onRequest({
    next: async () => new Response("{}", { headers: { "content-type": "application/json" } }),
  });
  assert.equal(res.headers.get("content-type"), "application/json");
});

test("_headers no longer carries the dead /api rule", async () => {
  const { readFileSync } = await import("node:fs");
  assert.ok(!/^\/api\//m.test(readFileSync(new URL("../public/_headers", import.meta.url), "utf8")));
});
