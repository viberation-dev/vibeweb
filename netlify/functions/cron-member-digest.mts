// Netlify scheduled function: calls /api/cron/member-digest daily, with the same
// Bearer CRON_SECRET header the route checks. URL is the site's main address.
const run = async () => {
  const res = await fetch(`${process.env.URL}/api/cron/member-digest`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  if (!res.ok) console.error(`member-digest ${res.status}: ${await res.text()}`);
};

export default run;

export const config = { schedule: "30 9 * * *" };
