import type { ProviderConfig, ProviderResult } from "./types.ts";

export async function runProvider(
  provider: ProviderConfig,
  input: { textInput: string; prompt: string },
): Promise<ProviderResult> {
  const base = Array.isArray(provider.command) ? provider.command : provider.command.split(" ");
  const fullPrompt = `${input.prompt}\n\nSOURCE TEXT:\n${input.textInput}`;

  const argv = provider.stdin ? [...base] : [...base, fullPrompt];

  const proc = Bun.spawn(argv, {
    stdin: provider.stdin ? "pipe" : undefined,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      SLOP2POST_SOURCE_TEXT: input.textInput,
      SLOP2POST_PROMPT: input.prompt,
    },
  });

  if (provider.stdin) {
    proc.stdin.write(fullPrompt);
    proc.stdin.end();
  }

  const timeoutMs = (provider.timeoutSec || 120) * 1000;
  let timer!: ReturnType<typeof setTimeout>;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });

  const outcome = await Promise.race([proc.exited, timeout]);
  clearTimeout(timer);

  if (outcome === "timeout") {
    proc.kill();
    return { ok: false, stdout: "", stderr: `timeout after ${provider.timeoutSec}s` };
  }

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  return { ok: proc.exitCode === 0, stdout, stderr };
}
