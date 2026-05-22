"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function Section({ title, sub, children, action }: { title: string; sub?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-zinc-100">{title}</h2>
          {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-12 w-full", className)} />;
}

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <Card className="text-center py-12 border-dashed">
      <div className="text-sm text-zinc-300">{title}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </Card>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <Card className={cn(accent && "glow-orange")}>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={cn("text-2xl font-semibold mt-1", accent ? "text-[var(--accent)]" : "text-zinc-100")}>{value}</div>
      {sub && <div className="text-[11px] text-zinc-500 mt-1">{sub}</div>}
    </Card>
  );
}

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "info" | "success" | "danger" | "warning" | "accent"; className?: string }) {
  const tones = {
    default: "bg-zinc-800/60 text-zinc-300 border-zinc-700",
    info:    "bg-blue-500/10 text-blue-300 border-blue-500/30",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    danger:  "bg-red-500/10 text-red-300 border-red-500/30",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    accent:  "bg-orange-500/10 text-orange-300 border-orange-500/30",
  };
  return <span className={cn("text-[10px] font-medium uppercase tracking-wider rounded border px-2 py-0.5", tones[tone], className)}>{children}</span>;
}

export function Button({ children, variant = "primary", className, ...rest }: { children: ReactNode; variant?: "primary" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white",
    ghost:   "bg-transparent border border-[var(--border)] text-zinc-200 hover:bg-zinc-800/40",
    danger:  "bg-red-500/90 hover:bg-red-500 text-white",
  };
  return <button className={cn("inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded transition-colors", variants[variant], className)} {...rest}>{children}</button>;
}

export function SourceBadge({ source, model }: { source: "mimo" | "corpus"; model?: string | null }) {
  if (source === "mimo") {
    return <Badge tone="accent" className="font-mono">live · {model?.replace("xiaomi/", "")}</Badge>;
  }
  return <Badge tone="default" className="font-mono">corpus mode</Badge>;
}

export function CategoryTag({ category }: { category: string }) {
  return <span className="text-[10px] mono text-zinc-400 bg-zinc-800/60 border border-zinc-700 rounded px-1.5 py-0.5">{category}</span>;
}
