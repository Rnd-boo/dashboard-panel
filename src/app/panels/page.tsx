import { PanelCard } from "@/components/panel-card";
import { panels } from "@/lib/mock-data";

export default function PanelsPage() {
  const active = panels.filter((p) => p.status === "active").length;
  const totalOutput = panels.reduce((s, p) => s + p.currentOutput, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel Surya</h1>
        <p className="text-sm text-muted-foreground">
          {active} aktif · {totalOutput}W total daya
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel) => (
          <PanelCard key={panel.id} panel={panel} />
        ))}
      </div>
    </div>
  );
}
