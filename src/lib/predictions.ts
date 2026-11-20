import { createClient } from "@supabase/supabase-js";

export type PredictionInput = {
  voltage: number;
  current: number;
  power: number;
  panel_temperature: number | null;
  light_lux: number | null;
  air_temperature: number | null;
  humidity: number | null;
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
  // shortcut: Python model requires non-null numeric fields; fallback to recent valid readings or sensor defaults
  const validLux =
    latest.light_lux ?? rows.find((r) => r.light_lux != null)?.light_lux ?? 0;
  const validPanelTemp =
    latest.panel_temperature ?? latest.air_temperature ?? 25;
  const validAirTemp =
    latest.air_temperature ?? latest.panel_temperature ?? 25;
  const validHumidity = latest.humidity ?? 50;

  const payload = {
    voltage: latest.voltage ?? 0,
    current: latest.current ?? 0,
    power: latest.power ?? 0,
    panel_temperature: validPanelTemp,
    light_lux: validLux,
    air_temperature: validAirTemp,
    humidity: validHumidity,
    recorded_at: latest.recorded_at,
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
    const errorText = await response.text();
    throw new Error(
      `Python ML API prediction failed (${response.status}): ${errorText}`,
    );
  }

  const prediction = (await response.json()) as PredictionResponse;

  return {
    latest_reading: latest,
    recent_readings: recent,
    prediction,
  };
}
