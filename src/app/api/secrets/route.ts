import { NextRequest, NextResponse } from "next/server";
import { corpusSecrets, DEMO_KEYS } from "@/lib/demos";
import { callMimo, isMimoFallback } from "@/lib/mimo";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || DEMO_KEYS[0];
  const findings = corpusSecrets[key] || [];

  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;
  let summary: string | null = null;

  try {
    if (findings.length > 0) {
      const r = await callMimo({
        tier: "pro",
        maxTokens: 120,
        messages: [
          { role: "system", content: "Summarize secret-leak risk in 2 short sentences. Mention rotation urgency." },
          { role: "user", content: `Secrets: ${JSON.stringify(findings.map(s => ({ type: s.type, severity: s.severity })))}` },
        ],
      });
      summary = r.content.trim();
      source = "mimo";
      model = r.model;
    }
  } catch (err) {
    if (!isMimoFallback(err)) throw err;
  }

  if (!summary) {
    const crit = findings.filter((s) => s.severity === "critical").length;
    summary = crit > 0
      ? `${crit} critical secret${crit > 1 ? "s" : ""} require immediate rotation; treat repo as compromised.`
      : `${findings.length} secret${findings.length === 1 ? "" : "s"} found. Rotate and migrate to secret manager.`;
  }

  return NextResponse.json({ findings, summary, source, model, repo: key }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
