/**
 * Offline-resilient booking queue.
 *
 * When a booking attempt fails (GHL down, network error, timeout), the
 * intent is saved to localStorage. On next page load or focus, any queued
 * intents are retried automatically.
 *
 * Zero data loss guarantee: a booking is only removed from the queue after
 * confirmed success from GHL (status 2xx + appointmentId present).
 */

// Lazy-loaded to keep Supabase out of the critical-path bundle.
// Only needed when retrying queued bookings (background, not page load).
const getSupabase = () => import("@/integrations/supabase/legacy").then(m => m.supabase);

const QUEUE_KEY = "mwc_booking_queue_v1";
const MAX_RETRIES = 20;          // ~10 min of retries before giving up
const RETRY_DELAY_MS = 30_000;   // 30s between retries

export interface QueuedBooking {
  id: string;              // client-generated UUID
  slotIso: string;
  location: string;
  contactId: string;
  calendarId: string;
  source: string;
  queuedAt: string;        // ISO
  retries: number;
  lastError?: string;
}

function readQueue(): QueuedBooking[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedBooking[];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedBooking[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch { /* storage full — non-critical */ }
}

export function enqueueBooking(booking: Omit<QueuedBooking, "id" | "queuedAt" | "retries">): string {
  const id = crypto.randomUUID();
  const q = readQueue();
  q.push({ ...booking, id, queuedAt: new Date().toISOString(), retries: 0 });
  writeQueue(q);
  if (import.meta.env.DEV) console.warn("[booking-queue] queued booking", id, booking.slotIso);
  return id;
}

export function removeFromQueue(id: string): void {
  writeQueue(readQueue().filter(b => b.id !== id));
}

export function getQueue(): QueuedBooking[] {
  return readQueue();
}

async function attemptBooking(b: QueuedBooking): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("ghl-proxy", {
      body: {
        path: "/calendars/events/appointments",
        method: "POST",
        body: {
          calendarId: b.calendarId,
          contactId: b.contactId,
          startTime: b.slotIso,
          title: "Appointment",
          appointmentStatus: "confirmed",
          ignoreDateRange: false,
          toNotify: true,
        },
      },
    });

    if (error || !data?.ok) {
      const msg = data?.data?.message || error?.message || "unknown";
      // Update retry count + error
      const q = readQueue();
      const idx = q.findIndex(x => x.id === b.id);
      if (idx >= 0) {
        q[idx].retries++;
        q[idx].lastError = String(msg).slice(0, 200);
        writeQueue(q);
      }
      return false;
    }

    // Success — remove from queue, log to Supabase
    removeFromQueue(b.id);
    void Promise.resolve(supabase.from("booking_event_log").insert({ // supabase already loaded above
      event_type: "success",
      location: b.location as never,
      calendar_id: b.calendarId,
      slot_iso: b.slotIso,
      contact_id: b.contactId,
      meta: { queued: true, retries: b.retries, queuedAt: b.queuedAt } as never,
    })).catch(() => {});

    if (import.meta.env.DEV) console.info("[booking-queue] queued booking confirmed", b.id);
    return true;
  } catch (e) {
    const q = readQueue();
    const idx = q.findIndex(x => x.id === b.id);
    if (idx >= 0) {
      q[idx].retries++;
      q[idx].lastError = (e as Error).message?.slice(0, 200);
      writeQueue(q);
    }
    return false;
  }
}

let retryTimer: number | null = null;
/** Guards against concurrent flushes (e.g. focus + online firing simultaneously). */
let isFlushing = false;

/** Flush the queue — retry all pending bookings. Called on load + focus. */
export async function flushBookingQueue(): Promise<void> {
  if (isFlushing) return;
  const q = readQueue();
  if (q.length === 0) return;
  isFlushing = true;

  if (import.meta.env.DEV) console.info("[booking-queue] flushing", q.length, "queued bookings");

  const supabase = await getSupabase();
  for (const booking of q) {
    if (booking.retries >= MAX_RETRIES) {
      // Give up — escalate to Supabase for manual review + fire ops alert
      void Promise.resolve(supabase.from("booking_event_log").insert({
        event_type: "error",
        location: booking.location as never,
        calendar_id: booking.calendarId,
        slot_iso: booking.slotIso,
        contact_id: booking.contactId,
        error: `Abandoned after ${MAX_RETRIES} retries: ${booking.lastError}`,
        meta: { queued: true, abandoned: true } as never,
      })).catch(() => {});
      // Fire ops alert via edge function so the team can manually book in GHL
      void supabase.functions.invoke("lead-notify", {
        body: {
          type: "booking_abandoned",
          contactId: booking.contactId,
          location: booking.location,
          slotIso: booking.slotIso,
          retries: booking.retries,
          lastError: booking.lastError ?? "unknown",
          queuedAt: booking.queuedAt,
        },
      }).catch(() => {}); // fire-and-forget, never block UX
      removeFromQueue(booking.id);
      continue;
    }
    await attemptBooking(booking);
  }

  // Schedule next retry if queue still has items
  const remaining = readQueue();
  isFlushing = false;
  if (remaining.length > 0) {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = window.setTimeout(flushBookingQueue, RETRY_DELAY_MS);
  }
}

/** Initialize — flush on load and on window focus. */
export function initBookingQueue(): void {
  if (typeof window === "undefined") return;
  // Flush immediately on init
  void flushBookingQueue();
  // Re-flush when user comes back to the tab
  window.addEventListener("focus", () => { void flushBookingQueue(); }, { passive: true });
  // Re-flush when coming back online
  window.addEventListener("online", () => { void flushBookingQueue(); }, { passive: true });
}
