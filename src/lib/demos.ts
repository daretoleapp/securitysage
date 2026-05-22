import type { Vulnerability, Secret, Dependency, ScanRun, OverviewStats } from "./types";

export const DEMO_REPOS = [
  { key: "shop-api",     label: "shop-api",     stack: "Node.js / Express",     branch: "main",     loc: 12_400 },
  { key: "fintech-svc",  label: "fintech-svc",  stack: "Python / FastAPI",      branch: "main",     loc: 28_900 },
  { key: "admin-portal", label: "admin-portal", stack: "Next.js / TypeScript",  branch: "develop",  loc: 19_200 },
  { key: "mobile-bff",   label: "mobile-bff",   stack: "Go / Gin",              branch: "main",     loc: 8_300 },
];

export const DEMO_KEYS = DEMO_REPOS.map((r) => r.key);

export const corpusVulns: Record<string, Vulnerability[]> = {
  "shop-api": [
    {
      id: "CWE-89-001",
      title: "SQL injection in product search",
      description: "User-controlled query string interpolated directly into SQL.",
      severity: "critical",
      category: "SQL injection",
      file: "src/routes/products.js",
      line: 47,
      cwe: "CWE-89",
      cvss: 9.1,
      recommendation: "Use parameterized queries via prepared statements. Replace string concatenation with the driver's parameter binding.",
      snippet: "const sql = `SELECT * FROM products WHERE name LIKE '%${req.query.q}%'`;",
    },
    {
      id: "CWE-79-001",
      title: "Reflected XSS in checkout error page",
      description: "Error message rendered without HTML escaping.",
      severity: "high",
      category: "Cross-site scripting",
      file: "src/views/checkout-error.ejs",
      line: 12,
      cwe: "CWE-79",
      cvss: 7.4,
      recommendation: "Use the templating engine's auto-escape, or explicitly escape with a library like he.encode.",
      snippet: "<div class=\"err\"><%= req.query.msg %></div>",
    },
    {
      id: "CWE-352-001",
      title: "Missing CSRF protection on state-changing endpoints",
      description: "POST routes accept form submissions without verifying a CSRF token.",
      severity: "high",
      category: "CSRF",
      file: "src/middleware/auth.js",
      line: 8,
      cwe: "CWE-352",
      cvss: 7.0,
      recommendation: "Mount csurf middleware on all state-changing routes; verify token from header or hidden form field.",
      snippet: "app.post('/cart/add', requireAuth, addToCart);",
    },
    {
      id: "CWE-918-001",
      title: "SSRF in image proxy",
      description: "Image proxy fetches arbitrary user-supplied URLs without scheme/host allowlist.",
      severity: "high",
      category: "SSRF",
      file: "src/routes/proxy.js",
      line: 23,
      cwe: "CWE-918",
      cvss: 7.7,
      recommendation: "Validate scheme is http/https only; resolve hostname and reject private/loopback ranges (10/8, 172.16/12, 192.168/16, 127/8).",
      snippet: "const r = await fetch(req.query.url); res.send(await r.buffer());",
    },
    {
      id: "CWE-352-002",
      title: "JWT secret hardcoded as fallback",
      description: "JWT_SECRET defaults to a constant when env var missing.",
      severity: "medium",
      category: "Crypto",
      file: "src/auth/jwt.js",
      line: 4,
      cwe: "CWE-798",
      cvss: 5.9,
      recommendation: "Throw on startup if JWT_SECRET unset; never default to a constant. Rotate the constant immediately.",
      snippet: "const SECRET = process.env.JWT_SECRET || 'shop-api-dev-secret';",
    },
    {
      id: "CWE-209-001",
      title: "Stack traces leaked to clients",
      description: "Express default error handler returns full stack on 500.",
      severity: "low",
      category: "Information disclosure",
      file: "src/app.js",
      line: 92,
      cwe: "CWE-209",
      cvss: 3.7,
      recommendation: "Mount a custom error handler that logs the stack server-side and returns a generic 500 message in production.",
      snippet: "app.use((err, req, res, next) => res.status(500).send(err.stack));",
    },
  ],
  "fintech-svc": [
    {
      id: "CWE-639-001",
      title: "IDOR on /accounts/{id}/balance",
      description: "Endpoint reads any account by id without checking ownership.",
      severity: "critical",
      category: "AuthZ",
      file: "app/routes/accounts.py",
      line: 33,
      cwe: "CWE-639",
      cvss: 9.0,
      recommendation: "Verify request.user.id matches account.owner_id before returning. Add a unit test for cross-tenant access.",
      snippet: "return db.query(Account).filter(Account.id == account_id).first()",
    },
    {
      id: "CWE-307-001",
      title: "No rate limit on /auth/login",
      description: "Login endpoint accepts unlimited POSTs per IP, enabling credential stuffing.",
      severity: "high",
      category: "AuthN",
      file: "app/routes/auth.py",
      line: 12,
      cwe: "CWE-307",
      cvss: 7.3,
      recommendation: "Apply slowapi or fastapi-limiter at 5/minute per IP+username. Add CAPTCHA after 3 failures.",
      snippet: "@router.post('/login')\nasync def login(creds: Credentials):",
    },
    {
      id: "CWE-326-001",
      title: "MD5 used for password hashing",
      description: "Legacy code path hashes with md5() instead of bcrypt/argon2.",
      severity: "critical",
      category: "Crypto",
      file: "app/legacy/users.py",
      line: 78,
      cwe: "CWE-326",
      cvss: 9.4,
      recommendation: "Migrate to argon2-cffi or bcrypt. Force password reset for users still on legacy hash.",
      snippet: "h = hashlib.md5(password.encode()).hexdigest()",
    },
    {
      id: "CWE-22-001",
      title: "Path traversal in /export endpoint",
      description: "Filename param read from user is joined with base path without validation.",
      severity: "high",
      category: "Path traversal",
      file: "app/routes/export.py",
      line: 41,
      cwe: "CWE-22",
      cvss: 7.5,
      recommendation: "Reject filenames containing .. or absolute paths; resolve realpath and check it stays under the base dir.",
      snippet: "with open(os.path.join(EXPORT_DIR, request.args.get('f')), 'rb') as fh:",
    },
    {
      id: "CWE-501-001",
      title: "Trust boundary violation in webhook handler",
      description: "External webhook payload is unmarshalled and used without HMAC verification.",
      severity: "high",
      category: "Trust boundary",
      file: "app/routes/webhooks.py",
      line: 19,
      cwe: "CWE-501",
      cvss: 7.0,
      recommendation: "Verify provider HMAC signature against the raw body before parsing JSON.",
      snippet: "data = await request.json()\nawait process_webhook(data)",
    },
  ],
  "admin-portal": [
    {
      id: "CWE-1021-001",
      title: "Missing CSP header",
      description: "Pages serve no Content-Security-Policy, leaving inline script execution possible.",
      severity: "medium",
      category: "Headers",
      file: "next.config.ts",
      line: 1,
      cwe: "CWE-1021",
      cvss: 5.4,
      recommendation: "Add a CSP via headers() in next.config.ts: default-src 'self'; script-src 'self' 'nonce-…';",
      snippet: "// no headers() configured",
    },
    {
      id: "CWE-79-002",
      title: "dangerouslySetInnerHTML on user-controlled string",
      description: "Article body rendered with dangerouslySetInnerHTML without sanitization.",
      severity: "high",
      category: "Cross-site scripting",
      file: "src/components/article-body.tsx",
      line: 8,
      cwe: "CWE-79",
      cvss: 7.5,
      recommendation: "Pipe the HTML through DOMPurify.sanitize() before injecting; or render markdown via a safe library.",
      snippet: "<div dangerouslySetInnerHTML={{ __html: article.body }} />",
    },
    {
      id: "CWE-330-001",
      title: "Math.random() used for session id",
      description: "Predictable PRNG used to mint session identifiers.",
      severity: "high",
      category: "Crypto",
      file: "src/lib/session.ts",
      line: 3,
      cwe: "CWE-330",
      cvss: 7.0,
      recommendation: "Use crypto.randomBytes(32).toString('hex') instead of Math.random().",
      snippet: "const id = Math.random().toString(36).slice(2);",
    },
  ],
  "mobile-bff": [
    {
      id: "CWE-732-001",
      title: "World-writable cache directory",
      description: "MkdirAll uses 0777 permissions on /var/cache/mobile-bff.",
      severity: "medium",
      category: "Permissions",
      file: "internal/cache/init.go",
      line: 17,
      cwe: "CWE-732",
      cvss: 5.5,
      recommendation: "Use 0750 or 0700; cache should not be writable by other users.",
      snippet: "os.MkdirAll(\"/var/cache/mobile-bff\", 0777)",
    },
    {
      id: "CWE-295-001",
      title: "TLS verification disabled in HTTP client",
      description: "InsecureSkipVerify set to true in default http.Client config.",
      severity: "high",
      category: "TLS",
      file: "internal/http/client.go",
      line: 22,
      cwe: "CWE-295",
      cvss: 7.4,
      recommendation: "Remove InsecureSkipVerify in production. If self-signed cert, pin via RootCAs instead.",
      snippet: "TLSClientConfig: &tls.Config{InsecureSkipVerify: true},",
    },
  ],
};

