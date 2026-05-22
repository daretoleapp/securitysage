# SecuritySage

Code security AI powered by Xiaomi MiMo Pro and MiMo VL.

Point SecuritySage at a repository and it runs three scans in parallel:
SAST static analysis, secret detection, and dependency CVE matching. MiMo Pro
re-ranks findings by exploitability, summarizes the run for engineering
leadership, and MiMo VL reviews uploaded threat-model diagrams.

## Live demo

- App: <https://securitysage.vercel.app>
- Source: <https://github.com/daretoleapp/securitysage>

## What it does

| Page | Backed by | What it answers |
|------|-----------|-----------------|
| `/` Overview | MiMo Pro | Security score, finding trend, quick actions |
| `/scan` | MiMo Pro | Run a fresh scan, get exec summary |
| `/vulnerabilities` | MiMo Pro | SAST findings re-ranked by exploitability |
| `/secrets` | MiMo Pro | Leaked credentials with rotation guidance |
| `/dependencies` | MiMo Pro | CVE-flagged packages, MiMo upgrade priority |
| `/history` | local | Recent scan runs across repos |
| `/settings` | MiMo VL | Threat-model diagram critique (multimodal) |

## How MiMo is wired

`src/lib/mimo.ts` is a single OpenAI-compatible client targeting OpenRouter:

```ts
const r = await callMimo({
  tier: "pro",                       // or "vl" for multimodal
  responseFormat: "json_object",
  messages: [
    { role: "system", content: "You audit code security..." },
    { role: "user", content: "..." },
  ],
});
```

Two error classes describe failure modes:

- `MimoUnavailableError` — `OPENROUTER_API_KEY` is unset
- `MimoUpstreamError` — OpenRouter returned 4xx/5xx (rate limit, credit, etc.)

Every API route catches both and switches to a deterministic corpus fallback in
`src/lib/demos.ts` (heuristic ranking, hand-curated CVEs, threat-model
templates). The response always carries a `source` field and
`x-securitysage-source` header so reviewers can see which mode served the call:

```bash
curl -i 'https://YOUR_DEPLOY/api/vulnerabilities?key=shop-api' | head -10
# x-securitysage-source: mimo
# x-securitysage-model: xiaomi/mimo-v2.5-pro
```

## Tech

- Next.js 16 App Router (TypeScript, RSC where it helps)
- Tailwind CSS v4 with custom dark theme (orange accent for security focus)
- Recharts for visualizations
- Lucide for icons
- OpenRouter as the MiMo proxy

## Local dev

```bash
git clone https://github.com/daretoleapp/securitysage
cd securitysage
npm install
echo "OPENROUTER_API_KEY=sk-or-..." > .env.local
npm run dev
```

If you skip the env var the app still runs end-to-end — every page returns
corpus-mode results so you can demo the UX without burning credits.

## Configuration

| Env var | Default | Notes |
|---------|---------|-------|
| `OPENROUTER_API_KEY` | — | Required for live MiMo calls. |
| `MIMO_MODEL_PRO` | `xiaomi/mimo-v2.5-pro` | Reasoning model. |
| `MIMO_MODEL_VL` | `xiaomi/mimo-v2.5` | Multimodal model. |
| `MIMO_MAX_TOKENS_PRO` | `180` | Free-tier token cap. Tight prompts only. |
| `MIMO_MAX_TOKENS_VL` | `220` | Slightly larger for VL critique. |

## Deploy

Vercel out of the box. Push to GitHub, connect, set `OPENROUTER_API_KEY`, ship.

## License

MIT — see `LICENSE`.

## Acknowledgements

Built for the [Xiaomi MiMo Orbit](https://100t.xiaomimimo.com) grant program.
The four sample repos (shop-api, fintech-svc, admin-portal, mobile-bff) are
hand-curated to exercise the analysis surfaces; real repos work via the GitHub
integration on `/scan`.
