# slop-to-post

CLI tool: detect AI slop in drafts and rewrite them into clean, authentic human posts in the matching source language.

## Purpose

Given a draft, post, or article (as raw text or a file path), `slop-to-post` analyzes it for AI slop patterns and rewrites it into clean, direct human prose using your configured AI CLI provider (e.g. Claude Code `claude -p`).

### Key Features
1. **AI Slop Detection (`slop-to-post detect`):** Instantly scans text for throat-clearing openers, empty sycophancy, AI clichés (`delve`, `leverage`, `testament`, `занурюватися`, `є свідченням`), and artificial formatting, returning an itemized report and a **Slop Score (0-100)**.
2. **Text De-Sloping & Modification:** Rewrites text to remove AI slop while keeping core facts, code snippets, and ideas intact.
3. **Strict Language Matching:** Automatically detects the source language (Ukrainian, English, etc.) and writes the clean post in that exact same language.
4. **Word Count Limits (`-w <n>`):** Optional word count limit for the clean output.

## Install (macOS, no Bun/git required)

```bash
curl -fsSL https://raw.githubusercontent.com/MIt9/slop-to-post/main/install.sh | sh
```

Downloads the latest executable to `~/.local/bin/slop-to-post` and checks if it's on your `PATH`. Then run the setup wizard to configure your AI provider (e.g. Claude Code `claude -p`):

```bash
slop-to-post setup
```

## AI Agent Skill (Claude Code / AGY)

This repository includes a skill definition for AI agents at [skills/slop-to-post/SKILL.md](skills/slop-to-post/SKILL.md). When using Claude Code or Antigravity, the skill will be automatically discovered.

## Quick Start

```bash
# 1. Detect AI slop in a draft file
slop-to-post detect draft.txt

# 2. De-slop text directly into clean post
slop-to-post "In today's fast-paced world, it's pivotal to leverage AI."

# 3. De-slop file with max 80 words and save to file
slop-to-post draft.txt -w 80 -o clean_post.md
```

## CLI Surface

```
slop-to-post <text_or_file_path> [options]       De-slop & modify text into clean post
slop-to-post detect <text_or_file_path> [options] Scan text & report AI slop patterns
slop-to-post <command> [options]

Commands:
  detect                  Detect and score AI slop patterns in text/file without modifying
  setup                   Interactive wizard to configure AI CLI provider
  init                    Scaffold slop-to-post.config.json + prompts/deslop.txt
  update                  Check and download the latest release from GitHub

Options:
  --max-words, -w <n>     Maximum word count limit for output clean text
  --out, -o <path>        Save output clean text or report to specified file
  --json                  Output result as formatted JSON
  --config <path>         Path to config file (default: ./slop-to-post.config.json)
  --version, -v           Show version
  --help, -h              Show this help
```

## Config Schema (`slop-to-post.config.json`)

```jsonc
{
  "ai": {
    "default": "claude",
    "providers": {
      "claude": {
        "command": ["claude", "-p"],
        "timeoutSec": 120
      }
    }
  }
}
```

## Building & Testing

```bash
bun test             # Run test suite
bun run typecheck    # Typecheck with tsc
bun run build        # Build standalone binary
```
