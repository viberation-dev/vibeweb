import assert from "node:assert/strict";
import { test } from "node:test";

import { platformSummary, toToolPlatform, TOOL_PLATFORM_VALUES } from "./tool-platforms.ts";

test("the summary reads in display order, not storage order", () => {
  // Two tools with the same platforms must read identically, whatever order
  // Postgres handed the array back in.
  assert.equal(
    platformSummary(["linux", "macos", "windows"]),
    "macOS · Windows · Linux",
  );
});

test("an empty platform list summarises to nothing, so the row can be hidden", () => {
  assert.equal(platformSummary([]), "");
});

test("an unknown value is dropped rather than shown to a reader as a slug", () => {
  assert.equal(platformSummary(["macos", "haiku-os"]), "macOS");
});

test("the vocabulary matches the CHECK constraint in migration 19", () => {
  // If these drift, an insert the form allows is rejected by the database.
  assert.deepEqual(
    [...TOOL_PLATFORM_VALUES].sort(),
    ["android", "ios", "linux", "macos", "web", "windows"],
  );
});

test("an invented platform is not narrowed into one", () => {
  assert.equal(toToolPlatform("macos"), "macos");
  assert.equal(toToolPlatform("Mac"), undefined);
  assert.equal(toToolPlatform(undefined), undefined);
});
