import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function severityColor(s: string): string {
  switch (s) {
    case "critical": return "text-red-400 border-red-500/40 bg-red-500/10";
    case "high":     return "text-orange-400 border-orange-500/40 bg-orange-500/10";
    case "medium":   return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    case "low":      return "text-blue-400 border-blue-500/40 bg-blue-500/10";
    case "info":
    default:         return "text-zinc-400 border-zinc-600/40 bg-zinc-700/10";
  }
}

export function severityRank(s: string): number {
  return { critical: 5, high: 4, medium: 3, low: 2, info: 1 }[s] ?? 0;
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const days = Math.floor(h / 24);
  return days + "d ago";
}

export function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
