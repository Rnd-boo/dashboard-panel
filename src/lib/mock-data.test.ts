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

// History records
import { historyRecords, getHistoryStats } from "./mock-data";
assert(historyRecords.length === 30, "Should have 30 history records");
assert(historyRecords.every((h) => h.energy > 0), "History energy must be positive");
assert(historyRecords.every((h) => h.peakPower > 0), "Peak power must be positive");
const historyStats = getHistoryStats(historyRecords.slice(-14));
assert(historyStats.totalEnergy > 0, "Total energy must be positive");
assert(historyStats.recordCount === 14, "History slice count mismatch");

console.log("✓ Solar dashboard self-check passed");
