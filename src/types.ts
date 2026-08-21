export interface ProviderConfig {
  command: string | string[];
  timeoutSec: number;
  stdin?: boolean;
}

export interface Config {
  ai: { default: string; providers: Record<string, ProviderConfig> };
  configDir: string;
}

export interface ProviderResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

export interface SlopMatch {
  rule: string;
  match: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface SlopDetectionResult {
  slopScore: number; // 0 (clean) to 100 (heavy slop)
  isSlop: boolean;
  matches: SlopMatch[];
  summary: string;
}

export interface ModifyOptions {
  textInput: string;
  maxWords?: number;
  jsonOutput?: boolean;
  outFile?: string;
}

export interface DetectOptions {
  textInput: string;
  jsonOutput?: boolean;
}
