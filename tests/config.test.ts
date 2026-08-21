import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig, ConfigError } from "../src/config.ts";

let cwd: string;
afterEach(() => rmSync(cwd, { recursive: true, force: true }));

test("loadConfig throws ConfigError when file is missing", () => {
  cwd = mkdtempSync(join(tmpdir(), "s2p-test-"));
  expect(() => loadConfig(undefined, cwd)).toThrow(ConfigError);
});

test("loadConfig parses valid config file", () => {
  cwd = mkdtempSync(join(tmpdir(), "s2p-test-"));
  const configContent = {
    ai: { default: "mock", providers: { mock: { command: "echo test", timeoutSec: 10 } } },
  };
  writeFileSync(join(cwd, "slop-to-post.config.json"), JSON.stringify(configContent));

  const config = loadConfig(undefined, cwd);
  expect(config.ai.default).toBe("mock");
});
