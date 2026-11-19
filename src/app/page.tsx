"use client";

import { PowerChart } from "@/components/power-chart";
import { EnergyBarChart } from "@/components/energy-bar-chart";
import { StatCard } from "@/components/stat-card";
import {
  useLatestReadings,
  useTodayReadings,
  useReadingsByDays,
  formatTime,
  aggregateDaily,
} from "@/lib/supabase/hooks";
import { useMemo } from "react";

export default function Home() {
  const { data: latest, loading: loadingLatest } = useLatestReadings(48);
  const { data: today, isLoading: loadingToday } = useTodayReadings();
  const { data: week } = useReadingsByDays(7);
  const chartData = useMemo(
    () =>
      latest.map((r) => ({
        time: formatTime(r.recorded_at),
        power: r.power,
        light_lux: r.light_lux,
      })),
    [latest],
  );

  const dailyEnergy = useMemo(() => {
    const agg = aggregateDaily(week);
    return agg.map((d) => ({ day: d.dayLabel, energy: d.energy }));
  }, [week]);

  const stats = useMemo(() => {
    if (today?.length === 0)
      return {
        currentPower: 0,
        peakPower: 0,
        todayEnergy: 0,
        latestVoltage: 0,
        latestTemp: null as number | null,
        readingCount: 0,
      };

    const lastReading = today[today.length - 1];
    const peakPower = Math.max(...today.map((r) => r.power));

    let energyWh = 0;
    for (let i = 1; i < today.length; i++) {
      const dt =
        (new Date(today[i].recorded_at).getTime() -
          new Date(today[i - 1].recorded_at).getTime()) /
        3_600_000;
      energyWh += ((today[i].power + today[i - 1].power) / 2) * dt;
    }

    return {
      currentPower: Math.round(lastReading.power * 100) / 100,
      peakPower: Math.round(peakPower * 100) / 100,
      todayEnergy: Math.round(energyWh * 100) / 100,
      latestVoltage: Math.round(lastReading.voltage * 100) / 100,
      latestTemp: lastReading.panel_temperature,
      readingCount: today.length,
    };
  }, [today]);

  const isLoading = loadingLatest || loadingToday;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse text-sm">
          Memuat data sensor...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dasbor Surya
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.readingCount} pembacaan hari ini
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Langsung
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Daya Saat Ini"
          value={stats.currentPower}
          unit="W"
          subtitle={`Tegangan: ${stats.latestVoltage}V`}
        />
        <StatCard
          title="Hasil Hari Ini"
          value={stats.todayEnergy}
          unit="Wh"
          subtitle="Estimasi energi"
        />
        <StatCard
          title="Daya Puncak"
          value={stats.peakPower}
          unit="W"
          subtitle="Puncak hari ini"
        />
        <StatCard
          title="Suhu Panel (POWER PREDICTION ??)"
          value={stats.latestTemp ?? "—"}
          unit={stats.latestTemp != null ? "°C" : ""}
          subtitle="Pembacaan terakhir"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PowerChart data={chartData} />
        <EnergyBarChart data={dailyEnergy} />
      </div>
    </div>
  );
}
