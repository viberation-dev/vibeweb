import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveRoleLevel, roleLevelFilter, toLevelParam, toRoleLevel } from "./role-level.ts";

test("untrusted level params narrow to real choices", () => {
  assert.equal(toLevelParam("expert"), "expert");
  assert.equal(toLevelParam("all"), "all");
  assert.equal(toLevelParam("wizard"), undefined);
  assert.equal(toLevelParam(undefined), undefined);
});

test("untrusted strings narrow to a real tier", () => {
  assert.equal(toRoleLevel("intermediate"), "intermediate");
  assert.equal(toRoleLevel("wizard"), undefined);
  assert.equal(toRoleLevel(undefined), undefined);
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

test("the filter always keeps rows written for everyone", () => {
  // The null half is the whole point: filtering to a tier must never hide
  // content with no tier set.
  assert.equal(roleLevelFilter("beginner"), "role_level.is.null,role_level.eq.beginner");
});
