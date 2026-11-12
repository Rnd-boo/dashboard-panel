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

export type HistoryRecord = {
  date: string;
  dayLabel: string;
  energy: number; // kWh
  peakPower: number; // W
  avgIrradiance: number; // W/m²
  avgTemp: number; // °C
  efficiency: number; // %
  status: "optimal" | "normal" | "rendah";
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
  const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
  return {
    day: dayName,
    energy: Math.round((18 + Math.random() * 12) * 10) / 10, // 18-30 kWh
  };
});

export const panels: SolarPanel[] = [
  { id: "sp-001", name: "Array Atap A", capacity: 400, status: "active", currentOutput: 320, panelTemp: 42, location: "Atap Utama - Timur" },
  { id: "sp-002", name: "Array Atap B", capacity: 400, status: "active", currentOutput: 305, panelTemp: 44, location: "Atap Utama - Barat" },
  { id: "sp-003", name: "Panel Tanah 1", capacity: 550, status: "active", currentOutput: 480, panelTemp: 38, location: "Area Selatan" },
  { id: "sp-004", name: "Array Carport", capacity: 300, status: "active", currentOutput: 210, panelTemp: 40, location: "Area Parkir" },
  { id: "sp-005", name: "Panel Fasad", capacity: 200, status: "inactive", currentOutput: 0, panelTemp: 28, location: "Dinding Selatan" },
  { id: "sp-006", name: "Unit Pelacak", capacity: 500, status: "fault", currentOutput: 0, panelTemp: 35, location: "Area Timur" },
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

// 30 days history data
export const historyRecords: HistoryRecord[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const dateStr = d.toISOString().split("T")[0];
  const dayLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const factor = 0.65 + Math.sin(i / 3) * 0.25 + (Math.sin(i * 7) * 0.1);
  const energy = Math.round((22 * factor) * 10) / 10;
  const peakPower = Math.round(1800 * factor);
  const avgIrradiance = Math.round(520 * factor);
  const avgTemp = Math.round((27 + factor * 7) * 10) / 10;
  const efficiency = Math.round((18.5 * (factor > 0.8 ? 1 : 0.95)) * 10) / 10;

  let status: HistoryRecord["status"] = "normal";
  if (energy >= 20) status = "optimal";
  else if (energy < 14) status = "rendah";

  return {
    date: dateStr,
    dayLabel,
    energy,
    peakPower,
    avgIrradiance,
    avgTemp,
    efficiency,
    status,
  };
});

export function getHistoryStats(records: HistoryRecord[] = historyRecords) {
  const totalEnergy = Math.round(records.reduce((sum, r) => sum + r.energy, 0) * 10) / 10;
  const avgEnergy = Math.round((totalEnergy / records.length) * 10) / 10;
  const maxDay = records.reduce((max, r) => (r.energy > max.energy ? r : max), records[0]);
  const avgEfficiency =
    Math.round((records.reduce((sum, r) => sum + r.efficiency, 0) / records.length) * 10) / 10;

  return {
    totalEnergy,
    avgEnergy,
    peakEnergy: maxDay.energy,
    peakDayLabel: maxDay.dayLabel,
    avgEfficiency,
    recordCount: records.length,
  };
}
