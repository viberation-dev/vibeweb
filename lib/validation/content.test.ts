import assert from "node:assert/strict";
import { test } from "node:test";

import { contentEditorSchema } from "./content.ts";

const valid = {
  type: "guide",
  title: "  Ship your first project  ",
  slug: "Ship-Your-First-Project",
  body: "# Hello",
  role_level: "beginner",
  audience: "",
  pillar: "fundamentals",
  status: "draft",
};

test("a whole valid article parses, with the title trimmed", () => {
  const result = contentEditorSchema.safeParse(valid);
  assert.ok(result.success);
  assert.equal(result.data.title, "Ship your first project");
});

test("the slug is lowercased rather than rejected", () => {
  // Two slugs differing only in case would be two URLs for one article, so
  // the fix is to normalise, not to make the editor retype it.
  const result = contentEditorSchema.safeParse(valid);
  assert.equal(result.success && result.data.slug, "ship-your-first-project");
});

test("a slug with spaces or slashes is rejected", () => {
  for (const slug of ["ship your first", "learn/ship", "ship--your", "-ship", ""]) {
    assert.equal(
      contentEditorSchema.safeParse({ ...valid, slug }).success,
      false,
      `expected ${JSON.stringify(slug)} to be rejected`,
    );
  }
});

test("empty nullable selects become null, not empty strings", () => {
  // role_level and audience are nullable columns; "" would be an invalid enum
  // value at the database and a 500 rather than a form error.
  const result = contentEditorSchema.safeParse({ ...valid, role_level: "", audience: "" });
  assert.ok(result.success);
  assert.equal(result.data.role_level, null);
  assert.equal(result.data.audience, null);
});

test("an empty body is allowed and stored as null", () => {
  // An outline saved as a draft is a real state — the title is what is required.
  const result = contentEditorSchema.safeParse({ ...valid, body: "   " });
  assert.ok(result.success);
  assert.equal(result.data.body, null);
});

test("an empty title is rejected", () => {
  assert.equal(contentEditorSchema.safeParse({ ...valid, title: "   " }).success, false);
});

test("status is not free text", () => {
  // The read policy keys off this enum; anything else would be a live article
  // with an unreadable status.
  assert.equal(contentEditorSchema.safeParse({ ...valid, status: "live" }).success, false);
});

test("an unfiled pillar is null, and an invented one is rejected", () => {
  // Null is a real state: help articles belong to no pillar, and a new piece
  // has not been filed yet. "Fundamentals" as free text is not.
  const unfiled = contentEditorSchema.safeParse({ ...valid, pillar: "" });
  assert.ok(unfiled.success);
  assert.equal(unfiled.data.pillar, null);

  assert.ok(contentEditorSchema.safeParse({ ...valid, pillar: "walkthroughs" }).success);
  assert.equal(
    contentEditorSchema.safeParse({ ...valid, pillar: "Fundamentals" }).success,
    false,
  );
});
