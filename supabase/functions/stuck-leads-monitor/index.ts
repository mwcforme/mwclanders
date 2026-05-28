/**
 * stuck-leads-monitor — Supabase scheduled edge function.
 *
 * Runs every 5 minutes (via Supabase cron schedule).
 * Scans lead_captures for rows stuck in crm_status = 'pending' for > 5 min.
 * Fires a SendGrid alert to ops if any are found.
 *
 * Schedule: configure in Supabase dashboard under
 *   Database → Extensions → pg_cron OR
 *   Edge Functions → Scheduled → every 5 minutes
 *
 * This is called by:
 *   1. pg_cron / Supabase scheduled invocation (no auth header needed, uses service role)
 *   2. UptimeRobot synthetic monitor (GET /health for liveness check)
 */
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { sendEmail } from "../_shared/sendEmail.ts";
import { sendSms } from "../_shared/sendSms.ts";
import { corsResponse, jsonResponse } from "../_shared/cors.ts";

const ALERT_TO = "eobrien@menswellnesscenters.com";
const STUCK_THRESHOLD_MINUTES = 5;
const MAX_ALERT_BATCH = 20; // never send > 20 leads in one email

const log = {
  info:  (msg: string, d?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info",  fn: "stuck-leads-monitor", msg, ts: new Date().toISOString(), ...d })),
  warn:  (msg: string, d?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn",  fn: "stuck-leads-monitor", msg, ts: new Date().toISOString(), ...d })),
  error: (msg: string, d?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", fn: "stuck-leads-monitor", msg, ts: new Date().toISOString(), ...d })),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  // Health check for uptime monitors
  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    return jsonResponse(200, { ok: true, fn: "stuck-leads-monitor", ts: new Date().toISOString() });
  }

  try {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();

    // Find leads stuck in pending for more than STUCK_THRESHOLD_MINUTES
    const { data: stuckLeads, error } = await supabase
      .from("lead_captures")
      .select("id, name, phone, location, source, created_at, crm_status, crm_error")
      .eq("crm_status", "pending")
      .lt("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(MAX_ALERT_BATCH);

    if (error) {
      log.error("db query failed", { error: error.message });
      return jsonResponse(500, { ok: false, error: error.message });
    }

    if (!stuckLeads || stuckLeads.length === 0) {
      log.info("no stuck leads found");
      return jsonResponse(200, { ok: true, stuckCount: 0 });
    }

    log.warn("stuck leads detected", { count: stuckLeads.length });

    // Build alert email
    const rows = stuckLeads.map((lead) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${lead.id.slice(0, 8)}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${lead.name ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${lead.phone ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${lead.location ?? "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;color:#dc2626">${lead.crm_error ?? "no error recorded"}</td>
      </tr>`).join("");

    const emailResult = await sendEmail({
      to: ALERT_TO,
      subject: `[MWC ALERT] ${stuckLeads.length} lead${stuckLeads.length > 1 ? "s" : ""} stuck in pending — action required`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:800px;padding:24px">
          <h2 style="color:#dc2626;margin:0 0 8px">${stuckLeads.length} Lead${stuckLeads.length > 1 ? "s" : ""} Stuck in Pending</h2>
          <p style="color:#555;margin:0 0 20px">
            These leads have been in <code>crm_status = pending</code> for more than ${STUCK_THRESHOLD_MINUTES} minutes.
            GHL sync may be failing. Check the admin panel and resync manually if needed.
          </p>
          <a href="https://book.menswellnesscenters.com/admin/leads"
             style="display:inline-block;padding:10px 20px;background:#e8670a;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin-bottom:24px">
            View in Admin Panel
          </a>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:#f9f9f9">
                <th style="padding:8px;text-align:left">ID</th>
                <th style="padding:8px;text-align:left">Name</th>
                <th style="padding:8px;text-align:left">Phone</th>
                <th style="padding:8px;text-align:left">Location</th>
                <th style="padding:8px;text-align:left">Submitted (ET)</th>
                <th style="padding:8px;text-align:left">Error</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#999;font-size:12px;margin-top:24px">
            Sent by stuck-leads-monitor at ${new Date().toISOString()}
          </p>
        </div>`,
    });

    if (!emailResult.ok) {
      log.error("alert email failed", { error: emailResult.error });
    } else {
      log.info("alert email sent", { count: stuckLeads.length });
    }

    // SMS alert — short and actionable
    const smsResult = await sendSms(
      `MWC ALERT: ${stuckLeads.length} lead${stuckLeads.length > 1 ? "s" : ""} stuck in pending >5min. Check admin panel: book.menswellnesscenters.com/admin/leads`
    );
    if (!smsResult.ok) {
      log.warn("sms alert failed", { error: smsResult.error });
    }

    return jsonResponse(200, { ok: true, stuckCount: stuckLeads.length, alertSent: emailResult.ok, smsSent: smsResult.ok });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error("unhandled error", { error: msg });
    return jsonResponse(500, { ok: false, error: msg });
  }
});
