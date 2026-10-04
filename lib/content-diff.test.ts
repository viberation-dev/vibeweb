import { test } from "node:test";
import assert from "node:assert/strict";

import { onlyContributorChanged, type ContentComparable } from "./content-diff.ts";

const before: ContentComparable = {
  type: "article",
  title: "Row level security is the security boundary",
  slug: "rls-is-the-boundary",
  body: "If your database rows are protected by a check in your application code…",
  role_level: "expert",
  audience: null,
  pillar: "fundamentals",
  status: "published",
  contributor_key: null,
};

test("adding a contributor and changing nothing else is not a revision", () => {
  assert.equal(
    onlyContributorChanged(before, { ...before, contributor_key: "sarah" }),
    true,
  );
});

test("removing a contributor is not a revision either", () => {
  const credited = { ...before, contributor_key: "sarah" };
  assert.equal(onlyContributorChanged(credited, { ...credited, contributor_key: null }), true);
});

test("saving the form with nothing changed at all is not a revision", () => {
  assert.equal(onlyContributorChanged(before, { ...before }), true);
});

/*
 * The case that makes this a comparison rather than an exemption: crediting
 * someone *and* editing the piece in one save is a real revision, and must
 * still bump.
 */
test("a contributor change alongside a body edit is a revision", () => {
  assert.equal(
    onlyContributorChanged(before, {
      ...before,
      contributor_key: "sarah",
      body: "Rewritten opening.",
    }),
    false,
  );
});

test("any other single field changing is a revision", () => {
  const changes: Partial<ContentComparable>[] = [
    { title: "Row level security is the boundary" },
    { slug: "rls" },
    { body: "Rewritten." },
    { type: "guide" },
    { role_level: "beginner" },
    { audience: "admin" },
    { pillar: "context_engineering" },
    { status: "draft" },
  ];
  for (const change of changes) {
    assert.equal(
      onlyContributorChanged(before, { ...before, ...change }),
      false,
      `${Object.keys(change)[0]} should count as a revision`,
    );
  }
});

/*
 * A body of null and a body of "" both mean "no body", and the editor sends
 * one where the row holds the other. Treating that as an edit would bump
 * updated_at on a save that changed nothing a reader can see.
 */
test("null and empty body are the same absence, not an edit", () => {
  const empty = { ...before, body: null };
  assert.equal(onlyContributorChanged(empty, { ...empty, body: "" }), true);
  assert.equal(onlyContributorChanged({ ...before, body: "" }, empty), true);
});

/*
 * Announcing a revision is someone stating outright that the piece changed,
 * so it bumps even when no compared field differs. Withdrawing an
 * announcement (revised_at: null) is a correction, not a revision, and must
 * not stamp a date on a piece whose words never changed.
 */
test("announcing a revision counts as one, whatever else the save does", () => {
  assert.equal(
    onlyContributorChanged(before, {
      ...before,
      contributor_key: "sarah",
      revised_at: "2026-10-04T14:00:00.000Z",
    }),
    false,
  );
});

test("withdrawing an announcement is not itself a revision", () => {
  assert.equal(
    onlyContributorChanged(before, { ...before, revised_at: null }),
    true,
  );
});
