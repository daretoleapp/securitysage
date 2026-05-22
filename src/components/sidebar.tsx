"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bug,
  ScanSearch,
  KeyRound,
  Package,
  History,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",                label: "Overview",         icon: LayoutDashboard },
  { href: "/scan",            label: "Scan",             icon: ScanSearch },
  { href: "/vulnerabilities", label: "Vulnerabilities",  icon: Bug },
  { href: "/secrets",         label: "Secrets",          icon: KeyRound },
  { href: "/dependencies",    label: "Dependencies",     icon: Package },
  { href: "/history",         label: "History",          icon: History },
  { href: "/settings",        label: "Settings",         icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] hidden md:flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">SecuritySage</div>
          <div className="text-[10px] text-zinc-500">Code security AI</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-orange-500/10 text-orange-300 border border-orange-500/20"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--border)] text-[10px] text-zinc-500">
        <div className="mono">SecuritySage v0.1.0</div>
        <div className="mt-1">MiMo Pro + VL · OpenRouter</div>
      </div>
    </aside>
  );
}
