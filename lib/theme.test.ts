import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY, toThemeMode } from "./theme.ts";

test("system follows the OS in both directions", () => {
  // The whole point of the default: a dark machine gets a dark site before
  // the visitor touches anything.
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
});

test("an explicit choice overrides the OS", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("anything unrecognised falls back to system, not light", () => {
  // localStorage is shared with extensions and older versions of this app,
  // so the stored value can be absent, stale or nonsense. Falling back to
  // "light" would ignore a dark OS; falling back to system never does.
  assert.equal(toThemeMode(null), "system");
  assert.equal(toThemeMode(undefined), "system");
  assert.equal(toThemeMode(""), "system");
  assert.equal(toThemeMode("Dark"), "system");
  assert.equal(toThemeMode("midnight"), "system");
});

test("the three real modes survive the round trip", () => {
  assert.equal(toThemeMode("light"), "light");
  assert.equal(toThemeMode("dark"), "dark");
  assert.equal(toThemeMode("system"), "system");
});

test("the inline script guards storage access and agrees with the module", () => {
  // Reading localStorage throws — it does not return null — when a browser
  // blocks site data. An unguarded read would abort the script and leave
  // color-scheme unset too.
  assert.match(THEME_INIT_SCRIPT, /try\{/);
  assert.match(THEME_INIT_SCRIPT, /catch/);
  // The script hard-codes what the module exports; a rename must not leave
  // the pre-paint script reading a key nothing writes.
  assert.ok(THEME_INIT_SCRIPT.includes(JSON.stringify(THEME_STORAGE_KEY)));
  assert.match(THEME_INIT_SCRIPT, /prefers-color-scheme: dark/);
});
