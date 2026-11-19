"use client";

import { useMemo, useState } from "react";
import { HistoryChart } from "@/components/history-chart";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReadingsByDays, aggregateDaily } from "@/lib/supabase/hooks";

const ranges = [
  { label: "7 Hari", value: 7 },
  { label: "14 Hari", value: 14 },
  { label: "30 Hari", value: 30 },
] as const;

const PAGE_SIZE = 25;

export default function HistoryPage() {
  const [selectedRange, setSelectedRange] = useState<7 | 14 | 30>(14);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: readings, loading } = useReadingsByDays(selectedRange);

  const dailyData = useMemo(() => aggregateDaily(readings), [readings]);

  const stats = useMemo(() => {
    if (dailyData.length === 0)
      return {
        totalEnergy: 0,
        avgEnergy: 0,
        peakEnergy: 0,
        peakDayLabel: "—",
        dayCount: 0,
      };

    const totalEnergy =
      Math.round(dailyData.reduce((s, d) => s + d.energy, 0) * 100) / 100;
    const avgEnergy = Math.round((totalEnergy / dailyData.length) * 100) / 100;
    const maxDay = dailyData.reduce(
      (max, d) => (d.energy > max.energy ? d : max),
      dailyData[0],
    );

    return {
      totalEnergy,
      avgEnergy,
      peakEnergy: maxDay.energy,
      peakDayLabel: maxDay.dayLabel,
      dayCount: dailyData.length,
    };
  }, [dailyData]);

  // Sort newest first for the history table
  const sortedReadings = useMemo(() => [...readings].reverse(), [readings]);

  const totalPages = Math.ceil(sortedReadings.length / PAGE_SIZE) || 1;

  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedReadings.slice(start, start + PAGE_SIZE);
  }, [sortedReadings, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground animate-pulse text-sm">
          Memuat data riwayat...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Range */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Riwayat Performa
          </h1>
          <p className="text-sm text-muted-foreground">
            Data historis produksi energi dan pembacaan sensor panel surya
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={selectedRange === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedRange(r.value);
                setCurrentPage(1);
              }}
              className="text-xs h-7 px-3"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Produksi"
          value={stats.totalEnergy}
          unit="Wh"
          subtitle={`${stats.dayCount} hari data`}
        />
        <StatCard
          title="Rata-rata Harian"
          value={stats.avgEnergy}
          unit="Wh/hari"
          subtitle="Estimasi per hari"
        />
        <StatCard
          title="Produksi Tertinggi"
          value={stats.peakEnergy}
          unit="Wh"
          subtitle={`Pada ${stats.peakDayLabel}`}
        />
        <StatCard
          title="Total Pembacaan"
          value={readings.length}
          unit=""
          subtitle={`Periode ${selectedRange} hari`}
        />
      </div>

      {/* History Chart */}
      <HistoryChart data={dailyData} />

      {/* History Table with Pagination */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            Log Riwayat Sensor ({sortedReadings.length} Data)
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
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
                {paginatedReadings.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {new Date(row.recorded_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                      {row.power} W
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.voltage} V
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.current} A
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.panel_temperature != null
                        ? `${row.panel_temperature}°C`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.light_lux != null ? `${row.light_lux} lux` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.air_temperature != null
                        ? `${row.air_temperature}°C`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {row.humidity != null ? `${row.humidity}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              Menampilkan{" "}
              {sortedReadings.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}{" "}
              - {Math.min(currentPage * PAGE_SIZE, sortedReadings.length)} dari{" "}
              {sortedReadings.length} data
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Sebelumnya
              </Button>
              <span className="px-2 text-foreground font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
