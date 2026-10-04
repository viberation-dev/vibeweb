import { test } from "node:test";
import assert from "node:assert/strict";

import {
  digestSubject,
  memberLabel,
  renderMemberDigest,
  type DigestMember,
} from "./member-digest.ts";

const member = (over: Partial<DigestMember> = {}): DigestMember => ({
  username: "rafa",
  email: "rafa@example.com",
  roleLevel: "beginner",
  joinedAt: "2026-10-03T14:05:00.000Z",
  ...over,
});

const origin = "https://viberation.dev";

test("the subject counts them, and is singular for one", () => {
  assert.equal(digestSubject(1), "1 new member joined");
  assert.equal(digestSubject(4), "4 new members joined");
});

test("someone with no username is labelled by their address, not by a blank", () => {
  assert.equal(memberLabel(member({ username: null })), "rafa@example.com");
  assert.equal(memberLabel(member({ username: "   " })), "rafa@example.com");
  assert.equal(
    memberLabel(member({ username: null, email: null })),
    "Unnamed member",
  );
});

test("every member appears, in both the html and the text part", () => {
  const mail = renderMemberDigest({
    origin,
    members: [member(), member({ username: "lena" })],
  });

  for (const name of ["rafa", "lena"]) {
    assert.ok(mail.html.includes(name), `html is missing ${name}`);
    assert.ok(mail.text.includes(name), `text is missing ${name}`);
  }
});

/*
 * A username is written by whoever signed up, so it reaches this renderer as
 * untrusted text. Asserted rather than trusted to the reading of the
 * template — the same thing comment-notification.test.ts checks.
 */
test("a username carrying markup is escaped, not interpolated", () => {
  const mail = renderMemberDigest({
    origin,
    members: [member({ username: "<script>alert('x')</script>" })],
  });

  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
});

test("a long list is cut off and says how many were left out", () => {
  const many = Array.from({ length: 30 }, (_, i) =>
    member({ username: `member${i}` }),
  );
  const mail = renderMemberDigest({ origin, members: many });

  assert.ok(mail.html.includes("member24"), "the 25th should be listed");
  assert.ok(!mail.html.includes("member25"), "the 26th should not be");
  assert.ok(mail.text.includes("and 5 more."));
  assert.equal(mail.subject, "30 new members joined");
});

test("the admin link is absolute, so it works from an inbox", () => {
  const mail = renderMemberDigest({ origin, members: [member()] });
  assert.ok(mail.text.includes("https://viberation.dev/admin"));
});
