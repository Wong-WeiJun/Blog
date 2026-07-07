import { adminGetAdminStats } from "@/client/sdk.gen";
import type { AdminStatsResponse } from "@/client/types.gen";

export type Period = "7d" | "30d" | "90d" | "12mo";
export type { AdminStatsResponse };

export async function getAdminStats(period?: Period): Promise<AdminStatsResponse> {
  const res = await adminGetAdminStats({
    query: period ? { period } : { period: "7d" },
    throwOnError: true,
  });
  return res.data as AdminStatsResponse;
}

export function formatPeriodDelta(
  current: number,
  previous: number,
  label: string,
): { delta: string; up: boolean } {
  if (previous === 0) {
    if (current === 0) return { delta: `no change ${label}`, up: true };
    return { delta: `+${current} ${label}`, up: true };
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return {
    delta: `${up ? "+" : ""}${pct.toFixed(0)}% ${label}`,
    up,
  };
}

export function formatDateRange(dates: { date: string }[]): string {
  if (dates.length === 0) return "";
  const first = new Date(dates[0].date);
  const last = new Date(dates[dates.length - 1].date);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(first)} – ${fmt(last)}`;
}

export function shortDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

export function shortDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
