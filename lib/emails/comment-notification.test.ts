import assert from "node:assert/strict";
import { test } from "node:test";

import { excerpt, renderCommentNotification } from "./comment-notification.ts";

const base = {
  commenterName: "Sana",
  targetTitle: "Playwright MCP without burning your context window",
  targetPath: "/learn/playwright-mcp-guide",
  body: "The isolated-profile warning saved me.",
  isReply: false,
  origin: "https://viberation.dev",
};

test("says who commented and on what", () => {
  const mail = renderCommentNotification(base);
  assert.equal(
    mail.subject,
    "New comment from Sana on Playwright MCP without burning your context window",
  );
  assert.match(mail.text, /Sana wrote:/);
  assert.match(mail.text, /The isolated-profile warning saved me\./);
});

test("a reply says so", () => {
  const mail = renderCommentNotification({ ...base, isReply: true });
  assert.match(mail.subject, /^New reply from Sana/);
});

test("falls back to the path when the title could not be read", () => {
  const mail = renderCommentNotification({ ...base, targetTitle: null });
  assert.match(mail.subject, /on \/learn\/playwright-mcp-guide$/);
});

test("links to the thread and to moderation", () => {
  const mail = renderCommentNotification(base);
  assert.match(
    mail.html,
    /https:\/\/viberation\.dev\/learn\/playwright-mcp-guide#comments/,
  );
  assert.match(mail.html, /https:\/\/viberation\.dev\/admin\/comments/);
});

/*
 * The one that matters. The body is written by the public and lands inside
 * HTML — an unescaped comment is a script running in the moderator's mail
 * client, and the moderator is the account that can hide things.
 */
test("escapes the comment body", () => {
  const mail = renderCommentNotification({
    ...base,
    body: '<script>alert("x")</script> & <b>bold</b>',
  });

  assert.ok(!mail.html.includes("<script>"), "raw script tag reached the HTML");
  assert.ok(!mail.html.includes("<b>bold</b>"), "raw markup reached the HTML");
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.html, /&amp;/);
});

test("escapes the commenter name and the title too", () => {
  const mail = renderCommentNotification({
    ...base,
    commenterName: '<img src=x onerror=alert(1)>',
    targetTitle: "Tools & <tips>",
  });

  assert.ok(!mail.html.includes("<img src=x"), "raw name markup reached the HTML");
  assert.ok(!mail.html.includes("<tips>"), "raw title markup reached the HTML");
});

test("shortens a long comment on a word boundary", () => {
  const long = `${"word ".repeat(300)}end`;
  const cut = excerpt(long, 100);

  assert.ok(cut.length <= 101, `expected <=101 chars, got ${cut.length}`);
  assert.ok(cut.endsWith("…"));
  assert.ok(!cut.includes("wor…"), "cut mid-word");
});

test("leaves a short comment alone", () => {
  assert.equal(excerpt("Short one."), "Short one.");
  assert.equal(excerpt("  padded  "), "padded");
});

test("a long comment is not pasted into the mail whole", () => {
  const mail = renderCommentNotification({ ...base, body: "x".repeat(4000) });
  assert.ok(!mail.text.includes("x".repeat(1000)));
});
