import { test } from "node:test";
import assert from "node:assert/strict";

import { FEEDBACK_KINDS, feedbackSchema } from "./feedback.ts";

const valid = {
  kind: "feature",
  message: "A dark mode toggle in the header would help a lot.",
  email: "",
};

test("a whole valid submission parses, with the message trimmed", () => {
  const result = feedbackSchema.safeParse({
    ...valid,
    message: `  ${valid.message}  `,
  });
  assert.ok(result.success);
  assert.equal(result.data.message, valid.message);
});

test("an omitted email is valid and becomes null", () => {
  for (const email of ["", "   ", undefined, null]) {
    const result = feedbackSchema.safeParse({ ...valid, email });
    assert.ok(result.success, `${JSON.stringify(email)} should parse`);
    assert.equal(result.data.email, null);
  }
});

test("an email that is given must be a real one", () => {
  const result = feedbackSchema.safeParse({ ...valid, email: "not-an-address" });
  assert.ok(!result.success);
});

test("an address is trimmed and lowercased, so it is usable as reply_to", () => {
  const result = feedbackSchema.safeParse({ ...valid, email: "  Rafa@Example.COM " });
  assert.ok(result.success);
  assert.equal(result.data.email, "rafa@example.com");
});

/*
 * Review Focus 2. This value ends up in a mail header, so a newline in it is
 * an injection attempt rather than a typo.
 */
test("an address carrying a header injection is rejected", () => {
  for (const email of [
    "a@b.com\nBcc: victim@example.com",
    "a@b.com\r\nBcc: victim@example.com",
    "a@b.com%0ABcc:victim@example.com",
  ]) {
    const result = feedbackSchema.safeParse({ ...valid, email });
    assert.ok(!result.success, `${JSON.stringify(email)} should be rejected`);
  }
});

/* Review Focus 1. Ten spaces is ten characters and says nothing. */
test("a whitespace-only message is rejected, not counted as ten characters", () => {
  const result = feedbackSchema.safeParse({ ...valid, message: "          " });
  assert.ok(!result.success);
});

test("the message has both a floor and a ceiling", () => {
  assert.ok(!feedbackSchema.safeParse({ ...valid, message: "too short" }).success);
  assert.ok(feedbackSchema.safeParse({ ...valid, message: "just enough" }).success);
  assert.ok(
    !feedbackSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success,
  );
  assert.ok(
    feedbackSchema.safeParse({ ...valid, message: "x".repeat(4000) }).success,
  );
});

/* Review Focus 3. The select constrains a browser, not a crafted POST. */
test("a kind nobody offered is rejected", () => {
  for (const kind of ["urgent", "", null, undefined]) {
    const result = feedbackSchema.safeParse({ ...valid, kind });
    assert.ok(!result.success, `${JSON.stringify(kind)} should be rejected`);
  }
});

test("every offered kind parses", () => {
  for (const kind of FEEDBACK_KINDS) {
    assert.ok(feedbackSchema.safeParse({ ...valid, kind }).success, kind);
  }
});
