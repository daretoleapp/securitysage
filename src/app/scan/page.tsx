"use client";
import { useState } from "react";
import { useSurface } from "@/components/surface-context";
import { DEMO_REPOS } from "@/lib/demos";
import { Card, Section, Button, Badge, Skeleton, StatCard, SourceBadge } from "@/components/ui";
import { ScanSearch, Loader2, Bug, KeyRound, Package, Clock } from "lucide-react";

interface ScanResp {
  scan: {
    id: string;
    date: string;
    repo: string;
    branch: string;
    stack: string;
    loc: number;
    totalFindings: number;
    bySeverity: Record<string, number>;
    durationMs: number;
  };
  blurb: string;
  source: "mimo" | "corpus";
  model: string | null;
}

export default function ScanPage() {
  const { surfaceKey } = useSurface();
  const repo = DEMO_REPOS.find((r) => r.key === surfaceKey) ?? DEMO_REPOS[0];
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScanResp | null>(null);

  async function runScan() {
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: surfaceKey }) });
      const j = await r.json();
      setResult(j);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <ScanSearch className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Run scan</h1>
          <p className="text-zinc-500 text-sm">SAST + secret detection + dependency CVE check, summarized by MiMo.</p>
        </div>
      </div>

      <Section title="Target">
        <Card>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-mono text-zinc-100">{repo.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{repo.stack} · {repo.loc.toLocaleString()} LOC · branch <span className="mono">{repo.branch}</span></div>
            </div>
            <Button onClick={runScan} disabled={running}>
              {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</> : <><ScanSearch className="w-4 h-4" /> Run scan</>}
            </Button>
          </div>
          <div className="mt-3 text-xs text-zinc-500 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5"><Bug className="w-3 h-3" /> Static analysis (Semgrep-style rules)</div>
            <div className="flex items-center gap-1.5"><KeyRound className="w-3 h-3" /> Secret detection (40+ patterns)</div>
            <div className="flex items-center gap-1.5"><Package className="w-3 h-3" /> Dependency CVE feed</div>
          </div>
        </Card>
      </Section>

      {running && (
        <Section title="In progress">
          <div className="space-y-3">
            {["Cloning branch", "Parsing AST", "Running SAST rules", "Scanning for secrets", "Checking dependency CVEs", "Routing to MiMo Pro"].map((step, i) => (
              <Card key={i} className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span className="text-sm text-zinc-300">{step}…</span>
                <span className="ml-auto text-[10px] text-zinc-500 mono">{Math.floor(Math.random() * 800 + 100)}ms</span>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {result && (
        <>
          <Section title="Scan complete" action={<SourceBadge source={result.source} model={result.model} />}>
            <Card className="border-orange-500/30 bg-orange-500/5">
              <div className="text-xs uppercase tracking-wider text-orange-400 mb-2">Executive summary</div>
              <div className="text-sm text-zinc-100">{result.blurb}</div>
            </Card>
          </Section>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total" value={result.scan.totalFindings} accent />
            <StatCard label="Critical" value={result.scan.bySeverity.critical || 0} sub="" />
            <StatCard label="High" value={result.scan.bySeverity.high || 0} sub="" />
            <StatCard label="Medium" value={result.scan.bySeverity.medium || 0} sub="" />
            <StatCard label="Low" value={result.scan.bySeverity.low || 0} sub="" />
          </div>

          <Section title="Run details">
            <Card>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">Scan ID</dt>
                  <dd className="font-mono text-zinc-200 mt-0.5">{result.scan.id}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">Branch</dt>
                  <dd className="font-mono text-zinc-200 mt-0.5">{result.scan.branch}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">Stack</dt>
                  <dd className="text-zinc-200 mt-0.5">{result.scan.stack}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">Duration</dt>
                  <dd className="font-mono text-zinc-200 mt-0.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-500" />{(result.scan.durationMs / 1000).toFixed(2)}s</dd>
                </div>
              </dl>
            </Card>
          </Section>
        </>
      )}
    </div>
  );
}
