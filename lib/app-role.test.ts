import assert from "node:assert/strict";
import { test } from "node:test";

import { isStaff } from "./app-role.ts";

test("staff roles pass the gate", () => {
  assert.equal(isStaff("admin"), true);
  assert.equal(isStaff("super_admin"), true);
});

test("members and the signed-out do not", () => {
  assert.equal(isStaff("member"), false);
  assert.equal(isStaff(null), false);
  assert.equal(isStaff(undefined), false);
});
