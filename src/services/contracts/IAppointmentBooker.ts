/**
 * Contract for reading availability and creating appointments at a center.
 *
 * Intentionally separate from `ILeadSubmitter` (ISP): the landing-page form
 * needs only lead capture, and the booking funnel needs only scheduling.
 * Neither sees the other's surface area.
 */
import type { LocationKey } from "@/lib/ghlCalendars";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Slot {
  startTime: string; // ISO
  endTime?: string;  // ISO
}

export interface AppointmentInput {
  location: LocationKey;
  contactId: string;
  startTime: string;
  endTime?: string;
  title?: string;
  notes?: string;
}

export interface AppointmentResult {
  ok: boolean;
  status: number;
}

export interface IAppointmentBooker {
  listAvailability(location: LocationKey, range: DateRange): Promise<Record<string, string[]>>;
  bookAppointment(input: AppointmentInput): Promise<AppointmentResult>;
}
