"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SensorReading } from "@/lib/supabase/types";

const supabase = createClient();

/** Latest N readings ordered by time ascending with realtime subscription */
export function useLatestReadings(limit = 48) {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("sensor_readings")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(limit)
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setData((rows as SensorReading[]).reverse());
        setLoading(false);
      });

    const channel = supabase
      .channel(`latest-readings-${limit}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (payload) => {
          const newRow = payload.new as SensorReading;
          setData((prev) => {
            if (prev.some((r) => r.id === newRow.id)) return prev;
            const next = [...prev, newRow];
            return next.length > limit ? next.slice(next.length - limit) : next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { data, loading, error };
}

/** All readings for today (UTC) with realtime subscription */
export function useTodayReadings() {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    supabase
      .from("sensor_readings")
      .select("*")
      .gte("recorded_at", todayStart.toISOString())
      .order("recorded_at", { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setData(rows as SensorReading[]);
        setLoading(false);
      });

    const channel = supabase
      .channel("today-readings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (payload) => {
          const newRow = payload.new as SensorReading;
          const todayISO = new Date().toISOString().slice(0, 10);
          if (newRow.recorded_at.startsWith(todayISO)) {
            setData((prev) =>
              prev.some((r) => r.id === newRow.id) ? prev : [...prev, newRow]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
}

/** Readings within last N days with realtime subscription */
export function useReadingsByDays(days: number) {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    supabase
      .from("sensor_readings")
      .select("*")
      .gte("recorded_at", since.toISOString())
      .order("recorded_at", { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setData(rows as SensorReading[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`readings-days-${days}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (payload) => {
          const newRow = payload.new as SensorReading;
          setData((prev) =>
            prev.some((r) => r.id === newRow.id) ? prev : [...prev, newRow]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [days]);

  return { data, loading, error };
}

// ----- Transform helpers -----

/** Format recorded_at to HH:mm */
export function formatTime(recorded_at: string) {
  return new Date(recorded_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

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
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    let energyWh = 0;
    for (let i = 1; i < sorted.length; i++) {
      const dt =
        (new Date(sorted[i].recorded_at).getTime() -
          new Date(sorted[i - 1].recorded_at).getTime()) /
        3_600_000; // hours
      energyWh += ((sorted[i].power + sorted[i - 1].power) / 2) * dt;
    }
    const energyKwh = Math.round((energyWh / 1000) * 100) / 100;

    const validTemps = rows
      .map((r) => r.panel_temperature)
      .filter((t): t is number => t != null);
    const avgTemp =
      validTemps.length > 0
        ? Math.round((validTemps.reduce((s, t) => s + t, 0) / validTemps.length) * 10) / 10
        : null;

    const avgHumidity = rows
      .filter((r) => r.humidity != null)
      .reduce((s, r, _, a) => s + r.humidity! / a.length, 0);

    const d = new Date(date);
    const dayLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    return {
      date,
      dayLabel,
      energy: energyKwh,
      peakPower: Math.round(peakPower * 100) / 100,
      avgTemp,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
      readingCount: rows.length,
    };
  });
}
