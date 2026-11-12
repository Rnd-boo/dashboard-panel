import { PredictionChart } from "@/components/prediction-chart";
import { StatCard } from "@/components/stat-card";
import { predictions, getStats } from "@/lib/mock-data";

export default function PredictionsPage() {
  const stats = getStats();
  const futurePredictions = predictions.filter((p) => p.actual === undefined);
  const maxPredicted = Math.max(...futurePredictions.map((p) => p.predicted), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Power Predictions
        </h1>
        <p className="text-sm text-muted-foreground">
          Short-term solar output estimation — next {futurePredictions.length} hours
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Next Hour"
          value={stats.predictedNextHour}
          unit="W"
          subtitle="Estimated output"
        />
        <StatCard
          title="Peak Predicted"
          value={maxPredicted}
          unit="W"
          subtitle="In forecast window"
        />
        <StatCard
          title="Current Output"
          value={stats.totalCurrentOutput}
          unit="W"
          subtitle="All panels combined"
        />
      </div>

      <PredictionChart data={predictions} />

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">About predictions</p>
        <p className="mt-1">
          Estimates are based on recent output trends and solar irradiance
          patterns. Accuracy improves with historical data. Connect to Supabase
          to store readings and enable ML-based forecasting.
        </p>
      </div>
    </div>
  );
}
