"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestReadings } from "@/lib/supabase/hooks";

export default function PanelsPage() {
  const { data: readings, loading } = useLatestReadings(50);
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  const recentTable = useMemo(
    () => readings.slice().reverse().slice(0, 20),
    [readings],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse text-sm">
          Memuat data sensor...
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Tidak ada data sensor tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detail Sensor
          </h1>
          <p className="text-sm text-muted-foreground">
            Pembacaan terakhir:{" "}
            {new Date(latest.recorded_at).toLocaleString("id-ID")}
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

      {/* Current readings */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard title="Daya" value={latest.power} unit="W" />
        <StatCard title="Tegangan" value={latest.voltage} unit="V" />
        <StatCard title="Arus" value={latest.current} unit="A" />
        <StatCard
          title="Suhu Panel"
          value={latest.panel_temperature ?? "—"}
          unit={latest.panel_temperature != null ? "°C" : ""}
        />
        <StatCard
          title="Cahaya"
          value={latest.light_lux ?? "—"}
          unit={latest.light_lux != null ? "lux" : ""}
        />
        <StatCard
          title="Suhu Udara"
          value={latest.air_temperature ?? "—"}
          unit={latest.air_temperature != null ? "°C" : ""}
        />
        <StatCard
          title="Kelembaban"
          value={latest.humidity ?? "—"}
          unit={latest.humidity != null ? "%" : ""}
        />
        <StatCard title="ID Pembacaan" value={`#${latest.id}`} unit="" />
      </div>

      {/* Recent readings table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Riwayat Pembacaan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Daya</th>
                  <th className="px-4 py-3">Tegangan</th>
                  <th className="px-4 py-3">Arus</th>
                  <th className="px-4 py-3">Suhu Panel</th>
                  <th className="px-4 py-3">Cahaya</th>
                  <th className="px-4 py-3">Suhu Udara</th>
                  <th className="px-4 py-3">Kelembaban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTable.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {new Date(r.recorded_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.power} W</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.voltage} V
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.current} A
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.panel_temperature != null
                        ? `${r.panel_temperature}°C`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.light_lux != null ? `${r.light_lux} lux` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.air_temperature != null
                        ? `${r.air_temperature}°C`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.humidity != null ? `${r.humidity}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
