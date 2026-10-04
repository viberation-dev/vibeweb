import { test } from "node:test";
import assert from "node:assert/strict";

import { KIND_LABELS, renderFeedbackEmail, type FeedbackNotification } from "./feedback.ts";

const base: FeedbackNotification = {
  kind: "feature",
  message: "A dark mode toggle in the header would help a lot.",
  replyTo: null,
  username: null,
  origin: "https://viberation.dev",
};

test("the subject names the kind, so an inbox can tell them apart", () => {
  assert.ok(renderFeedbackEmail(base).subject.includes(KIND_LABELS.feature));
  assert.ok(
    renderFeedbackEmail({ ...base, kind: "broken" }).subject.includes(
      KIND_LABELS.broken,
    ),
  );
});

test("a signed-out submission is attributed to a visitor, not to nobody", () => {
  const mail = renderFeedbackEmail(base);
  assert.ok(mail.text.includes("a visitor"));
  assert.ok(!mail.text.includes("null"));
});

test("a signed-in submission carries the username", () => {
  const mail = renderFeedbackEmail({ ...base, username: "rafa" });
  assert.ok(mail.html.includes("rafa"));
  assert.ok(mail.text.includes("rafa"));
});

test("the message appears in both parts", () => {
  const mail = renderFeedbackEmail(base);
  assert.ok(mail.html.includes("dark mode toggle"));
  assert.ok(mail.text.includes("dark mode toggle"));
});

/*
 * The message and the username are written by the public. Asserted rather
 * than trusted to a reading of the template, the same as
 * comment-notification.test.ts.
 */
test("a message carrying markup is escaped, not interpolated", () => {
  const mail = renderFeedbackEmail({
    ...base,
    message: "<script>alert('x')</script> and more text to clear the floor",
  });
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
});

test("a username carrying markup is escaped too", () => {
  const mail = renderFeedbackEmail({ ...base, username: "<img src=x onerror=1>" });
  assert.ok(!mail.html.includes("<img src=x"));
  assert.ok(mail.html.includes("&lt;img"));
});

test("a reply address is shown when given, and nothing is claimed when not", () => {
  const withAddress = renderFeedbackEmail({ ...base, replyTo: "rafa@example.com" });
  assert.ok(withAddress.text.includes("rafa@example.com"));
  assert.ok(renderFeedbackEmail(base).text.includes("No reply address"));
});

/* Review Focus 5. A wall with no spaces must not blow out the layout. */
test("a long unbroken token does not escape the layout or the preheader", () => {
  const mail = renderFeedbackEmail({ ...base, message: "x".repeat(3000) });
  assert.ok(
    mail.html.includes("word-break:break-word"),
    "the message cell needs a break rule for unbroken input",
  );
  const preheader = mail.html.split('opacity:0;">')[1].split("</div>")[0];
  assert.ok(preheader.length <= 121, `preheader was ${preheader.length} chars`);
});
