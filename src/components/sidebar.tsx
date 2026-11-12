"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  MonitorActivity,
  PanelLeftRightDashed,
  TrendingUpDown,
  History,
} from "lucide-react";
export const navItems = [
  { href: "/", label: "Dashboard", icon: MonitorActivity },
  { href: "/panels", label: "Panels", icon: PanelLeftRightDashed },
  { href: "/predictions", label: "Predictions", icon: TrendingUpDown },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold">Solar Hub</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
              pathname === item.href &&
                "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
