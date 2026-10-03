import assert from "node:assert/strict";
import { test } from "node:test";

import { contentEditorSchema } from "./content.ts";

const valid = {
  announce_revision: null,
  clear_announcement: null,
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

test("announcing a revision requires a note", () => {
  const parsed = contentEditorSchema.safeParse({
    ...valid,
    announce_revision: "on",
    revision_note: "   ",
  });
  assert.equal(parsed.success, false);
  assert.match(parsed.error!.issues[0].message, /what changed/i);
  assert.deepEqual(parsed.error!.issues[0].path, ["revision_note"]);
});

test("an announced revision resolves to a timestamp and the note", () => {
  const parsed = contentEditorSchema.parse({
    ...valid,
    announce_revision: "on",
    revision_note: "Added Opus 5.5 pricing",
  });
  assert.equal(parsed.revision_note, "Added Opus 5.5 pricing");
  assert.ok(parsed.revised_at, "revised_at is stamped");
});

test("an unticked save omits the revision keys, so an existing announcement survives", () => {
  const parsed = contentEditorSchema.parse({
    ...valid,
    announce_revision: null,
    revision_note: "typed then unticked",
  });
  // Omitted, not null: the update payload must not mention these columns at
  // all, or a plain edit would wipe a previously announced revision.
  assert.equal("revised_at" in parsed, false);
  assert.equal("revision_note" in parsed, false);
});

test("clearing writes both columns as null, which the check constraint requires", () => {
  const parsed = contentEditorSchema.parse({
    ...valid,
    clear_announcement: "on",
  });
  // Null, not omitted: this is the one save that is meant to change these
  // columns back, and tools_revision_pair / content_revision_pair reject a
  // row with one set and the other null.
  assert.equal(parsed.revised_at, null);
  assert.equal(parsed.revision_note, null);
});

test("clearing needs no note of its own", () => {
  // The note refinement guards an announcement. A clear has nothing to say.
  assert.ok(contentEditorSchema.safeParse({ ...valid, clear_announcement: "on" }).success);
});

test("announcing and clearing at once is an error rather than a guess", () => {
  const parsed = contentEditorSchema.safeParse({
    ...valid,
    announce_revision: "on",
    revision_note: "Added Opus 5.5 pricing",
    clear_announcement: "on",
  });
  assert.equal(parsed.success, false);
  assert.deepEqual(parsed.error!.issues[0].path, ["clear_announcement"]);
});

test("an unticked clear_announcement leaves an announcement alone", () => {
  // The box only renders on an already-announced row, and an unticked box
  // posts nothing, so null is the ordinary case. It must read as "keep".
  const parsed = contentEditorSchema.parse({ ...valid, clear_announcement: null });
  assert.equal("revised_at" in parsed, false);
  assert.equal("revision_note" in parsed, false);
});

test("a caller that forgets the field is an error, not a silent keep", () => {
  // How the first version of the clear shipped broken: the save action built
  // its parse input field by field and never read clear_announcement, which
  // an optional field accepted as "keep". The box did nothing, quietly.
  const { clear_announcement: _omitted, ...withoutField } = valid;
  assert.equal(contentEditorSchema.safeParse(withoutField).success, false);
});
