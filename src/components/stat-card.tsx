import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  unit,
  subtitle,
}: {
  title: string;
  value: string | number;
  unit: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
        <p className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight">
          {value}
          <span className="ml-1 text-xs sm:text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
        {subtitle && (
          <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
