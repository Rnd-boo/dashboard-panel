export type PanelReading = {
  time: string;
  powerOutput: number; // W
  irradiance: number; // W/m²
  panelTemp: number; // °C
  voltage: number; // V
  current: number; // A
};

export type SolarPanel = {
  id: string;
  name: string;
  capacity: number; // Wp (peak watts)
  status: "active" | "inactive" | "fault";
  currentOutput: number; // W
  panelTemp: number; // °C
  location: string;
};

export type HourlyPrediction = {
  time: string;
  predicted: number; // W
  actual?: number; // W (only for past hours)
};

// Simulate a solar bell curve — peaks around noon
function solarCurve(hour: number): number {
  if (hour < 6 || hour > 19) return 0;
  return Math.sin(((hour - 6) / 13) * Math.PI);
}

// 24 hourly readings for today
export const panelReadings: PanelReading[] = Array.from({ length: 24 }, (_, i) => {
  const curve = solarCurve(i);
  const cloudNoise = 0.85 + Math.random() * 0.15;
  const irradiance = Math.round(curve * 1000 * cloudNoise);
  const efficiency = 0.18 + (Math.random() - 0.5) * 0.02;
  const panelArea = 1.7; // m² per panel, 6 panels
  const powerOutput = Math.round(irradiance * efficiency * panelArea * 6);
  const voltage = powerOutput > 0 ? 30 + Math.random() * 8 : 0;
  const current = voltage > 0 ? powerOutput / voltage : 0;

  return {
    time: i.toString().padStart(2, "0") + ":00",
    powerOutput,
    irradiance,
    panelTemp: powerOutput > 0 ? 25 + curve * 30 + (Math.random() - 0.5) * 5 : 20,
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(current * 100) / 100,
  };
});

// Past 7 days energy yield (kWh)
export const dailyEnergy = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  return {
    day: dayName,
    energy: Math.round((18 + Math.random() * 12) * 10) / 10, // 18-30 kWh
  };
});

export const panels: SolarPanel[] = [
  { id: "sp-001", name: "Rooftop Array A", capacity: 400, status: "active", currentOutput: 320, panelTemp: 42, location: "Main Roof - East" },
  { id: "sp-002", name: "Rooftop Array B", capacity: 400, status: "active", currentOutput: 305, panelTemp: 44, location: "Main Roof - West" },
  { id: "sp-003", name: "Ground Mount 1", capacity: 550, status: "active", currentOutput: 480, panelTemp: 38, location: "South Field" },
  { id: "sp-004", name: "Carport Array", capacity: 300, status: "active", currentOutput: 210, panelTemp: 40, location: "Parking Lot" },
  { id: "sp-005", name: "Façade Panel", capacity: 200, status: "inactive", currentOutput: 0, panelTemp: 28, location: "Building South Wall" },
  { id: "sp-006", name: "Tracker Unit", capacity: 500, status: "fault", currentOutput: 0, panelTemp: 35, location: "East Lot" },
];

// Predictions: past 4 hours (actual + predicted) + next 6 hours (predicted only)
export const predictions: HourlyPrediction[] = (() => {
  const now = new Date();
  const currentHour = now.getHours();
  const result: HourlyPrediction[] = [];

  for (let offset = -4; offset <= 6; offset++) {
    const h = currentHour + offset;
    if (h < 0 || h > 23) continue;
    const curve = solarCurve(h);
    const predicted = Math.round(curve * 1800 * (0.9 + Math.random() * 0.1));
    const isPast = offset <= 0;

    result.push({
      time: h.toString().padStart(2, "0") + ":00",
      predicted,
      actual: isPast ? Math.round(predicted * (0.85 + Math.random() * 0.3)) : undefined,
    });
  }
  return result;
})();

// Summary stats
export function getStats() {
  const totalCurrentOutput = panels.reduce((sum, p) => sum + p.currentOutput, 0);
  const totalCapacity = panels.reduce((sum, p) => sum + p.capacity, 0);
  const todayEnergy = dailyEnergy[dailyEnergy.length - 1].energy;
  const peakPower = Math.max(...panelReadings.map((r) => r.powerOutput));
  const activePanels = panels.filter((p) => p.status === "active").length;
  const nextPrediction = predictions.find((p) => p.actual === undefined);

  return {
    totalCurrentOutput,
    totalCapacity,
    todayEnergy,
    peakPower,
    activePanels,
    totalPanels: panels.length,
    predictedNextHour: nextPrediction?.predicted ?? 0,
  };
}
