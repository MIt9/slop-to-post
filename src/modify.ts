import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Config, ModifyOptions } from "./types.ts";
import { runProvider } from "./ai.ts";
import { appendDeSlopInstructions, sanitizeText } from "./antislop.ts";
import { detectSlop } from "./detector.ts";

export async function modifySlopText(
  config: Config,
  options: ModifyOptions,
): Promise<{ originalText: string; cleanText: string; beforeSlopScore: number; afterSlopScore: number; outputText: string }> {
  let textInput = options.textInput.trim();
  if (existsSync(textInput)) {
    textInput = readFileSync(textInput, "utf-8").trim();
  }

  if (!textInput) {
    throw new Error("Source text is empty.");
  }

  const beforeDetection = detectSlop(textInput);
  const providerKey = config.ai.default;
  const provider = config.ai.providers[providerKey];
  if (!provider) {
    throw new Error(`Unknown AI provider: "${providerKey}". Available: ${Object.keys(config.ai.providers).join(", ")}`);
  }

  const promptFilePath = join(config.configDir, "prompts/deslop.txt");
  const rawPrompt = existsSync(promptFilePath) ? readFileSync(promptFilePath, "utf-8") : "Rewrite this text to eliminate AI slop, fluff, and sycophancy. Make it natural, direct, and human.";
  const prompt = appendDeSlopInstructions(rawPrompt, options.maxWords);

  const result = await runProvider(provider, { textInput, prompt });
  if (!result.ok) {
    throw new Error(result.stderr.trim() || "AI provider exited with a non-zero status");
  }

  const cleanText = sanitizeText(result.stdout.trim(), options.maxWords);
  const afterDetection = detectSlop(cleanText);

  let outputText = "";
  if (options.jsonOutput) {
    outputText = JSON.stringify(
      {
        originalText: textInput,
        cleanText,
        beforeSlopScore: beforeDetection.slopScore,
        afterSlopScore: afterDetection.slopScore,
        slopRemoved: beforeDetection.matches.map((m) => m.match),
      },
      null,
      2,
    );
  } else {
    outputText = cleanText;
  }

  if (options.outFile) {
    writeFileSync(options.outFile, outputText);
  }

  return {
    originalText: textInput,
    cleanText,
    beforeSlopScore: beforeDetection.slopScore,
    afterSlopScore: afterDetection.slopScore,
    outputText,
  };
}
