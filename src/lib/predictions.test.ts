// Ponytail self-check: verify prediction types and data flow
import { getPrediction } from "./predictions";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function run() {
  const result = await getPrediction();
  assert(typeof result.prediction.predicted_power === "number", "predicted_power should be a number");
  assert(result.prediction.unit === "W", "prediction unit should be W");
  assert(result.prediction.forecast_minutes === 30, "forecast_minutes should be 30");
  assert(typeof result.latest_reading.power === "number", "latest_reading power should be a number");
  assert(result.recent_readings.length > 0, "recent_readings should have records");
  console.log("✓ Prediction self-check passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
