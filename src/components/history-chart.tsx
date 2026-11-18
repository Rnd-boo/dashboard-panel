"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type DailyRow = {
  dayLabel: string;
  energy: number;
  peakPower: number;
};

export function HistoryChart({ data }: { data: DailyRow[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">
          Tren Produksi Energi Historis
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Perbandingan hasil energi (kWh) dan daya puncak harian (W)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                opacity={0.6}
              />
              <XAxis
                dataKey="dayLabel"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="energy"
                width={45}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit=" kWh"
              />
              <YAxis
                yAxisId="power"
                orientation="right"
                width={45}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="W"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-foreground)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "var(--color-foreground)" }}
                labelStyle={{
                  color: "var(--color-muted-foreground)",
                  fontWeight: 500,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Area
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                name="Energi (kWh)"
                stroke="hsl(48, 96%, 53%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#energyFill)"
              />
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="peakPower"
                name="Daya Puncak (W)"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
