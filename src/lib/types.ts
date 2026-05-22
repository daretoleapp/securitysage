export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: string;          // CVE-2024-..., CWE-89, etc
  title: string;
  description: string;
  severity: Severity;
  category: string;    // SQLi, XSS, SSRF, RCE, AuthZ, AuthN, Crypto, Path, Deserialization
  file: string;
  line: number;
  cwe?: string;
  cvss?: number;       // 0-10
  recommendation: string;
  snippet: string;
}

export interface Secret {
  type: string;        // aws_access_key, github_pat, slack_token, openai_key, etc.
  file: string;
  line: number;
  pattern: string;     // regex pattern matched
  preview: string;     // redacted preview "AKIA****XYZ"
  severity: Severity;
  recommendation: string;
}

export interface Dependency {
  name: string;
  version: string;
  ecosystem: "npm" | "pypi" | "go" | "rubygems" | "maven";
  cves: Array<{ id: string; severity: Severity; summary: string; fixedIn?: string }>;
  outdated: boolean;
  license?: string;
  riskScore: number;   // 0-100
}

export interface ScanRun {
  id: string;
  date: string;
  repo: string;
  branch: string;
  totalFindings: number;
  bySeverity: Record<Severity, number>;
  source: "mimo" | "corpus";
  model?: string;
  durationMs: number;
}

export interface ThreatModelCritique {
  diagram: string;
  observations: string[];
  risks: string[];
  recommendations: string[];
}

export interface OverviewStats {
  scoreOverall: number;       // 0-100
  vulnerabilities: number;
  secrets: number;
  dependencies: number;
  outdatedDeps: number;
  trendDays: Array<{ day: string; criticals: number; highs: number; mediums: number }>;
}
