-- Customer testimonials for the homepage proof section (VIB-102).
--
-- The proof block has carried §03's personas in the third person since
-- VIB-77, because Maya/Tyler/Rachel are fictional composites written to guide
-- design and quoting them as customers would be fabricated social proof. This
-- table is where real quotes live so that section can finally say what it
-- looks like it says.
--
-- The homepage keeps falling back to those third-person cards when there are
-- no published rows: an empty proof section reads worse than one describing
-- who the product is for, and launch should not wait on collecting quotes.
create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  author_name text not null,

  -- "Austin, TX". Optional: a quote with no place attached is still usable,
  -- and inventing one to fill the field is the failure mode this table exists
  -- to end.
  location    text,

  /*
   * Up to two letters for the avatar. Nullable because it is derivable from
   * author_name — the column exists for the names where initials are not the
   * first letters of the first two words ("de Sousa", a mononym, a handle).
   */
  initials    text check (initials is null or char_length(initials) between 1 and 2),

  -- Which tier the person was speaking as, so the section can eventually
  -- show a beginner a beginner's quote. Nullable: not every quote is tied to
  -- one, and guessing would defeat the point.
  role_level  role_level,

  -- Where they said it — a tweet, an email, a call recording. Not shown to
  -- visitors; it is what makes a claim checkable a year from now.
  source_url  text,

  /*
   * NOT NULL on purpose, and the reason this table is not just `quote` and
   * `name`.
   *
   * A testimonial is a named real person's words on a page that carries
   * affiliate links. "Did this person agree to be quoted?" has to be a thing
   * the schema requires rather than a thing somebody remembers, so a row
   * cannot exist without a date on it. It is deliberately not defaulted:
   * `now()` would let a careless insert claim consent that was never given.
   */
  consent_at  timestamptz not null,

  -- Same draft/published split as `wizards`: staff can stage a quote and
  -- check how it reads before a visitor ever sees it.
  published   boolean not null default false,

  -- Manual ordering. The proof row shows three, and which three is an
  -- editorial call rather than whichever happen to be newest.
  sort_order  int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table testimonials is
  'Real customer quotes for the homepage proof section (VIB-102). consent_at is required: no row without recorded permission to quote the person.';

comment on column testimonials.consent_at is
  'When the person agreed to be quoted. Required, and deliberately undefaulted — a default would manufacture consent.';

-- The homepage reads published rows ordered by sort_order; staff list them all.
create index testimonials_published_order_idx
  on testimonials (published, sort_order, created_at);

alter table testimonials enable row level security;

/*
 * Published quotes are public; drafts are staff-only. Same shape as
 * wizards_read (migration 04) rather than a blanket `using (true)`, so an
 * unfinished or unconsented quote cannot be read out of the API before it is
 * ready.
 */
create policy testimonials_read on testimonials
  for select using (published or is_staff());

create policy testimonials_write on testimonials
  for all using (is_staff()) with check (is_staff());

/*
 * Grants. Since migration 20 (VIB-60) `public` no longer hands anon and
 * authenticated privileges on newly created tables, so without these the
 * table exists and the Data API cannot see it — the symptom is 42501, not a
 * security hole, but the page renders nothing either way.
 *
 * Writes go to `authenticated` and the policy above decides the person, which
 * is the same split the admin editors for tools and content already rely on.
 */
grant select on testimonials to anon, authenticated;
grant insert, update, delete on testimonials to authenticated;
