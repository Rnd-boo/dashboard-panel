import { Suspense } from "react";
import {
  PredictionChart,
  type PredictionChartPoint,
} from "@/components/prediction-chart";
import { StatCard } from "@/components/stat-card";
import { getPrediction } from "@/lib/predictions";
import { formatTime } from "@/lib/date";

export default function PredictionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-sm text-muted-foreground">
            Memuat prediksi...
          </div>
        </div>
      }
    >
      <PredictionContent />
    </Suspense>
  );
}

async function PredictionContent() {
  let result;
  let errorMsg: string | null = null;

  try {
    result = await getPrediction();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Gagal memuat prediksi";
  }

  if (errorMsg || !result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Prediksi Daya</h1>
          <p className="text-sm text-muted-foreground">
            Estimasi keluaran daya Machine Learning
          </p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">
            Layanan Prediksi Tidak Tersedia
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {errorMsg}. Pastikan service Python ML aktif di port 8000.
          </p>
        </div>
      </div>
    );
  }

  const { latest_reading, recent_readings, prediction } = result;
  const powerDiff =
    Math.round((prediction.predicted_power - latest_reading.power) * 100) / 100;

  const chartData: PredictionChartPoint[] = recent_readings.map((r, i) => ({
    time: formatTime(r.recorded_at),
    actual: r.power,
    predicted: i === recent_readings.length - 1 ? r.power : undefined,
  }));

  const futureDate = new Date(
    new Date(latest_reading.recorded_at).getTime() +
      prediction.forecast_minutes * 60 * 1000,
  );
  chartData.push({
    time: formatTime(futureDate.toISOString()),
    predicted: prediction.predicted_power,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prediksi Daya</h1>
        <p className="text-sm text-muted-foreground">
          Estimasi keluaran daya jangka pendek — {prediction.forecast_minutes} menit ke depan
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Daya Terprediksi"
          value={prediction.predicted_power}
          unit={prediction.unit}
          subtitle={`Perkiraan +${prediction.forecast_minutes} menit`}
        />
        <StatCard
          title="Daya Saat Ini"
          value={latest_reading.power}
          unit="W"
          subtitle={`Pukul ${formatTime(latest_reading.recorded_at)}`}
        />
        <StatCard
          title="Perubahan Estimasi"
          value={powerDiff > 0 ? `+${powerDiff}` : powerDiff}
          unit="W"
          subtitle={powerDiff >= 0 ? "Kenaikan daya" : "Penurunan daya"}
        />
      </div>

      <PredictionChart
        data={chartData}
        forecastMinutes={prediction.forecast_minutes}
      />

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Tentang Prediksi ML</p>
        <p className="mt-1">
          Prediksi dihitung oleh model Machine Learning berdasarkan kondisi sensor terkini
          (irradiansi/lux, suhu panel, tegangan, arus, dan kelembapan) untuk mengestimasi produksi
          daya surya {prediction.forecast_minutes} menit ke depan.
        </p>
      </div>
    </div>
  );
}
