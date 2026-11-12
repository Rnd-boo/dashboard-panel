import { PowerChart } from "@/components/power-chart";
import { EnergyBarChart } from "@/components/energy-bar-chart";
import { PanelCard } from "@/components/panel-card";
import { StatCard } from "@/components/stat-card";
import { panelReadings, dailyEnergy, panels, getStats } from "@/lib/mock-data";

export default function Home() {
  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard Solar
        </h1>
        <p className="text-sm text-muted-foreground">
          {stats.activePanels}/{stats.totalPanels} panel aktif
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Daya Saat Ini"
          value={stats.totalCurrentOutput}
          unit="W"
          subtitle={`dari ${stats.totalCapacity}Wp kapasitas`}
        />
        <StatCard title="Hasil Hari Ini" value={stats.todayEnergy} unit="kWh" />
        <StatCard
          title="Daya Puncak"
          value={stats.peakPower}
          unit="W"
          subtitle="Puncak hari ini"
        />
        <StatCard
          title="Prediksi (1 Jam Kedepan)"
          value={stats.predictedNextHour}
          unit="W"
          subtitle="Estimasi jangka pendek"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PowerChart data={panelReadings} />
        <EnergyBarChart data={dailyEnergy} />
      </div>

      {/* Panel cards */}
      <div>
        <h2 className="mb-3 text-lg font-medium">Daftar Panel Aktif</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {panels.map(
            (panel) =>
              panel.status === "active" && (
                <PanelCard key={panel.id} panel={panel} />
              ),
          )}
        </div>
      </div>
    </div>
  );
}
