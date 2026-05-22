"use client";
import { useEffect, useState } from "react";
import { Card, Section, Skeleton, Empty, StatCard, Badge } from "@/components/ui";
import type { ScanRun } from "@/lib/types";
import { History as HistoryIcon } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Resp {
  history: ScanRun[];
  summary: { total: number; mimoCount: number; corpusCount: number; totalFindings: number };
}

export default function HistoryPage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/history").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Scan history</h1>
          <p className="text-zinc-500 text-sm">Recent runs across all repos.</p>
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-3"><div className="grid grid-cols-4 gap-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>{[0,1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Scans" value={data.summary.total} accent />
            <StatCard label="Live MiMo" value={data.summary.mimoCount} sub={`${Math.round(data.summary.mimoCount / Math.max(1, data.summary.total) * 100)}%`} />
            <StatCard label="Corpus" value={data.summary.corpusCount} sub="fallback" />
            <StatCard label="Total findings" value={data.summary.totalFindings} />
          </div>

          <Section title="Recent scans">
            {data.history.length === 0 ? (
              <Empty title="No scans yet" />
            ) : (
              <div className="space-y-2">
                {data.history.map((h) => (
                  <Card key={h.id} className="flex items-center gap-3 py-3 flex-wrap">
                    <span className="font-mono text-xs text-zinc-100 w-24 shrink-0">{h.repo}</span>
                    <span className="text-xs text-zinc-500 mono">@{h.branch}</span>
                    <Badge tone="default">{h.totalFindings} findings</Badge>
                    {h.bySeverity.critical > 0 && <Badge tone="danger">{h.bySeverity.critical}C</Badge>}
                    {h.bySeverity.high > 0 && <Badge tone="warning">{h.bySeverity.high}H</Badge>}
                    {h.bySeverity.medium > 0 && <Badge tone="info">{h.bySeverity.medium}M</Badge>}
                    <span className="ml-auto text-xs text-zinc-500 mono">{(h.durationMs / 1000).toFixed(1)}s</span>
                    <span className="text-[10px] text-zinc-500 mono w-16 text-right">{timeAgo(h.date)}</span>
                    {h.source === "mimo" ? (
                      <Badge tone="accent" className="font-mono">live · {h.model?.replace("xiaomi/", "")}</Badge>
                    ) : (
                      <Badge tone="default">corpus</Badge>
                    )}
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
