# Hosting backups

The site runs on Netlify. Netlify needs no config file: it detects Next.js,
and the two daily crons live in `netlify/functions/`.

These are the configs for the other two hosts, kept so a move back is a copy,
not a rewrite. They do nothing from this folder.

- `vercel/vercel.json`: the two crons for Vercel. To use it, copy it to the
  repo root.
- `cloudflare/`: OpenNext on Cloudflare Workers (R2 page cache, D1 tag cache,
  cron triggers). To use it, copy the three files to the repo root, then
  follow the setup steps in PR #239 (Workers Paid, R2 bucket, D1 database,
  secrets). The `@opennextjs/cloudflare` and `wrangler` dev dependencies stay
  installed for this reason.
