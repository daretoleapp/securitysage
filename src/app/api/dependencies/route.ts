import { NextRequest, NextResponse } from "next/server";
import { corpusDeps, DEMO_KEYS } from "@/lib/demos";
import { callMimo, extractJson, isMimoFallback } from "@/lib/mimo";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || DEMO_KEYS[0];
  let deps = corpusDeps[key] || [];

  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;

  try {
    const r = await callMimo({
      tier: "pro",
      responseFormat: "json_object",
      maxTokens: 180,
      messages: [
        { role: "system", content: "Re-score dependency upgrade priority 0-100. Reply JSON: {\"scores\": {\"name\": int}}" },
        { role: "user", content: `Deps: ${JSON.stringify(deps.map(d => ({ name: d.name, ver: d.version, cves: d.cves.length, severities: d.cves.map(c => c.severity) })))}` },
      ],
    });
    const j = extractJson<{ scores: Record<string, number> }>(r.content);
    if (j?.scores) {
      deps = deps.map((d) => ({ ...d, riskScore: j.scores[d.name] ?? d.riskScore }));
      deps = [...deps].sort((a, b) => b.riskScore - a.riskScore);
      source = "mimo";
      model = r.model;
    }
  } catch (err) {
    if (!isMimoFallback(err)) throw err;
  }

  return NextResponse.json({ deps, source, model, repo: key }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
