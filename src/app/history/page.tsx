"use client";

import { useMemo, useState } from "react";
import { HistoryChart } from "@/components/history-chart";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { historyRecords, getHistoryStats } from "@/lib/mock-data";

const ranges = [
  { label: "7 Hari", value: 7 },
  { label: "14 Hari", value: 14 },
  { label: "30 Hari", value: 30 },
] as const;

const statusBadge = {
  optimal: { label: "Optimal", variant: "default" as const },
  normal: { label: "Normal", variant: "secondary" as const },
  rendah: { label: "Di Bawah Target", variant: "destructive" as const },
};

export default function HistoryPage() {
  const [selectedRange, setSelectedRange] = useState<7 | 14 | 30>(14);

  const displayedRecords = useMemo(
    () => historyRecords.slice(-selectedRange),
    [selectedRange]
  );

  const stats = useMemo(
    () => getHistoryStats(displayedRecords),
    [displayedRecords]
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter Range */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Riwayat Performa
          </h1>
          <p className="text-sm text-muted-foreground">
            Catatan historis produksi energi dan performa sistem panel surya
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={selectedRange === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(r.value)}
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
          unit="kWh"
          subtitle={`Periode ${selectedRange} hari`}
        />
        <StatCard
          title="Rata-rata Harian"
          value={stats.avgEnergy}
          unit="kWh/hari"
          subtitle="Estimasi per hari"
        />
        <StatCard
          title="Produksi Tertinggi"
          value={stats.peakEnergy}
          unit="kWh"
          subtitle={`Pada ${stats.peakDayLabel}`}
        />
        <StatCard
          title="Rata-rata Efisiensi"
          value={stats.avgEfficiency}
          unit="%"
          subtitle="Efisiensi konversi"
        />
      </div>

      {/* History Chart */}
      <HistoryChart data={displayedRecords} />

      {/* History Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Log Harian ({displayedRecords.length} Hari)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Energi</th>
                  <th className="px-4 py-3">Daya Puncak</th>
                  <th className="px-4 py-3">Rata-rata Radiasi</th>
                  <th className="px-4 py-3">Suhu Rata-rata</th>
                  <th className="px-4 py-3">Efisiensi</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedRecords
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={row.date} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {row.dayLabel}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({row.date})
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                        {row.energy} kWh
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {row.peakPower} W
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {row.avgIrradiance} W/m²
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {row.avgTemp}°C
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {row.efficiency}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Badge variant={statusBadge[row.status].variant}>
                          {statusBadge[row.status].label}
                        </Badge>
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
