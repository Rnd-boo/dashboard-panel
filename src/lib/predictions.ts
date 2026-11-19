import { createClient } from "@supabase/supabase-js";

export type PredictionInput = {
  voltage: number;
  current: number;
  power: number;
  panel_temperature: number | null;
  light_lux: number;
  air_temperature: number;
  humidity: number;
  recorded_at: string;
};

export type PredictionResponse = {
  predicted_power: number;
  unit: string;
  forecast_minutes: number;
};

export type PredictionResult = {
  latest_reading: PredictionInput;
  recent_readings: PredictionInput[];
  prediction: PredictionResponse;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function getPrediction(): Promise<PredictionResult> {
  const { data: rows, error } = await supabase
    .from("sensor_readings")
    .select(
      "voltage, current, power, panel_temperature, light_lux, air_temperature, humidity, recorded_at",
    )
    .order("recorded_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  if (!rows || rows.length === 0) {
    throw new Error("No sensor data found in sensor_readings");
  }

  const latest = rows[0] as PredictionInput;
  const recent = (rows as PredictionInput[]).slice().reverse();

  const mlApiUrl = process.env.PYTHON_ML_API_URL || "http://127.0.0.1:8000";
  const payload = {
    ...latest,
    // shortcut: Python model requires non-null panel_temperature; fallback to air_temperature
    panel_temperature: latest.panel_temperature ?? latest.air_temperature ?? 25,
  };

  const response = await fetch(`${mlApiUrl}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Python ML API prediction failed (${response.status})`);
  }

  const prediction = (await response.json()) as PredictionResponse;

  return {
    latest_reading: latest,
    recent_readings: recent,
    prediction,
  };
}
