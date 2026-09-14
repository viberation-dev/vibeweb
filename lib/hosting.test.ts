import assert from "node:assert/strict";
import { test } from "node:test";

import { hostingCardBadges } from "./hosting.ts";
import { toKeyFacts } from "./key-facts.ts";

const tag = (slug: string, name: string) => ({ slug, name });

test("a hosting card leads with pricing and trial, then tags by usefulness", () => {
  assert.deepEqual(
    hostingCardBadges("Paid", [
      tag("backend", "Backend"),
      tag("email", "Email"),
      tag("free-trial", "Free trial"),
      tag("nextjs", "Next.js"),
      tag("vps", "VPS"),
    ]),
    ["Paid", "Free trial", "VPS", "Next.js", "Email"],
  );
});

test("a hosting card shows at most four tags", () => {
  const badges = hostingCardBadges(null, [
    tag("linux", "Linux"),
    tag("cloud", "Cloud"),
    tag("email", "Email"),
    tag("database", "Database"),
    tag("react", "React"),
  ]);
  assert.deepEqual(badges, ["React", "Database", "Email", "Cloud"]);
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