export const corpusSecrets: Record<string, Secret[]> = {
  "shop-api": [
    { type: "aws_access_key", file: ".env.example", line: 4, pattern: "AKIA[0-9A-Z]{16}", preview: "AKIA****ZQXY", severity: "high",
      recommendation: "Rotate immediately, move to AWS Secrets Manager, scrub git history with git-filter-repo." },
    { type: "stripe_live_key", file: "config/payment.js", line: 12, pattern: "sk_live_[0-9a-zA-Z]{24,}", preview: "sk_live_****2zQ", severity: "critical",
      recommendation: "Revoke key in Stripe dashboard, rotate, ensure secrets never live in source. Audit git history." },
  ],
  "fintech-svc": [
    { type: "openai_api_key", file: "scripts/seed.py", line: 7, pattern: "sk-[A-Za-z0-9]{32,}", preview: "sk-****3hKL", severity: "high",
      recommendation: "Revoke at platform.openai.com, never commit; load from env or secret manager." },
    { type: "private_rsa_key", file: "deploy/keys/legacy.pem", line: 1, pattern: "BEGIN RSA PRIVATE KEY", preview: "-----BEGIN RSA…", severity: "critical",
      recommendation: "Treat key as compromised, rotate, remove from repo. Audit who pulled the repo since commit." },
  ],
  "admin-portal": [
    { type: "github_pat", file: ".env.local", line: 3, pattern: "ghp_[A-Za-z0-9]{36}", preview: "ghp_****8sNz", severity: "high",
      recommendation: "Revoke token at github.com/settings/tokens, scope new token narrowly, never commit .env.local." },
  ],
  "mobile-bff": [
    { type: "slack_webhook", file: "internal/notify/slack.go", line: 9, pattern: "https://hooks.slack.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[A-Za-z0-9]+", preview: "hooks.slack.com/services/****", severity: "medium",
      recommendation: "Rotate webhook URL, store in env, restrict by channel." },
  ],
};

