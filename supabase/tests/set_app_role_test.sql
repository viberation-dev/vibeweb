-- Check for set_app_role() (VIB-58). Paste into the Supabase SQL editor, or
-- run it through the MCP execute_sql tool.
--
-- Safe to run against the live project: everything it does happens inside one
-- DO block that ends in a RAISE, so the whole statement aborts and every row
-- it touched rolls back. The results come back AS the error message —
-- "ERROR: P0001: RESULTS >> 1 ok | 2 ok | ..." is a pass. Any FAIL, or any
-- error other than the P0001 one, is a real failure.
--
-- Both uuids below are existing test accounts; swap them if those rows go
-- away. `boss` must not already be super_admin for case 2 to mean anything.

do $$
declare
  boss  uuid := '7cb23d91-16c7-49e6-b362-edea43544518'; -- cre8ivevisionltd@gmail.com
  other uuid := 'eb5eed40-e8f1-4a42-9631-43f6c32951ea'; -- cre8ivevisionltd+test1@gmail.com
  log   text := '';
  r     app_role;
begin
  -- 1. no auth.uid() at all (a service-role / MCP connection)
  begin
    perform set_app_role(other, 'admin');
    log := log || '1 FAIL allowed with no uid | ';
  exception when insufficient_privilege then
    log := log || '1 ok (' || sqlerrm || ') | ';
  end;

  -- 2. caller is a signed-in plain member
  perform set_config('request.jwt.claims', json_build_object('sub', boss)::text, true);
  begin
    perform set_app_role(other, 'admin');
    log := log || '2 FAIL member promoted | ';
  exception when insufficient_privilege then
    log := log || '2 ok (' || sqlerrm || ') | ';
  end;

  -- the manual bootstrap, exactly as the migration comment documents it
  alter table profiles disable trigger profiles_guard_app_role;
  update profiles set app_role = 'super_admin' where id = boss;
  alter table profiles enable trigger profiles_guard_app_role;

  -- 3. super_admin promotes someone, with the guard trigger armed
  perform set_app_role(other, 'admin');
  select app_role into r from profiles where id = other;
  log := log || '3 ' || case when r = 'admin' then 'ok' else 'FAIL' end || ' other=' || r || ' | ';

  -- 4. repeating the same call is a no-op, not an error
  begin
    perform set_app_role(other, 'admin');
    log := log || '4 ok repeat no-op | ';
  exception when others then
    log := log || '4 FAIL ' || sqlerrm || ' | ';
  end;

  -- 5. unknown target
  begin
    perform set_app_role('00000000-0000-0000-0000-000000000000', 'admin');
    log := log || '5 FAIL unknown uuid accepted | ';
  exception when no_data_found then
    log := log || '5 ok (' || sqlerrm || ') | ';
  end;

  -- 6. the last super_admin cannot demote itself — the lockout case
  begin
    perform set_app_role(boss, 'member');
    log := log || '6 FAIL lockout allowed | ';
  exception when insufficient_privilege then
    log := log || '6 ok (' || sqlerrm || ') | ';
  end;

  -- 7. with a second super_admin in place, that demotion is allowed
  perform set_app_role(other, 'super_admin');
  perform set_app_role(boss, 'member');
  select app_role into r from profiles where id = boss;
  log := log || '7 ' || case when r = 'member' then 'ok' else 'FAIL' end || ' boss=' || r;

  raise exception 'RESULTS >> %', log;  -- aborts the txn: nothing above is kept
end $$;
