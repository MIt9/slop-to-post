#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { HELP } from "./help.ts";
import { loadConfig } from "./config.ts";
import { initCommand } from "./commands/init.ts";
import { runSetupWizard, createStdioWizardIO } from "./commands/setup.ts";
import { updateCommand } from "./commands/update.ts";
import { modifySlopText } from "./modify.ts";
import { detectSlop } from "./detector.ts";
import { VERSION } from "./version.ts";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const first = args[0];

  if (first === "--version" || first === "-v" || first === "version") {
    console.log(`slop-to-post v${VERSION}`);
    return;
  }

  if (!first || first === "--help" || first === "-h") {
    console.log(HELP);
    return;
  }

  const { values, positionals } = parseArgs({
    args,
    options: {
      config: { type: "string" },
      "max-words": { type: "string", short: "w" },
      out: { type: "string", short: "o" },
      json: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  if (values.version) {
    console.log(`slop-to-post v${VERSION}`);
    return;
  }

  const configPath = typeof values.config === "string" ? values.config : undefined;
  const command = positionals[0];

  switch (command) {
    case "init":
      initCommand(process.cwd(), configPath);
      return;
    case "setup": {
      const io = createStdioWizardIO();
      try {
        await runSetupWizard(process.cwd(), io, configPath);
      } finally {
        io.close();
      }
      return;
    }
    case "update":
      await updateCommand();
      return;
    case "detect": {
      const input = positionals[1];
      if (!input) {
        fail("Error: Please provide text or file path to detect slop. Example: slop-to-post detect draft.txt");
      }
      let text = input.trim();
      if (existsSync(text)) {
        text = readFileSync(text, "utf-8").trim();
      }

      const result = detectSlop(text);
      let outputText = "";
      if (values.json) {
        outputText = JSON.stringify(result, null, 2);
      } else {
        outputText = `=== AI Slop Detection Report ===\n${result.summary}\n`;
        if (result.matches.length > 0) {
          outputText += `\nDetected Slop Items:\n` + result.matches.map((m, i) => `  ${i + 1}. [${m.severity.toUpperCase()}] "${m.match}" — ${m.description}`).join("\n");
        }
      }

      const outFile = typeof values.out === "string" ? values.out : undefined;
      if (outFile) {
        writeFileSync(outFile, outputText);
        console.log(`Saved slop report to ${outFile}`);
      } else {
        console.log(outputText);
      }
      return;
    }
  }

  // Primary action: De-slop text/post
  const textInput = positionals[0];
  if (!textInput) {
    fail("Error: Please provide text or file path to de-slop. Run 'slop-to-post --help' for usage.");
  }

  const maxWords = values["max-words"] ? parseInt(String(values["max-words"]), 10) : undefined;
  const jsonOutput = Boolean(values.json);
  const outFile = typeof values.out === "string" ? values.out : undefined;

  const config = loadConfig(configPath, process.cwd());
  const { outputText } = await modifySlopText(config, {
    textInput,
    maxWords,
    jsonOutput,
    outFile,
  });

  if (!outFile) {
    console.log(outputText);
  } else {
    console.log(`Saved clean post to ${outFile}`);
  }
}

try {
  await main();
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
