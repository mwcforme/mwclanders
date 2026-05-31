/**
 * AdminStatsService — data access layer for admin dashboard metrics.
 *
 * DIP: Admin pages depend on this service, not on raw Supabase calls.
 * SRP: This module's only job is querying lead_captures stats.
 */
import { supabase } from "@/integrations/supabase/legacy";
import type { ConversionStats } from "@/components/admin/analyticsTypes";

export interface QuickStats {
  totalLeads: number;
  leadsToday: number;
  leadsYesterday: number;
  bookings: number;
  partialLeads: number;
}

export interface RecentLeadRow {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  source: string | null;
  crm_status: string | null;
  crm_contact_id: string | null;
  created_at: string | null;
}

export interface SyncRunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  leads_synced: number | null;
  leads_failed: number | null;
  error_message: string | null;
}

export async function fetchQuickStats(): Promise<QuickStats> {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  const [total, today, yesterday, bookings, partial] = await Promise.all([
    supabase.from("lead_captures").select("id", { count: "exact", head: true }),
    supabase.from("lead_captures").select("id", { count: "exact", head: true }).gte("created_at", since24h),
    supabase.from("lead_captures").select("id", { count: "exact", head: true }).gte("created_at", since48h).lt("created_at", since24h),
    supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "booked"),
    supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "partial"),
  ]);

  return {
    totalLeads: total.count ?? 0,
    leadsToday: today.count ?? 0,
    leadsYesterday: yesterday.count ?? 0,
    bookings: bookings.count ?? 0,
    partialLeads: partial.count ?? 0,
  };
}

export async function fetchRecentLeads(limit = 20): Promise<RecentLeadRow[]> {
  const { data, error } = await supabase
    .from("lead_captures")
    .select("id, name, phone, email, location, source, crm_status, crm_contact_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RecentLeadRow[];
}

export async function fetchLastSyncRun(): Promise<SyncRunRow | null> {
  const { data, error } = await supabase
    .from("sync_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as SyncRunRow | null;
}

export async function fetchConversionStats(): Promise<ConversionStats> {
  const [total, booked, partial, synced, failed, byLocation, bySource] =
    await Promise.all([
      supabase.from("lead_captures").select("id", { count: "exact", head: true }),
      supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "booked"),
      supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "partial"),
      supabase.from("lead_captures").select("id", { count: "exact", head: true }).in("crm_status", ["synced", "ok"]),
      supabase.from("lead_captures").select("id", { count: "exact", head: true }).eq("crm_status", "failed"),
      supabase.from("lead_captures").select("location").order("location"),
      supabase.from("lead_captures").select("source").order("source"),
    ]);

  const locMap: Record<string, number> = {};
  (byLocation.data ?? []).forEach((r) => {
    const k = r.location ?? "(unknown)";
    locMap[k] = (locMap[k] ?? 0) + 1;
  });

  const srcMap: Record<string, number> = {};
  (bySource.data ?? []).forEach((r) => {
    const k = r.source ?? "(direct)";
    srcMap[k] = (srcMap[k] ?? 0) + 1;
  });

  return {
    totalLeads: total.count ?? 0,
    bookedLeads: booked.count ?? 0,
    partialLeads: partial.count ?? 0,
    syncedLeads: synced.count ?? 0,
    failedLeads: failed.count ?? 0,
    leadsByLocation: Object.entries(locMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    leadsBySource: Object.entries(srcMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}
