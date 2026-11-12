"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { HourlyPrediction } from "@/lib/mock-data";

export function PredictionChart({ data }: { data: HourlyPrediction[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Predicted vs Actual Output</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Short-term power output estimation (next 6 hours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.6} />
              <XAxis
                dataKey="time"
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
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
                labelStyle={{ color: "var(--color-muted-foreground)", fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual (W)"
                stroke="hsl(48, 96%, 53%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted (W)"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