export const corpusDeps: Record<string, Dependency[]> = {
  "shop-api": [
    { name: "express", version: "4.16.2", ecosystem: "npm",
      cves: [{ id: "CVE-2022-24999", severity: "high", summary: "qs prototype pollution via __proto__", fixedIn: "4.17.3" }],
      outdated: true, license: "MIT", riskScore: 72 },
    { name: "lodash", version: "4.17.10", ecosystem: "npm",
      cves: [
        { id: "CVE-2019-10744", severity: "high", summary: "Prototype pollution in defaultsDeep", fixedIn: "4.17.12" },
        { id: "CVE-2020-8203", severity: "high", summary: "Prototype pollution in zipObjectDeep", fixedIn: "4.17.20" },
      ],
      outdated: true, license: "MIT", riskScore: 81 },
    { name: "jsonwebtoken", version: "8.5.1", ecosystem: "npm",
      cves: [{ id: "CVE-2022-23529", severity: "high", summary: "JWT verify accepts non-string secret", fixedIn: "9.0.0" }],
      outdated: true, license: "MIT", riskScore: 69 },
  ],
  "fintech-svc": [
    { name: "fastapi", version: "0.95.0", ecosystem: "pypi",
      cves: [{ id: "CVE-2024-24762", severity: "medium", summary: "ReDoS in form parser", fixedIn: "0.109.1" }],
      outdated: true, license: "MIT", riskScore: 54 },
    { name: "pyyaml", version: "5.3.1", ecosystem: "pypi",
      cves: [{ id: "CVE-2020-14343", severity: "critical", summary: "Arbitrary code execution via yaml.load", fixedIn: "5.4" }],
      outdated: true, license: "MIT", riskScore: 92 },
    { name: "pillow", version: "9.1.0", ecosystem: "pypi",
      cves: [
        { id: "CVE-2022-30595", severity: "high", summary: "Heap buffer overflow in HighwayHash", fixedIn: "9.2.0" },
        { id: "CVE-2023-44271", severity: "medium", summary: "ImageDraw bypass", fixedIn: "10.0.1" },
      ],
      outdated: true, license: "PIL", riskScore: 76 },
  ],
  "admin-portal": [
    { name: "next", version: "13.4.0", ecosystem: "npm",
      cves: [{ id: "CVE-2024-34351", severity: "high", summary: "SSRF in Server Actions middleware", fixedIn: "13.5.4" }],
      outdated: true, license: "MIT", riskScore: 70 },
    { name: "axios", version: "1.6.0", ecosystem: "npm",
      cves: [{ id: "CVE-2024-39338", severity: "medium", summary: "SSRF via path-relative URL", fixedIn: "1.7.4" }],
      outdated: true, license: "MIT", riskScore: 58 },
  ],
  "mobile-bff": [
    { name: "github.com/gin-gonic/gin", version: "1.7.0", ecosystem: "go",
      cves: [{ id: "CVE-2023-29401", severity: "medium", summary: "Filename parameter not properly escaped", fixedIn: "1.9.1" }],
      outdated: true, license: "MIT", riskScore: 51 },
  ],
};

