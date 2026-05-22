import { NextRequest, NextResponse } from "next/server";
import { corpusVulns, DEMO_KEYS } from "@/lib/demos";
import { callMimo, extractJson, isMimoFallback } from "@/lib/mimo";
import type { Vulnerability } from "@/lib/types";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || DEMO_KEYS[0];
  let findings = corpusVulns[key] || [];
  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;

  try {
    const summary = findings.map((f) => ({ id: f.id, cat: f.category, sev: f.severity, file: f.file, line: f.line }));
    const r = await callMimo({
      tier: "pro",
      responseFormat: "json_object",
      maxTokens: 180,
      messages: [
        { role: "system", content: "You re-rank vulnerability findings by exploitability. Reply JSON: {\"order\":[id,id,...]}" },
        { role: "user", content: `Findings: ${JSON.stringify(summary)}. Reply with the IDs in priority order.` },
      ],
    });
    const j = extractJson<{ order: string[] }>(r.content);
    if (j?.order && Array.isArray(j.order)) {
      const idx = new Map(j.order.map((id, i) => [id, i]));
      findings = [...findings].sort((a, b) => (idx.get(a.id) ?? 999) - (idx.get(b.id) ?? 999));
      source = "mimo";
      model = r.model;
    }
  } catch (err) {
    if (!isMimoFallback(err)) throw err;
  }

  return NextResponse.json({ findings, source, model, repo: key }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
