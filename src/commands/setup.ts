import { createInterface } from "node:readline";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONFIG, DEFAULT_DESLOP_PROMPT } from "./init.ts";

export interface WizardIO {
  ask(question: string, defaultValue?: string): Promise<string>;
  close(): void;
}

export function createStdioWizardIO(): WizardIO {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return {
    ask(question: string, defaultValue?: string): Promise<string> {
      const promptText = defaultValue !== undefined ? `${question} [${defaultValue}]: ` : `${question}: `;
      return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
          const trimmed = answer.trim();
          resolve(trimmed.length > 0 ? trimmed : (defaultValue ?? ""));
        });
      });
    },
    close() {
      rl.close();
    },
  };
}

export async function runSetupWizard(cwd: string, io: WizardIO, explicitPath?: string): Promise<void> {
  const configPath = explicitPath ? (explicitPath.startsWith("/") ? explicitPath : join(cwd, explicitPath)) : join(cwd, "slop-to-post.config.json");

  console.log("=== slop-to-post Interactive Setup Wizard ===");

  if (existsSync(configPath)) {
    const overwrite = await io.ask(`Config file "${configPath}" already exists. Overwrite? (y/N)`, "n");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      return;
    }
  }

  const aiCmd = await io.ask("Enter AI CLI command prefix", "claude -p");

  const config = {
    ...DEFAULT_CONFIG,
    ai: {
      default: "default_provider",
      providers: {
        default_provider: {
          command: aiCmd,
          timeoutSec: 120,
        },
      },
    },
  };

  const promptsDir = join(cwd, "prompts");
  mkdirSync(promptsDir, { recursive: true });
  writeFileSync(join(promptsDir, "deslop.txt"), DEFAULT_DESLOP_PROMPT.trim());
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✅ Setup complete! Created config at "${configPath}".`);
}
