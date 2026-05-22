"use client";
import { useEffect, useState } from "react";
import { useSurface } from "@/components/surface-context";
import { Card, Section, Skeleton, Empty, SourceBadge, Badge } from "@/components/ui";
import type { Secret } from "@/lib/types";
import { KeyRound, AlertTriangle } from "lucide-react";
import { severityColor } from "@/lib/utils";

interface Resp {
  findings: Secret[];
  summary: string;
  source: "mimo" | "corpus";
  model: string | null;
}

export default function SecretsPage() {
  const { surfaceKey } = useSurface();
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/secrets?key=${surfaceKey}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [surfaceKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Leaked secrets</h1>
            <p className="text-zinc-500 text-sm">High-confidence secret matches across the working tree and recent history.</p>
          </div>
        </div>
        {data && <SourceBadge source={data.source} model={data.model} />}
      </div>

      {loading || !data ? (
        <div className="space-y-3"><Skeleton className="h-24" />{[0,1,2].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <>
          {data.findings.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 mb-1">Risk summary</div>
                  <div className="text-sm text-amber-100">{data.summary}</div>
                </div>
              </div>
            </Card>
          )}

          <Section title={`${data.findings.length} secret${data.findings.length === 1 ? "" : "s"} detected`}>
            {data.findings.length === 0 ? (
              <Empty title="No secrets detected" sub="Working tree and 30 days of history are clean." />
            ) : (
              <div className="space-y-2">
                {data.findings.map((s, i) => (
                  <Card key={i}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase rounded border px-2 py-0.5 ${severityColor(s.severity)}`}>{s.severity}</span>
                      <Badge tone="default" className="font-mono">{s.type}</Badge>
                      <code className="text-xs mono text-zinc-200">{s.preview}</code>
                      <span className="ml-auto text-xs text-zinc-500 mono">{s.file}:{s.line}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Pattern matched</div>
                        <code className="mono text-zinc-300 bg-zinc-950 border border-[var(--border)] rounded px-2 py-1 inline-block break-all">{s.pattern}</code>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1">Remediation</div>
                        <div className="text-zinc-300">{s.recommendation}</div>
                      </div>
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
