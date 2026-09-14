import assert from "node:assert/strict";
import { test } from "node:test";

import { cardBadges } from "./card-badges.ts";
import { toKeyFacts } from "./key-facts.ts";

const tag = (slug: string, name: string) => ({ slug, name });

test("a hosting card leads with pricing and trial, then tags by usefulness", () => {
  assert.deepEqual(
    cardBadges("hosting", "Paid", [
      tag("backend", "Backend"),
      tag("email", "Email"),
      tag("free-trial", "Free trial"),
      tag("nextjs", "Next.js"),
      tag("vps", "VPS"),
    ]),
    ["Paid", "Free trial", "VPS", "Next.js", "Email"],
  );
});

test("a card shows at most four tags", () => {
  const badges = cardBadges("hosting", null, [
    tag("linux", "Linux"),
    tag("cloud", "Cloud"),
    tag("email", "Email"),
    tag("database", "Database"),
    tag("react", "React"),
  ]);
  assert.deepEqual(badges, ["React", "Database", "Email", "Cloud"]);
});

test("an app builder card orders by what it builds, then code ownership", () => {
  assert.deepEqual(
    cardBadges("app_builders", "Freemium", [
      tag("code-export", "Code export"),
      tag("database", "Database"),
      tag("mobile-apps", "Mobile apps"),
      tag("react-native", "React Native"),
    ]),
    ["Freemium", "Mobile apps", "Code export", "React Native", "Database"],
  );
});

test("a tag repeating the pricing tier is not shown twice", () => {
  assert.deepEqual(
    cardBadges("clis", "Open source", [
      tag("coding-agent", "Coding agent"),
      tag("open-source", "Open source"),
    ]),
    ["Open source", "Coding agent"],
  );
});

test("a category without a tag order keeps the default card", () => {
  assert.equal(cardBadges("models", "Free", [tag("react", "React")]), undefined);
});

test("malformed key facts are dropped, not thrown on", () => {
  assert.deepEqual(
    toKeyFacts([
      { label: "Free plan", value: "Yes" },
      { label: "Email" },
      { label: " ", value: "x" },
      "nope",
      null,
    ]),
    [{ label: "Free plan", value: "Yes" }],
  );
  assert.deepEqual(toKeyFacts({ label: "x", value: "y" }), []);
});
