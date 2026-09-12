# Viberation

The AI coding tool directory, Learn hub and guided walkthroughs. Next.js App
Router, Supabase, Tailwind.

## Running it

Against the shared Supabase project, which is what `.env.local` points at by
default:

```bash
npm run dev
```

Everything a visitor can see works this way. What does not is anything behind
a session: `/account`, onboarding and `/admin` all need a signed-in user, and
the shared project is production data.

## Local stack, for gated screens

Use this when the change is behind a login. It runs Postgres, GoTrue and the
rest in Docker, applies the migrations in `supabase/migrations`, and seeds a
staff account that exists only on your machine.

```bash
npx supabase start          # once per machine, pulls images
npx supabase db reset       # applies migrations + seeds
```

Point the app at it by replacing the two values in `.env.local` with the
`API_URL` and `ANON_KEY` that `npx supabase status` prints, then restart
`npm run dev`. Keep the shared values somewhere; swapping back is the same two
lines.

Then sign in:

```bash
npm run dev:login           # prints a one-time link, open it
```

The seeded account (`staff@local.test`) has **no password**. The script mints a
login link through the local stack's service-role key, so there is no
credential in the repo to leak and nothing to type into a form. It refuses to
run against any host but localhost.

`npx supabase db reset` reseeds and clears anything you did locally. The seed
lives in `supabase/seed-dev-staff.sql`, deliberately outside `seed.sql` so the
shared project can never pick it up.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Conventions, architecture and what is deliberately out of scope live in
`CLAUDE.md`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
