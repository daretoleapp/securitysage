import { NextRequest, NextResponse } from "next/server";
import { corpusThreatModel } from "@/lib/demos";
import { callMimo, extractJson, isMimoFallback } from "@/lib/mimo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const dataUrl: string = body.dataUrl || "";
  const description: string = body.description || "Architecture diagram";

  let source: "mimo" | "corpus" = "corpus";
  let model: string | null = null;
  let critique = corpusThreatModel(description);

  if (dataUrl.startsWith("data:image/")) {
    try {
      const r = await callMimo({
        tier: "vl",
        responseFormat: "json_object",
        maxTokens: 220,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Critique this threat model diagram. Reply JSON: {"diagram":"...","observations":[..],"risks":[..],"recommendations":[..]}. 3 items per list, terse.` },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      const j = extractJson<typeof critique>(r.content);
      if (j?.diagram && j?.risks) {
        critique = j;
        source = "mimo";
        model = r.model;
      }
    } catch (err) {
      if (!isMimoFallback(err)) throw err;
    }
  }

  return NextResponse.json({ critique, source, model }, {
    headers: { "x-securitysage-source": source, ...(model ? { "x-securitysage-model": model } : {}) },
  });
}
