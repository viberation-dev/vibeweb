import assert from "node:assert/strict";
import { test } from "node:test";

import { newsletterFormEnabled } from "./newsletter.ts";

test("production hides the form until it is explicitly switched on", () => {
  // The default that matters: an address collected before the list can send
  // to it is a promise not kept.
  assert.equal(newsletterFormEnabled({ VERCEL_ENV: "production" }), false);
  assert.equal(
    newsletterFormEnabled({ VERCEL_ENV: "production", NEWSLETTER_SIGNUP: "on" }),
    true,
  );
});

test("previews show it, so the form can be reviewed before it goes live", () => {
  assert.equal(newsletterFormEnabled({ VERCEL_ENV: "preview" }), true);
});

test("DEPLOY_ENV works off Vercel and wins over VERCEL_ENV", () => {
  assert.equal(newsletterFormEnabled({ DEPLOY_ENV: "preview" }), true);
  assert.equal(
    newsletterFormEnabled({ DEPLOY_ENV: "production", VERCEL_ENV: "preview" }),
    false,
  );
});

test("off wins everywhere, previews included", () => {
  assert.equal(
    newsletterFormEnabled({ VERCEL_ENV: "preview", NEWSLETTER_SIGNUP: "off" }),
    false,
  );
});

test("an empty environment hides it rather than guessing", () => {
  assert.equal(newsletterFormEnabled({}), false);
});
