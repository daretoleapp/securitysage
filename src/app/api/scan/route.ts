import { NextRequest, NextResponse } from "next/server";
import { corpusVulns, corpusSecrets, corpusDeps, DEMO_KEYS, DEMO_REPOS } from "@/lib/demos";
import { callMimo, isMimoFallback } from "@/lib/mimo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key || DEMO_KEYS[0];
  const repo = DEMO_REPOS.find((r) => r.key === key);
  const v = corpusVulns[key] || [];
  const s = corpusSecrets[key] || [];
  const d = corpusDeps[key] || [];

  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;
  let blurb: string;

  try {
    const r = await callMimo({
      tier: "pro",
      maxTokens: 140,
      messages: [
        { role: "system", content: "Write a 2-sentence executive summary of a code security scan. Tone: senior security engineer, terse, factual." },
        { role: "user", content: `Repo ${repo?.label} (${repo?.stack}, ${repo?.loc} LOC). ${v.length} vulns (${v.filter(x=>x.severity==="critical").length} critical), ${s.length} secrets, ${d.length} risky deps.` },
      ],
    });
    blurb = r.content.trim();
    source = "mimo";
    model = r.model;
  } catch (err) {
    if (!isMimoFallback(err)) throw err;
    const crit = v.filter((x) => x.severity === "critical").length;
    blurb = crit > 0
      ? `${repo?.label} carries ${crit} critical issue${crit > 1 ? "s" : ""} on ${repo?.stack}. Block the merge and rotate any secrets before merging.`
      : `${repo?.label} scan completed: ${v.length + s.length + d.length} findings across SAST, secrets, and dependencies. Triage by severity.`;
  }

  const totalFindings = v.length + s.length + d.reduce((a, b) => a + b.cves.length, 0);
  const bySeverity = {
    critical: v.filter((x) => x.severity === "critical").length,
    high:     v.filter((x) => x.severity === "high").length + d.flatMap(x => x.cves).filter(c => c.severity === "high").length,
    medium:   v.filter((x) => x.severity === "medium").length + d.flatMap(x => x.cves).filter(c => c.severity === "medium").length,
    low:      v.filter((x) => x.severity === "low").length,
    info:     0,
  };

  return NextResponse.json({
    scan: {
      id: `scan-${Date.now()}`,
      date: new Date().toISOString(),
      repo: key,
      branch: repo?.branch ?? "main",
      stack: repo?.stack,
      loc: repo?.loc,
      totalFindings,
      bySeverity,
      durationMs: 1200 + Math.floor(Math.random() * 2400),
    },
    blurb,
    source,
    model,
  }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
