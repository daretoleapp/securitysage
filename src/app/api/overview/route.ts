import { NextRequest, NextResponse } from "next/server";
import { corpusOverview, DEMO_KEYS } from "@/lib/demos";
import { callMimo, isMimoFallback } from "@/lib/mimo";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || DEMO_KEYS[0];
  const stats = corpusOverview(key);

  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;

  try {
    const r = await callMimo({
      tier: "pro",
      maxTokens: 80,
      messages: [
        { role: "system", content: "You score code security 0-100. Reply with only a number." },
        { role: "user", content: `Score security for repo ${key}. Findings: ${stats.vulnerabilities} vulns, ${stats.secrets} secrets, ${stats.outdatedDeps} outdated deps. Reply only with a single integer.` },
      ],
    });
    const n = parseInt(r.content.match(/\d+/)?.[0] || "", 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      stats.scoreOverall = n;
      source = "mimo";
      model = r.model;
    }
  } catch (err) {
    if (!isMimoFallback(err)) throw err;
  }

  return NextResponse.json({ stats, source, model, repo: key }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
