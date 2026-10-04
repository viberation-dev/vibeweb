/**
 * Who worked on it (VIB-198, extended in VIB-235).
 *
 * A map rather than a table. Being credited on a piece is not the same as
 * having an account: Sarah and Emir shape and edit content without signing
 * in, and an `authors` table with three rows is a schema to maintain for a
 * list that changes once a year. `content.contributor_key` points in here.
 *
 * ponytail: a repo constant, so adding a person is a deploy. Becomes a table
 * when a contributor needs a profile page of their own, or when someone
 * outside the team needs crediting without a code change.
 */

export type Person = {
  name: string;
  initials: string;
  /** Only the site author has one. Contributors are name-only until they write their own. */
  bio?: string;
};

export const PEOPLE = {
  ali: {
    name: "Ali Rizwan",
    initials: "AR",
    bio: "Building Viberation. Writes about agent tooling that survives contact with a real codebase.",
  },
  sarah: { name: "Sarah R.", initials: "SR" },
  emir: { name: "Emir Ayan", initials: "EA" },
} as const satisfies Record<string, Person>;

export type PersonKey = keyof typeof PEOPLE;

/**
 * The keys as a non-empty tuple, which is what `z.enum` needs.
 *
 * Derived from the map rather than written out again: a second list is a
 * second thing to update, and the one that gets forgotten is always the
 * validator, which fails as "unknown contributor" on a name that is right
 * there in the map.
 */
export const PERSON_KEYS = Object.keys(PEOPLE) as [PersonKey, ...PersonKey[]];

/** The author of everything published so far, and the fallback for any row. */
export const SITE_BYLINE: Person = PEOPLE.ali;

/**
 * The person a stored key refers to, or null.
 *
 * Takes a plain string because the column is `text` — a key written before
 * someone was removed from the map must render as "no contributor" rather
 * than crash the page it is credited on.
 */
export function person(key: string | null | undefined): Person | null {
  if (!key) return null;
  return PEOPLE[key as PersonKey] ?? null;
}
