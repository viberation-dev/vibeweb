import { test } from "node:test";
import assert from "node:assert/strict";

import { PEOPLE, PERSON_KEYS, SITE_BYLINE, person } from "./byline.ts";

test("every person has a name and initials", () => {
  for (const [key, who] of Object.entries(PEOPLE)) {
    assert.ok(who.name.trim().length > 0, `${key} has no name`);
    assert.ok(who.initials.trim().length > 0, `${key} has no initials`);
  }
});

/*
 * The one thing that breaks silently: adding someone to PEOPLE without the
 * validator learning about them, so the admin select offers a name the save
 * action then rejects as unknown. PERSON_KEYS is what feeds the zod enum.
 */
test("the validator's key list is exactly the map's keys", () => {
  assert.deepEqual([...PERSON_KEYS].sort(), Object.keys(PEOPLE).sort());
});

test("the site byline is a person in the map", () => {
  assert.equal(person("ali"), SITE_BYLINE);
});

test("a key nobody holds resolves to no contributor, not a crash", () => {
  assert.equal(person("someone-who-left"), null);
  assert.equal(person(null), null);
  assert.equal(person(""), null);
  assert.equal(person(undefined), null);
});
