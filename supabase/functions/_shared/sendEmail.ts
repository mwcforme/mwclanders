/**
 * Shared email sender — uses SendGrid API.
 * Drop-in replacement for Resend calls across all edge functions.
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  if (!apiKey) return { ok: false, error: "SENDGRID_API_KEY not set" };

  const from = opts.from ?? "Men's Wellness Centers <info@menswellnesscenters.com>";
  const toList = Array.isArray(opts.to) ? opts.to : [opts.to];

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: toList.map(email => ({ email })) }],
      from: { email: from.match(/<(.+)>/)?.[1] ?? from, name: from.match(/^(.+?)\s*</)?.[1]?.trim() ?? "MWC" },
      subject: opts.subject,
      content: [{ type: "text/html", value: opts.html }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `SendGrid ${res.status}: ${body.slice(0, 200)}` };
  }
  return { ok: true };
}
