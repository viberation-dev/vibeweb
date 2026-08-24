-- Viberation MVP schema — 06: tool outbound/affiliate URL
-- Added 2026-08-20. Closes a gap: none of migrations 01-05 stored an
-- outbound URL anywhere, so /go/[slug] (required by §27/§28/§29 for
-- tracked affiliate links) had nothing to redirect to. Decision logged
-- in §14 (2026-08-20) and documented in §33.

alter table tools
  add column outbound_url text not null default '',
  add column is_affiliate boolean not null default false;

comment on column tools.outbound_url is 'Real destination for /go/[slug]; may or may not be an affiliate link.';
comment on column tools.is_affiliate is 'True once a real affiliate deal is signed for this tool; false = plain tracked outbound click.';

-- No new RLS policy needed — these columns live on tools, already
-- public-read / staff-write per migration 03.
