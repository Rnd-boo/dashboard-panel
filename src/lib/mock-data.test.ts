// Ponytail self-check: verify solar math and data shape
import { panelReadings, dailyEnergy, panels, predictions, getStats } from "./mock-data";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

// 24 readings
assert(panelReadings.length === 24, "Should have 24 hourly readings");
assert(panelReadings.every((r) => r.powerOutput >= 0), "Power output cannot be negative");
assert(panelReadings.every((r) => r.irradiance >= 0), "Irradiance cannot be negative");

// Noon should have more power than midnight
const noonPower = panelReadings[12].powerOutput;
const midnightPower = panelReadings[0].powerOutput;
assert(noonPower > midnightPower, "Noon power should be higher than midnight");
assert(midnightPower === 0, "Midnight power should be 0");

// 7 days of energy
assert(dailyEnergy.length === 7, "Should have 7 days of energy data");
assert(dailyEnergy.every((d) => d.energy > 0), "Daily energy should be positive");

// Panels
assert(panels.length > 0, "Should have panels defined");
assert(panels.some((p) => p.status === "active"), "Should have at least one active panel");

// Predictions
assert(predictions.length > 0, "Should have predictions");
assert(predictions.some((p) => p.actual !== undefined), "Should have historical actuals");
assert(predictions.some((p) => p.actual === undefined), "Should have future predictions");

// Stats
const stats = getStats();
assert(stats.totalCurrentOutput >= 0, "Total output must be non-negative");
assert(stats.totalPanels === panels.length, "Total panels count mismatch");

console.log("✓ Solar dashboard self-check passed");
