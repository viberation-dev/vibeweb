import assert from "node:assert/strict";
import { test } from "node:test";

import {
  contentTypeLabel,
  learnHref,
  LEARN_TYPE_VALUES,
  resolveRoleLevel,
  toContentType,
  toLevelParam,
} from "./learn.ts";

test("the hub lists every content type except staff-facing role guides", () => {
  assert.ok(LEARN_TYPE_VALUES.includes("help_article"));
  assert.ok(!LEARN_TYPE_VALUES.includes("role_guide"));
});

test("untrusted params narrow to real values", () => {
  assert.equal(toContentType("guide"), "guide");
  // Listable types only — role_guide has a detail page but no filter chip.
  assert.equal(toContentType("role_guide"), undefined);
  assert.equal(toContentType("nonsense"), undefined);
  assert.equal(toContentType(undefined), undefined);

  assert.equal(toLevelParam("expert"), "expert");
  assert.equal(toLevelParam("all"), "all");
  assert.equal(toLevelParam("wizard"), undefined);
});

test("no param falls back to the signed-in tier, and to nothing when signed out", () => {
  assert.equal(resolveRoleLevel(undefined, "beginner"), "beginner");
  assert.equal(resolveRoleLevel(undefined, null), undefined);
});

test("an explicit level overrides the profile, and 'all' clears it", () => {
  assert.equal(resolveRoleLevel("expert", "beginner"), "expert");
  assert.equal(resolveRoleLevel("all", "beginner"), undefined);
  assert.equal(resolveRoleLevel("all", null), undefined);
});

test("hrefs drop empty params and omit page 1", () => {
  assert.equal(learnHref({}), "/learn");
  assert.equal(learnHref({ page: 1 }), "/learn");
  assert.equal(learnHref({ type: "guide", page: 3 }), "/learn?type=guide&page=3");
  assert.equal(learnHref({ level: "all" }), "/learn?level=all");
});

test("every content type has a display label", () => {
  assert.equal(contentTypeLabel("course_link"), "Course");
  assert.equal(contentTypeLabel("role_guide"), "Role guide");
});
