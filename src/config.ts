import { readFileSync, existsSync } from "node:fs";
import { dirname, join, isAbsolute } from "node:path";
import type { Config } from "./types.ts";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function resolveConfigPath(cwd: string, explicitPath?: string): string {
  if (explicitPath) return isAbsolute(explicitPath) ? explicitPath : join(cwd, explicitPath);
  if (process.env.SLOP2POST_CONFIG) return isAbsolute(process.env.SLOP2POST_CONFIG) ? process.env.SLOP2POST_CONFIG : join(cwd, process.env.SLOP2POST_CONFIG);
  return join(cwd, "slop-to-post.config.json");
}

export function loadConfig(explicitPath?: string, cwd = process.cwd()): Config {
  const path = resolveConfigPath(cwd, explicitPath);
  if (!existsSync(path)) {
    throw new ConfigError(`Config file not found: "${path}". Run "slop-to-post setup" or "slop-to-post init" first.`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    throw new ConfigError(`Invalid JSON in "${path}": ${err instanceof Error ? err.message : String(err)}`);
  }

  if (typeof raw !== "object" || raw === null) throw new ConfigError(`Config file "${path}" must be a JSON object.`);
  const c = raw as Record<string, unknown>;

  if (typeof c.ai !== "object" || c.ai === null) throw new ConfigError(`Config at "${path}" missing required object "ai".`);
  const ai = c.ai as Record<string, unknown>;

  const defaultProviderKey = (process.env.SLOP2POST_AI_DEFAULT || ai.default) as string;
  if (typeof defaultProviderKey !== "string" || !defaultProviderKey) {
    throw new ConfigError(`Config at "${path}" missing required string "ai.default".`);
  }

  if (typeof ai.providers !== "object" || ai.providers === null) throw new ConfigError(`Config at "${path}" missing required object "ai.providers".`);
  const providers = ai.providers as Record<string, unknown>;

  return {
    ai: { default: defaultProviderKey, providers: providers as Config["ai"]["providers"] },
    configDir: dirname(path),
  };
}
