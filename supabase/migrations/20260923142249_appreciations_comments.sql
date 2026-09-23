-- Appreciations and comments (VIB-199).
--
-- Two tables and a join table, polymorphic on (target_type, target_id) the
-- way `bookmarks` and `history_items` already are: a guide, a walkthrough and
-- a prompt are all things a reader might want to react to, and a fourth
-- column per kind is how that turns into four half-built features.
--
-- No foreign key on the target, for the reason migration 05 already records:
-- one FK cannot span five tables. Target existence is the app's job.
--
-- Purely additive — nothing existing reads or writes these tables, so
-- applying it before the deploy cannot break a running build.
--
-- APPLIED 2026-09-23 with Ali's go-ahead, ahead of the deploy. The filename
-- carries the version the remote recorded (the apply time, not the time the
-- file was written), so `supabase db push` sees it as done rather than
-- running it again into "table already exists".

-- ---------------------------------------------------------------------------
-- Appreciations
-- ---------------------------------------------------------------------------

/*
 * "Appreciation", not "like".
 *
 * One row per person per thing, enforced by the unique constraint rather
 * than by the app remembering to check: the button is a toggle, and a
 * double-submitted form must not be able to count twice.
 *
 * No update policy and no updated_at, because a row here has nothing to
 * change. Un-appreciating is a delete.
 */
create table appreciations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id   uuid not null,
  created_at  timestamptz not null default now(),

  unique (user_id, target_type, target_id)
);

comment on table appreciations is
  'One appreciation per person per target (VIB-199). Polymorphic like bookmarks; the unique constraint is what makes the toggle idempotent.';

-- The page asks "how many for this target", not "what has this person liked",
-- so the target leads the index.
create index appreciations_target_idx on appreciations (target_type, target_id);

alter table appreciations enable row level security;

/*
 * The count is public — it is shown to signed-out readers — so select is
 * open. That does mean a determined visitor can list who appreciated what.
 * It is a public endorsement of a public article, which is what the button
 * says it is; nothing private is reachable this way.
 */
create policy appreciations_read on appreciations
  for select using (true);

create policy appreciations_insert on appreciations
  for insert with check (user_id = auth.uid());

create policy appreciations_delete on appreciations
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

create table comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  target_type target_kind not null,
  target_id   uuid not null,

  -- One level of replies. Enforced by the trigger below, not by convention.
  parent_id   uuid references comments(id) on delete cascade,

  /*
   * Bounded in the database as well as in the zod schema. The server action
   * is the control that runs first, but a table that will accept a megabyte
   * of text from any authenticated session is a table that eventually holds
   * one.
   */
  body        text not null
    check (char_length(btrim(body)) between 1 and 4000),

  /*
   * Moderation is a soft delete: a hidden comment stops being readable but
   * its replies keep their parent, and "who hid this and when" survives.
   * A hard delete would take a whole thread with it and leave no record.
   */
  hidden_at   timestamptz,
  hidden_by   uuid references profiles(id) on delete set null,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table comments is
  'Reader comments on content and walkthroughs (VIB-199). One level of replies; moderation is a soft delete via hidden_at.';

comment on column comments.hidden_at is
  'Set by staff to hide a comment. Replies survive, and the record of the moderation survives with it.';

-- The thread for one page, oldest first, which is the only read this has.
create index comments_target_idx
  on comments (target_type, target_id, created_at);

create index comments_parent_idx on comments (parent_id);

/*
 * Replies do not have replies.
 *
 * A check constraint cannot see another row, so this is a trigger. Without
 * it the column allows an arbitrarily deep tree, and the renderer — which
 * draws exactly two levels — would silently stop showing anything below the
 * second, which is a comment that exists and is invisible.
 */
create or replace function comments_one_level_of_replies()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is not null
     and exists (
       select 1 from comments
       where id = new.parent_id and parent_id is not null
     )
  then
    raise exception 'comments: replies cannot be nested more than one level';
  end if;
  return new;
end;
$$;

create trigger comments_depth
  before insert or update on comments
  for each row execute function comments_one_level_of_replies();

alter table comments enable row level security;

/*
 * Visible comments are public; hidden ones are staff-only.
 *
 * The author of a hidden comment does not see it either. Showing it back to
 * them alone is a shadow ban: it makes the site lie to one person about what
 * everybody else can see, and that is worse than the comment being gone.
 */
create policy comments_read on comments
  for select using (hidden_at is null or is_staff());

create policy comments_insert on comments
  for insert with check (user_id = auth.uid());

/*
 * An author can delete their own comment. They cannot edit it: `body` is the
 * only field worth editing and an unversioned edit lets a quoted reply be
 * rewritten under a reader who already answered it. If editing is wanted, it
 * arrives with an edit history, not before.
 */
create policy comments_delete_own on comments
  for delete using (user_id = auth.uid());

create policy comments_moderate on comments
  for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------------------------
-- Comment appreciations
-- ---------------------------------------------------------------------------

/*
 * A composite primary key rather than a surrogate id: the pair *is* the
 * identity here, and one row per person per comment is the only shape this
 * table ever wants.
 */
create table comment_appreciations (
  comment_id uuid not null references comments(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (comment_id, user_id)
);

comment on table comment_appreciations is
  'One appreciation per person per comment (VIB-199).';

alter table comment_appreciations enable row level security;

create policy comment_appreciations_read on comment_appreciations
  for select using (true);

create policy comment_appreciations_insert on comment_appreciations
  for insert with check (user_id = auth.uid());

create policy comment_appreciations_delete on comment_appreciations
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

/*
 * Since migration 20 (VIB-60) `public` no longer hands anon and
 * authenticated any privilege on a newly created table, so without these the
 * tables exist and the Data API cannot see them — 42501, not a security
 * hole, but the section renders nothing either way.
 *
 * Reads are public because counts and threads are shown to signed-out
 * readers. Writes go to `authenticated` only: anon gets nothing at all, so a
 * signed-out request cannot reach these even if a policy were one day
 * written carelessly.
 *
 * No update on appreciations or comment_appreciations — there is no column
 * on either that an owner could sensibly change, and a privilege nobody uses
 * is a privilege nobody is watching.
 */
grant select on appreciations, comments, comment_appreciations to anon, authenticated;
grant insert, delete on appreciations, comment_appreciations to authenticated;
grant insert, update, delete on comments to authenticated;
