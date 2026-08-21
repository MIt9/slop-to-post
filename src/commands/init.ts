import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_CONFIG = {
  ai: {
    default: "claude",
    providers: {
      claude: {
        command: ["claude", "-p"],
        timeoutSec: 120,
      },
    },
  },
};

export const DEFAULT_DESLOP_PROMPT = `
You are an expert editor transforming AI-generated text or drafts into clean, authentic human writing.
- Detect the language of the input (Ukrainian, English, etc.) and keep the exact same language.
- Remove all sycophancy, throat-clearing openers, AI buzzwords, and artificial contrasts.
- Preserve the key factual content, ideas, and takeaways.
- Output ONLY the clean, rewritten text directly.
`;

export function initCommand(cwd: string, explicitPath?: string): void {
  const configPath = explicitPath ? (explicitPath.startsWith("/") ? explicitPath : join(cwd, explicitPath)) : join(cwd, "slop-to-post.config.json");
  if (existsSync(configPath)) {
    console.log(`Config file already exists at "${configPath}". Delete it or specify another directory.`);
    return;
  }

  const promptsDir = join(cwd, "prompts");
  mkdirSync(promptsDir, { recursive: true });

  writeFileSync(join(promptsDir, "deslop.txt"), DEFAULT_DESLOP_PROMPT.trim());
  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));

  console.log(`Scaffolded config at "${configPath}" and prompt in "${promptsDir}".`);
}
