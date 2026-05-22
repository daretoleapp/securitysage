"use client";
import { useState, useRef } from "react";
import { Card, Section, Badge, Button, Skeleton, SourceBadge } from "@/components/ui";
import { Settings as SettingsIcon, Key, Code2, ExternalLink, Eye, Upload } from "lucide-react";

interface VLData {
  critique: { diagram: string; observations: string[]; risks: string[]; recommendations: string[] };
  source: "mimo" | "corpus";
  model: string | null;
}

export default function SettingsPage() {
  const [vlData, setVlData] = useState<VLData | null>(null);
  const [vlLoading, setVlLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setVlLoading(true);
      try {
        const r = await fetch("/api/critique", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, description: "threat model" }),
        });
        const j = await r.json();
        setVlData(j);
      } finally {
        setVlLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-zinc-500 text-sm">Models, integration verification, threat-model critique.</p>
        </div>
      </div>

      <Section title="MiMo models" sub="All inference routed through OpenRouter">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { tier: "Pro", model: "xiaomi/mimo-v2.5-pro", use: "SAST ranking, dep risk scoring, scan summaries", maxTokens: 180 },
            { tier: "VL", model: "xiaomi/mimo-v2.5", use: "Threat model diagram critique (multimodal)", maxTokens: 220 },
            { tier: "Flash", model: "xiaomi/mimo-v2.5-flash", use: "Lightweight scoring (reserved)", maxTokens: 80 },
          ].map((m) => (
            <Card key={m.tier}>
              <div className="flex items-center justify-between mb-2">
                <Badge tone="accent">{m.tier}</Badge>
                <span className="text-[10px] mono text-zinc-500">max {m.maxTokens}t</span>
              </div>
              <div className="font-mono text-sm text-orange-400 mb-2">{m.model}</div>
              <div className="text-xs text-zinc-400">{m.use}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Threat model critique" sub="Upload an architecture or threat-model diagram for MiMo VL review">
        <Card>
          {!imagePreview ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-strong)] rounded-lg p-8 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
              <div className="text-sm text-zinc-200">Drop a PNG/JPEG architecture or threat-model diagram</div>
              <div className="text-xs text-zinc-500 mt-1">Routed to xiaomi/mimo-v2.5 multimodal · max 5MB</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="diagram" className="w-full max-h-96 object-contain" />
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => { setImagePreview(null); setVlData(null); }}>Replace image</Button>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </Card>

        {vlLoading && <div className="space-y-3 mt-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>}

        {vlData && !vlLoading && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium">VL critique</h3>
              <SourceBadge source={vlData.source} model={vlData.model} />
            </div>
            <Card>
              <div className="text-[10px] uppercase tracking-wider text-purple-400 mb-2">Diagram reading</div>
              <div className="text-sm text-zinc-200">{vlData.critique.diagram}</div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                { title: "Observations", items: vlData.critique.observations, tone: "info" as const },
                { title: "Risks", items: vlData.critique.risks, tone: "danger" as const },
                { title: "Recommendations", items: vlData.critique.recommendations, tone: "success" as const },
              ]).map((g) => (
                <Card key={g.title}>
                  <div className="mb-2"><Badge tone={g.tone}>{g.title}</Badge></div>
                  <ul className="text-sm space-y-2 text-zinc-200">
                    {g.items.map((x, i) => <li key={i} className="flex gap-2"><span className="text-zinc-600">•</span>{x}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Configuration" sub="Server-side env vars (never sent to browser)">
        <Card>
          <div className="space-y-3 mono text-xs">
            {[
              ["OPENROUTER_API_KEY", "required"],
              ["MIMO_MODEL_PRO", "xiaomi/mimo-v2.5-pro"],
              ["MIMO_MODEL_VL", "xiaomi/mimo-v2.5"],
              ["MIMO_MAX_TOKENS_PRO", "180"],
              ["MIMO_MAX_TOKENS_VL", "220"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-zinc-300">{k}</span>
                {v === "required" ? <Badge tone="info">required</Badge> : <span className="text-zinc-500">{v}</span>}
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 mt-4 pt-4 border-t border-[var(--border)]">
            When OPENROUTER_API_KEY is unset or upstream errors, every endpoint falls back to a deterministic
            corpus mode and tags responses with x-securitysage-source: corpus. Live MiMo responses tag x-securitysage-source: mimo.
          </div>
        </Card>
      </Section>

      <Section title="Verify live MiMo" sub="The reviewer-facing signal">
        <Card>
          <div className="text-sm text-zinc-300 mb-3">
            Every API route returns a <code className="text-orange-400 mono">source</code> field and an
            <code className="text-orange-400 mono">x-securitysage-source</code> response header:
          </div>
          <pre className="text-xs mono bg-zinc-950 border border-[var(--border)] rounded p-3 overflow-x-auto text-zinc-200">
{`curl -i 'https://YOUR_DEPLOY/api/vulnerabilities?key=shop-api' | head -20

# Look for:
#   x-securitysage-source: mimo
#   x-securitysage-model: xiaomi/mimo-v2.5-pro
# in headers, and "source": "mimo" in JSON body.`}
          </pre>
        </Card>
      </Section>

      <Section title="Project">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-orange-400" />
              <a href="https://github.com/daretoleapp/securitysage" target="_blank" rel="noopener" className="hover:text-orange-400 flex items-center gap-1">
                github.com/daretoleapp/securitysage <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-orange-400" />
              <span className="text-zinc-400">License: MIT</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 mt-4 pt-4 border-t border-[var(--border)]">
            SecuritySage is a MiMo Pro + VL demo. Built for the Xiaomi MiMo Orbit grant program.
          </div>
        </Card>
      </Section>
    </div>
  );
}
