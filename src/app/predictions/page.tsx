import { PredictionChart } from "@/components/prediction-chart";
import { StatCard } from "@/components/stat-card";
import { predictions, getStats } from "@/lib/mock-data";

export default function PredictionsPage() {
  const stats = getStats();
  const futurePredictions = predictions.filter((p) => p.actual === undefined);
  const maxPredicted = Math.max(
    ...futurePredictions.map((p) => p.predicted),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prediksi Daya</h1>
        <p className="text-sm text-muted-foreground">
          Estimasi keluaran daya jangka pendek — {futurePredictions.length} jam
          ke depan
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Jam Berikutnya"
          value={stats.predictedNextHour}
          unit="W"
          subtitle="Estimasi keluaran"
        />
        <StatCard
          title="Puncak Prediksi"
          value={maxPredicted}
          unit="W"
          subtitle="Dalam rentang perkiraan"
        />
        <StatCard
          title="Daya Saat Ini"
          value={stats.totalCurrentOutput}
          unit="W"
          subtitle="Total seluruh panel"
        />
      </div>

      <PredictionChart data={predictions} />

      {/* <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">About predictions</p>
        <p className="mt-1">
          Estimates are based on recent output trends and solar irradiance
          patterns. Accuracy improves with historical data. Connect to Supabase
          to store readings and enable ML-based forecasting.
        </p>
      </div> */}
    </div>
  );
}
