"use client";
import { useSurface } from "./surface-context";
import { DEMO_REPOS } from "@/lib/demos";
import { ChevronDown, GitBranch } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function SurfaceSelector() {
  const { surfaceKey, setSurfaceKey } = useSurface();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const repo = DEMO_REPOS.find((r) => r.key === surfaceKey) ?? DEMO_REPOS[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] hover:bg-zinc-800/40 text-sm transition-colors"
      >
        <GitBranch className="w-3.5 h-3.5 text-orange-400" />
        <span className="font-mono text-zinc-200">{repo.label}</span>
        <span className="text-[10px] text-zinc-500">@{repo.branch}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-xl z-20 overflow-hidden">
          {DEMO_REPOS.map((r) => (
            <button
              key={r.key}
              onClick={() => { setSurfaceKey(r.key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 hover:bg-zinc-800/40 transition-colors flex flex-col gap-0.5 ${r.key === surfaceKey ? "bg-orange-500/5" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-zinc-100">{r.label}</span>
                <span className="text-[10px] text-zinc-500 mono">@{r.branch}</span>
              </div>
              <div className="text-[11px] text-zinc-500">{r.stack} · {r.loc.toLocaleString()} LOC</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
