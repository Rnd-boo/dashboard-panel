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
          Solar Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          {stats.activePanels}/{stats.totalPanels} panels active
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Current Output"
          value={stats.totalCurrentOutput}
          unit="W"
          subtitle={`of ${stats.totalCapacity}Wp capacity`}
        />
        <StatCard
          title="Today's Yield"
          value={stats.todayEnergy}
          unit="kWh"
        />
        <StatCard
          title="Peak Power"
          value={stats.peakPower}
          unit="W"
          subtitle="Today's peak"
        />
        <StatCard
          title="Predicted (Next Hr)"
          value={stats.predictedNextHour}
          unit="W"
          subtitle="Short-term estimate"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PowerChart data={panelReadings} />
        <EnergyBarChart data={dailyEnergy} />
      </div>

      {/* Panel cards */}
      <div>
        <h2 className="mb-3 text-lg font-medium">Panels</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      </div>
    </div>
  );
}
