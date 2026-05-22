"use client";
import { useEffect, useState } from "react";
import { useSurface } from "@/components/surface-context";
import { Card, Section, Skeleton, Empty, SourceBadge, Badge } from "@/components/ui";
import type { Dependency } from "@/lib/types";
import { Package } from "lucide-react";
import { severityColor } from "@/lib/utils";

interface Resp {
  deps: Dependency[];
  source: "mimo" | "corpus";
  model: string | null;
}

export default function DepsPage() {
  const { surfaceKey } = useSurface();
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dependencies?key=${surfaceKey}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [surfaceKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Dependencies</h1>
            <p className="text-zinc-500 text-sm">CVE feed cross-referenced with installed versions, MiMo-ranked by upgrade priority.</p>
          </div>
        </div>
        {data && <SourceBadge source={data.source} model={data.model} />}
      </div>

      {loading || !data ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : data.deps.length === 0 ? (
        <Empty title="No risky dependencies" sub="All packages are recent and free of known CVEs." />
      ) : (
        <Section title={`${data.deps.length} package${data.deps.length === 1 ? "" : "s"} flagged`}>
          <div className="space-y-2">
            {data.deps.map((d) => (
              <Card key={d.name}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-zinc-100">{d.name}</span>
                  <span className="text-xs text-zinc-500 mono">{d.version}</span>
                  <Badge tone="default" className="font-mono uppercase">{d.ecosystem}</Badge>
                  {d.outdated && <Badge tone="warning">outdated</Badge>}
                  {d.license && <span className="text-[10px] text-zinc-500 mono">{d.license}</span>}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">Risk</div>
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: d.riskScore + "%" }} />
                    </div>
                    <span className="text-xs font-mono text-orange-400 w-8 text-right">{d.riskScore}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {d.cves.map((cve) => (
                    <div key={cve.id} className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`text-[10px] font-bold uppercase rounded border px-1.5 py-0.5 ${severityColor(cve.severity)}`}>{cve.severity}</span>
                      <span className="font-mono text-zinc-200">{cve.id}</span>
                      <span className="text-zinc-400">{cve.summary}</span>
                      {cve.fixedIn && (
                        <span className="ml-auto text-[10px] mono text-emerald-400">→ {cve.fixedIn}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
