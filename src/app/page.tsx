"use client";
import { useEffect, useState } from "react";
import { useSurface } from "@/components/surface-context";
import { Card, Section, StatCard, Skeleton, SourceBadge, Badge, Empty } from "@/components/ui";
import type { OverviewStats } from "@/lib/types";
import { Shield, Bug, KeyRound, Package, ArrowUpRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { DEMO_REPOS } from "@/lib/demos";

interface OverviewResp {
  stats: OverviewStats;
  source: "mimo" | "corpus";
  model: string | null;
  repo: string;
}

export default function HomePage() {
  const { surfaceKey } = useSurface();
  const [data, setData] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(true);
  const repo = DEMO_REPOS.find(r => r.key === surfaceKey) ?? DEMO_REPOS[0];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/overview?key=${surfaceKey}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [surfaceKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Security overview</h1>
            <p className="text-zinc-500 text-sm">{repo.label} · {repo.stack} · {repo.loc.toLocaleString()} LOC · branch {repo.branch}</p>
          </div>
        </div>
        {data && <SourceBadge source={data.source} model={data.model} />}
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Security score" value={data.stats.scoreOverall} sub={data.stats.scoreOverall >= 80 ? "Healthy" : data.stats.scoreOverall >= 60 ? "Needs review" : "At risk"} accent />
            <StatCard label="Vulnerabilities" value={data.stats.vulnerabilities} sub="SAST findings" />
            <StatCard label="Leaked secrets" value={data.stats.secrets} sub="rotate immediately" />
            <StatCard label="Outdated deps" value={`${data.stats.outdatedDeps}/${data.stats.dependencies}`} sub="upgrade target" />
          </div>

          <Section title="14-day finding trend" sub="Critical, high, medium severity volume across recent scans">
            <Card>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={data.stats.trendDays}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 6, fontSize: 12 }}
                      cursor={{ stroke: "#3f3f46" }}
                    />
                    <Line type="monotone" dataKey="criticals" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
                    <Line type="monotone" dataKey="highs" stroke="#f97316" strokeWidth={2} dot={false} name="High" />
                    <Line type="monotone" dataKey="mediums" stroke="#f59e0b" strokeWidth={2} dot={false} name="Medium" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Section>

          <Section title="Quick actions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { href: "/scan", icon: Shield, label: "Run a scan", sub: "Trigger SAST + secret + dep scan" },
                { href: "/vulnerabilities", icon: Bug, label: "View findings", sub: "Severity-sorted, exploit-ranked" },
                { href: "/secrets", icon: KeyRound, label: "Audit secrets", sub: "Rotate leaked credentials" },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <Card className="hover:border-orange-500/40 transition-colors cursor-pointer h-full">
                    <div className="flex items-center justify-between mb-2">
                      <a.icon className="w-5 h-5 text-orange-400" />
                      <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="font-medium text-zinc-100">{a.label}</div>
                    <div className="text-xs text-zinc-500 mt-1">{a.sub}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </Section>

          {data.stats.scoreOverall < 70 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div className="flex-1">
                  <div className="text-sm text-amber-200">Security score below the 70 threshold</div>
                  <div className="text-xs text-amber-200/70 mt-0.5">Multiple findings need triage. Start with criticals on the Vulnerabilities page.</div>
                </div>
                <Link href="/vulnerabilities" className="text-xs text-amber-300 hover:text-amber-100 mono">view →</Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
