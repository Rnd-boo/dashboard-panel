"use client";

import { createClient } from "@/lib/supabase/client";
import type { SensorReading } from "@/lib/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

const supabase = createClient();

/** Latest N readings ordered by time ascending */
export function useLatestReadings(limit = 48) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["latest", limit],
    queryFn: async () => {
      const result = await supabase
        .from("sensor_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(limit);

      if (result.error) {
        toast.add({
          type: "warning",
          description: "Failed fetch latest Sensor Reading",
        });
        throw result.error;
      }
      return (result.data ?? []).reverse();
    },
    initialData: [],
  });

  return { data, isLoading, error, refetch, loading: isLoading };
}

export function useTodayReadings() {
  const start = new Date();
  const end = new Date();
  start.setHours(0);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["today"],
    queryFn: async () => {
      const result = await supabase
        .from("sensor_readings")
        .select("*")
        .gte("recorded_at", start.toISOString())
        .lt("recorded_at", end.toISOString());

      if (result.error) {
        toast.add({
          type: "warning",
          description: "Failed fetch today Sensor Reading",
        });
        throw result.error;
      }
      return result.data ?? [];
    },
    initialData: [],
  });

  return { data, isLoading, error, refetch, loading: isLoading };
}

/** Readings within last N days */
export function useReadingsByDays(days: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["readings-days", days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const result = await supabase
        .from("sensor_readings")
        .select("*")
        .gte("recorded_at", since.toISOString())
        .order("recorded_at", { ascending: true });

      if (result.error) {
        toast.add({
          type: "warning",
          description: `Failed fetch ${days} days Sensor Reading`,
        });
        throw result.error;
      }
      return result.data ?? [];
    },
    initialData: [],
  });

  return { data, isLoading, error, refetch, loading: isLoading };
}

// ----- Transform helpers -----

export { formatTime } from "@/lib/date";

/** Group readings by date, compute daily aggregates */
export function aggregateDaily(readings: SensorReading[]) {
  const byDay = new Map<string, SensorReading[]>();
  for (const r of readings) {
    const day = r.recorded_at.slice(0, 10); // YYYY-MM-DD
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(r);
  }

  return Array.from(byDay.entries()).map(([date, rows]) => {
    const peakPower = Math.max(...rows.map((r) => r.power));
    // Energy estimate: sum of (power × interval_hours). Readings are ~30min apart.
    // Sort by time, sum trapezoid approximation
    const sorted = rows.sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    );
    let energyWh = 0;
    for (let i = 1; i < sorted.length; i++) {
      const dt =
        (new Date(sorted[i].recorded_at).getTime() -
          new Date(sorted[i - 1].recorded_at).getTime()) /
        3_600_000; // hours
      energyWh += ((sorted[i].power + sorted[i - 1].power) / 2) * dt;
    }
    const energyWhRounded = Math.round(energyWh * 100) / 100;

    const validTemps = rows
      .map((r) => r.panel_temperature)
      .filter((t): t is number => t != null);
    const avgTemp =
      validTemps.length > 0
        ? Math.round(
            (validTemps.reduce((s, t) => s + t, 0) / validTemps.length) * 10,
          ) / 10
        : null;

    const avgHumidity = rows
      .filter((r) => r.humidity != null)
      .reduce((s, r, _, a) => s + r.humidity! / a.length, 0);

    const d = new Date(date);
    const dayLabel = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    return {
      date,
      dayLabel,
      energy: energyWhRounded,
      peakPower: Math.round(peakPower * 100) / 100,
      avgTemp,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      readingCount: rows.length,
    };
  });
}
