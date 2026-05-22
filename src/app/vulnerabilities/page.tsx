"use client";
import { useEffect, useState } from "react";
import { useSurface } from "@/components/surface-context";
import { Card, Section, Skeleton, Empty, SourceBadge, StatCard, Badge, CategoryTag } from "@/components/ui";
import type { Vulnerability } from "@/lib/types";
import { Bug } from "lucide-react";
import { severityColor } from "@/lib/utils";

interface Resp {
  findings: Vulnerability[];
  source: "mimo" | "corpus";
  model: string | null;
}

export default function VulnsPage() {
  const { surfaceKey } = useSurface();
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/vulnerabilities?key=${surfaceKey}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [surfaceKey]);

  const findings = data?.findings || [];
  const filtered = filter === "all" ? findings : findings.filter((f) => f.severity === filter);
  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Bug className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Vulnerabilities</h1>
            <p className="text-zinc-500 text-sm">SAST findings re-ranked by MiMo for exploitability and impact.</p>
          </div>
        </div>
        {data && <SourceBadge source={data.source} model={data.model} />}
      </div>

      {loading || !data ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button onClick={() => setFilter("all")} className={`text-left ${filter==="all"?"":""}`}>
              <StatCard label="All" value={findings.length} accent={filter==="all"} />
            </button>
            {(["critical","high","medium","low"] as const).map(sev => (
              <button key={sev} onClick={() => setFilter(sev)} className="text-left">
                <StatCard label={sev} value={counts[sev]} sub="" accent={filter===sev} />
              </button>
            ))}
          </div>

          <Section title={`${filtered.length} finding${filtered.length === 1 ? "" : "s"}`}>
            {filtered.length === 0 ? (
              <Empty title="No findings at this severity" />
            ) : (
              <div className="space-y-2">
                {filtered.map((f) => (
                  <Card key={f.id}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold uppercase rounded border px-2 py-0.5 ${severityColor(f.severity)}`}>{f.severity}</span>
                          <CategoryTag category={f.category} />
                          {f.cwe && <span className="text-[10px] mono text-zinc-500">{f.cwe}</span>}
                          {f.cvss !== undefined && <span className="text-[10px] mono text-orange-400">CVSS {f.cvss.toFixed(1)}</span>}
                        </div>
                        <div className="text-sm font-medium text-zinc-100">{f.title}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          <span className="mono">{f.file}:{f.line}</span>
                        </div>
                        <div className="text-sm text-zinc-300 mt-2">{f.description}</div>
                      </div>
                    </div>
                    <pre className="text-[11px] mono bg-zinc-950 border border-[var(--border)] rounded p-2.5 mt-3 overflow-x-auto text-zinc-300">
{f.snippet}
                    </pre>
                    <div className="text-sm text-zinc-300 mt-2 px-3 py-2 bg-zinc-900/60 rounded border border-[var(--border)]">
                      <span className="text-emerald-400 text-xs uppercase tracking-wider mr-2">FIX</span>
                      {f.recommendation}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
