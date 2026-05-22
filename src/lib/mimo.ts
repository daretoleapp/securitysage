import { env } from "./env";

export class MimoUnavailableError extends Error {
  constructor() {
    super("OPENROUTER_API_KEY not configured");
    this.name = "MimoUnavailableError";
  }
}

export class MimoUpstreamError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`MiMo upstream error ${status}`);
    this.name = "MimoUpstreamError";
    this.status = status;
    this.body = body;
  }
}

export type MimoTier = "pro" | "vl";
export type MimoMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "user"; content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> };

interface CallOpts {
  tier?: MimoTier;
  messages: MimoMessage[];
  responseFormat?: "json_object" | "text";
  maxTokens?: number;
}

export async function callMimo(opts: CallOpts) {
  if (!env.isMimoAvailable()) throw new MimoUnavailableError();
  const tier = opts.tier ?? "pro";
  const model = tier === "vl" ? env.mimoModelVL() : env.mimoModelPro();
  const maxTokens = opts.maxTokens ?? (tier === "vl" ? env.mimoMaxTokensVL() : env.mimoMaxTokens());

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    max_tokens: maxTokens,
    temperature: 0.2,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openrouterKey()}`,
      "HTTP-Referer": "https://securitysage.vercel.app",
      "X-Title": "SecuritySage",
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new MimoUpstreamError(r.status, text);

  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new MimoUpstreamError(r.status, text); }
  const content = parsed.choices?.[0]?.message?.content ?? "";
  return { content, model, raw: parsed };
}

export function extractJson<T = unknown>(content: string): T | null {
  try { return JSON.parse(content) as T; } catch {}
  const m = content.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]) as T; } catch {}
  }
  return null;
}

export function isMimoFallback(err: unknown): boolean {
  return err instanceof MimoUnavailableError || err instanceof MimoUpstreamError;
}
