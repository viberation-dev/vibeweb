import assert from "node:assert/strict";
import { test } from "node:test";

import { creatingCategory, escapeHtml, renderWelcomeEmail, unsubscribeUrl, type WelcomeInput } from "./welcome.ts";

const base: WelcomeInput = {
  step: 1,
  name: "Ali Rizwan",
  level: "beginner",
  creating: [],
  origin: "https://example.test",
  unsubscribeUrl: "https://example.test/email/unsubscribe?u=1&s=2",
};

test("goals map to the category worth suggesting, first match wins", () => {
  assert.equal(creatingCategory(["inspiration", "website"]), "app_builders");
  assert.equal(creatingCategory(["workflow", "website"]), "agents");
  assert.equal(creatingCategory(["undecided"]), undefined);
  assert.equal(creatingCategory([]), undefined);
});

test("a display name cannot inject HTML into the email", () => {
  // The name is typed by the member in onboarding and lands in the heading.
  const { html } = renderWelcomeEmail({ ...base, step: 4, name: "<img src=x onerror=alert(1)>" });
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img"));
});

test("greetings use the first name, or none at all", () => {
  assert.match(renderWelcomeEmail(base).html, /Welcome, Ali</);
  assert.match(renderWelcomeEmail({ ...base, name: "  " }).html, /Welcome to Viberation</);
});

test("every email carries the unsubscribe link in both parts", () => {
  for (const step of [1, 2, 3, 4] as const) {
    const email = renderWelcomeEmail({ ...base, step });
    assert.ok(email.html.includes("email/unsubscribe?u=1&amp;s=2"), `html step ${step}`);
    assert.ok(email.text.includes(base.unsubscribeUrl), `text step ${step}`);
    assert.ok(email.subject.length > 0);
  }
});

test("email 1 leads with the walkthrough when there is one", () => {
  const email = renderWelcomeEmail({ ...base, walkthrough: { title: "Ship it", slug: "ship-it" } });
  assert.ok(email.html.includes("https://example.test/walkthroughs/ship-it"));
  assert.ok(!renderWelcomeEmail(base).html.includes("/walkthroughs/"));
});

test("email 2 lists the tools and links to the matching category", () => {
  const email = renderWelcomeEmail({
    ...base,
    step: 2,
    creating: ["website"],
    tools: [{ name: "Lovable", slug: "lovable", tagline: "Apps from a prompt" }],
  });
  assert.ok(email.html.includes("https://example.test/tools/lovable"));
  assert.ok(email.html.includes("/tools?category=app_builders"));
  assert.ok(email.text.includes("Lovable: Apps from a prompt"));
});

test("marketing copy has no em dashes", () => {
  for (const level of ["beginner", "intermediate", "expert"] as const) {
    for (const step of [1, 2, 3, 4] as const) {
      const { subject, text } = renderWelcomeEmail({ ...base, step, level, walkthrough: { title: "W", slug: "w" } });
      assert.ok(!`${subject}${text}`.includes("—"), `step ${step} ${level}`);
    }
  }
});

test("unsubscribe urls encode their parameters", () => {
  assert.equal(unsubscribeUrl("https://x.test", "abc", "def"), "https://x.test/email/unsubscribe?u=abc&s=def");
  assert.equal(escapeHtml(`"&'`), "&quot;&amp;&#39;");
});
