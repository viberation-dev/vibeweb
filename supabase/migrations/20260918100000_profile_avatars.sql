-- Profile photos (VIB-178).
--
-- The file lives in a public Storage bucket; `profiles.avatar_path` records
-- which one is current. A path rather than a URL, and constrained to the
-- row's own folder, so the column cannot be pointed at someone else's photo
-- or an arbitrary external image by a direct API write. The app builds the
-- public URL from the path.

alter table profiles
  add column avatar_path text
  check (
    avatar_path is null
    or avatar_path ~ ('^' || id::text || '/[0-9]+\.(png|jpg|webp)$')
  );

-- Photos are public like usernames. Column grants, as in 20260915090000.
grant select (avatar_path) on profiles to anon, authenticated;
grant update (avatar_path) on profiles to authenticated;

-- Public read through the CDN URL. Size and type are enforced by Storage
-- itself, server-side, whatever the client claims. No SVG: it can carry
-- script.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/png', 'image/jpeg', 'image/webp']);

-- Writes only into your own folder: avatars/<your user id>/...
-- Select is needed as well as delete: Storage looks the object up first.
create policy avatars_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
