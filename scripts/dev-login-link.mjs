/**
 * Print a one-time sign-in link for the local staff account (VIB-128).
 *
 * Why a link and not a password: the seeded account has no password at all.
 * Nothing to store in the repo, nothing to leak, and nobody has to type a
 * credential into a form to look at a gated screen.
 *
 * Local stack only, by construction. It refuses to run against anything but
 * 127.0.0.1/localhost, because a service-role key belongs nowhere near a
 * shared project — and the local one is the CLI's well-known demo key, which
 * is exactly why it is safe to use like this and useless anywhere else.
 *
 * The printed URL points at the app's own /auth/confirm route with the
 * token_hash, not at GoTrue's /verify. GoTrue's link returns the session in a
 * URL fragment, which never reaches the server, so it lands you back on
 * /login; this app exchanges the token server-side (see that route).
 *
 * Usage:
 *   npx supabase start          # once per machine
 *   npm run dev:login           # prints the URL, open it
 */
import { execSync } from "node:child_process";

const STAFF_EMAIL = "staff@local.test";
const APP_ORIGIN = process.env.DEV_LOGIN_ORIGIN ?? "http://localhost:3000";
const LANDING = process.env.DEV_LOGIN_NEXT ?? "/admin";

/**
 * Read the running stack's own values rather than hardcoding keys here.
 *
 * execSync, not execFileSync: npx is a shim on Windows and resolves only
 * through a shell. The CLI answers in KEY="value" lines or as JSON depending
 * on version, so both are accepted.
 */
function localEnv() {
  const raw = execSync("npx --yes supabase@latest status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  const jsonStart = raw.indexOf("{");
  if (jsonStart !== -1) {
    try {
      return JSON.parse(raw.slice(jsonStart));
    } catch {
      // Not JSON after all; fall through to the line format.
    }
  }

  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const env = localEnv();
const apiUrl = env.API_URL;
const serviceKey = env.SERVICE_ROLE_KEY ?? env.SECRET_KEY;

if (!apiUrl || !serviceKey) {
  console.error("Could not read the local stack. Is it running? `npx supabase start`");
  process.exit(1);
}

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(apiUrl)) {
  console.error(`Refusing to run: ${apiUrl} is not the local stack.`);
  process.exit(1);
}

const response = await fetch(`${apiUrl}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "magiclink",
    email: STAFF_EMAIL,
    redirect_to: `${APP_ORIGIN}${LANDING}`,
  }),
});

if (!response.ok) {
  console.error(`Link generation failed (${response.status}):`);
  console.error(await response.text());
  console.error("\nIf the user does not exist, reseed: npx supabase db reset");
  process.exit(1);
}

const body = await response.json();
const tokenHash = body.hashed_token ?? body.properties?.hashed_token;

if (!tokenHash) {
  console.error("No hashed_token in the response:");
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const url = new URL("/auth/confirm", APP_ORIGIN);
url.searchParams.set("token_hash", tokenHash);
url.searchParams.set("type", "magiclink");
url.searchParams.set("next", LANDING);

console.log(`\nSigned-in link for ${STAFF_EMAIL} (one use, expires shortly):\n`);
console.log(url.toString());
console.log("\nOpen it with the dev server running.\n");
