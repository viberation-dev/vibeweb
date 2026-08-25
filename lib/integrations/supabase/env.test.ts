import assert from "node:assert/strict";
import { test } from "node:test";

import { assertSupabaseApiUrl } from "./env.ts";

test("accepts a project API origin", () => {
  const url = "https://unnvsspepizpowtqioma.supabase.co";
  assert.equal(assertSupabaseApiUrl(url), url);
});

test("accepts a local supabase start origin", () => {
  const url = "http://127.0.0.1:54321";
  assert.equal(assertSupabaseApiUrl(url), url);
});

test("rejects the dashboard URL — the mistake that broke a preview deploy", () => {
  assert.throws(
    () => assertSupabaseApiUrl("https://supabase.com/dashboard/project/unnvsspepizpowtqioma"),
    /points at the Supabase dashboard/,
  );
});

test("rejects an origin carrying a path", () => {
  assert.throws(() => assertSupabaseApiUrl("https://foo.supabase.co/rest/v1"), /no path/);
});

test("rejects a value that is not a URL at all", () => {
  assert.throws(() => assertSupabaseApiUrl("your-project-ref"), /not a valid URL/);
});
