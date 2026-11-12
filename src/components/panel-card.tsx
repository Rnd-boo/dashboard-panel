import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SolarPanel } from "@/lib/mock-data";

const statusColor = {
  active: "default",
  inactive: "secondary",
  fault: "destructive",
} as const;

const statusLabel = {
  active: "Aktif",
  inactive: "Nonaktif",
  fault: "Gangguan",
} as const;

export function PanelCard({ panel }: { panel: SolarPanel }) {
  const utilization =
    panel.capacity > 0
      ? Math.round((panel.currentOutput / panel.capacity) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{panel.name}</span>
          <Badge variant={statusColor[panel.status]}>
            {statusLabel[panel.status]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daya</span>
          <span className="font-medium">
            {panel.currentOutput}W / {panel.capacity}Wp
          </span>
        </div>
        {/* utilization bar */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-yellow-500 transition-all"
            style={{ width: `${utilization}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{panel.location}</span>
          <span>{panel.panelTemp}°C</span>
        </div>
      </CardContent>
    </Card>
  );
}
