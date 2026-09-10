import { test } from "node:test";
import assert from "node:assert/strict";

import { initialsFrom } from "./testimonials.ts";

test("takes the first and last name", () => {
  assert.equal(initialsFrom("Maya Chen"), "MC");
});

test("skips the middle name rather than using it", () => {
  // "MR" would be wrong: people are introduced by first and family name.
  assert.equal(initialsFrom("Maya Rose Chen"), "MC");
});

test("a mononym gives two letters, not one", () => {
  assert.equal(initialsFrom("Prince"), "PR");
});

test("the override always wins, and is capped at two letters", () => {
  assert.equal(initialsFrom("Ana de Sousa", "AdS"), "AD");
  assert.equal(initialsFrom("Maya Chen", "x"), "X");
});

test("a blank override falls back to the guess rather than rendering empty", () => {
  assert.equal(initialsFrom("Maya Chen", "   "), "MC");
  assert.equal(initialsFrom("Maya Chen", null), "MC");
});

test("an empty name renders a placeholder, never an empty circle", () => {
  assert.equal(initialsFrom(""), "?");
  assert.equal(initialsFrom("   "), "?");
});
