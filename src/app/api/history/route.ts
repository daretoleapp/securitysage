import { NextResponse } from "next/server";
import { corpusHistory } from "@/lib/demos";

export async function GET() {
  const history = corpusHistory();
  const summary = {
    total: history.length,
    mimoCount: history.filter((h) => h.source === "mimo").length,
    corpusCount: history.filter((h) => h.source === "corpus").length,
    totalFindings: history.reduce((a, b) => a + b.totalFindings, 0),
  };
  return NextResponse.json({ history, summary });
}