export function corpusOverview(key: string): OverviewStats {
  const v = corpusVulns[key] || [];
  const s = corpusSecrets[key] || [];
  const d = corpusDeps[key] || [];
  const findings = v.length + s.length + d.reduce((a, b) => a + b.cves.length, 0);
  const score = Math.max(20, 100 - findings * 6);

  const days: OverviewStats["trendDays"] = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000);
    days.push({
      day: dt.toISOString().slice(5, 10),
      criticals: Math.max(0, Math.round(v.filter(x => x.severity === "critical").length * (1 + Math.sin(i / 2.1) * 0.3))),
      highs:     Math.max(0, Math.round(v.filter(x => x.severity === "high").length     * (1 + Math.cos(i / 1.7) * 0.4))),
      mediums:   Math.max(0, Math.round(v.filter(x => x.severity === "medium").length   * (1 + Math.sin(i / 1.3) * 0.3))),
    });
  }
  return {
    scoreOverall: score,
    vulnerabilities: v.length,
    secrets: s.length,
    dependencies: d.length,
    outdatedDeps: d.filter((x) => x.outdated).length,
    trendDays: days,
  };
}

export function corpusHistory(): ScanRun[] {
  const repos = Object.keys(corpusVulns);
  const runs: ScanRun[] = [];
  for (let i = 0; i < 12; i++) {
    const repo = repos[i % repos.length];
    const v = corpusVulns[repo] || [];
    const s = corpusSecrets[repo] || [];
    const d = corpusDeps[repo] || [];
    const total = v.length + s.length + d.reduce((a, b) => a + b.cves.length, 0);
    runs.push({
      id: `scan-${1000 + i}`,
      date: new Date(Date.now() - i * 6 * 3600 * 1000).toISOString(),
      repo,
      branch: i % 3 === 0 ? "develop" : "main",
      totalFindings: total,
      bySeverity: {
        critical: v.filter((x) => x.severity === "critical").length,
        high:     v.filter((x) => x.severity === "high").length + d.flatMap(x => x.cves).filter(c => c.severity === "high").length,
        medium:   v.filter((x) => x.severity === "medium").length + d.flatMap(x => x.cves).filter(c => c.severity === "medium").length,
        low:      v.filter((x) => x.severity === "low").length,
        info:     0,
      },
      source: i % 4 === 0 ? "mimo" : "corpus",
      model:  i % 4 === 0 ? "xiaomi/mimo-v2.5-pro" : undefined,
      durationMs: 800 + Math.floor(Math.random() * 4200),
    });
  }
  return runs;
}

export function corpusThreatModel(repoTitle: string) {
  return {
    diagram: `Three-tier architecture: client → API gateway → service tier → datastore. ${repoTitle} sits in the service tier with one external dependency (payment provider).`,
    observations: [
      "Trust zones not annotated; control plane and data plane both pass through the same gateway.",
      "Datastore credentials read from env at boot; no secret rotation cadence shown.",
      "External payment dependency communicates over outbound TLS, no mTLS or pinning indicated.",
    ],
    risks: [
      "Single gateway entry point becomes a SPOF and a fat target for credential stuffing or DDoS.",
      "Service-to-DB connection pools share one role; lateral movement risk if any service is compromised.",
      "No mention of audit log destination; tampering of in-host logs is undetectable.",
    ],
    recommendations: [
      "Split gateway into public-edge and internal-API ingress; rate limit the edge layer aggressively.",
      "Issue per-service DB roles with least-privilege grants; rotate via short-lived tokens.",
      "Stream audit logs to an append-only sink (e.g. immutable bucket or SIEM) outside the application VPC.",
    ],
  };
}
