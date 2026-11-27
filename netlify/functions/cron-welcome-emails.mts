// Netlify scheduled function: calls /api/cron/welcome-emails daily, with the same
// Bearer CRON_SECRET header the route checks. URL is the site's main address.
const run = async () => {
  const res = await fetch(`${process.env.URL}/api/cron/welcome-emails`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  if (!res.ok) console.error(`welcome-emails ${res.status}: ${await res.text()}`);
};

export default run;

export const config = { schedule: "0 9 * * *" };
