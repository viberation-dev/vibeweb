// Worker entry for Cloudflare: the OpenNext worker plus the two daily crons
// that vercel.json schedules on Vercel. Cloudflare cron triggers call
// scheduled(), not a URL, so each schedule becomes a request to the existing
// route with the same Bearer CRON_SECRET header Vercel sends.
import handler from "./.open-next/worker.js";

// Keep these in step with "triggers.crons" in wrangler.jsonc.
const CRON_ROUTES = {
  "0 9 * * *": "/api/cron/welcome-emails",
  "30 9 * * *": "/api/cron/member-digest",
};

const worker = {
  fetch: handler.fetch,

  async scheduled(event, env, ctx) {
    const path = CRON_ROUTES[event.cron];
    if (!path) {
      console.error(`no route for cron "${event.cron}"`);
      return;
    }
    const request = new Request(`https://www.viberation.dev${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    });
    ctx.waitUntil(
      handler.fetch(request, env, ctx).then(async (response) => {
        if (!response.ok) {
          console.error(`${path} ${response.status}: ${await response.text()}`);
        }
      }),
    );
  },
};

export default worker;
