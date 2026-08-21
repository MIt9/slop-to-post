---
name: slop-to-post
description: "Detect AI slop patterns in text/drafts and rewrite them into clean, authentic human posts in the matching language."
---

# slop-to-post Skill

Use this skill when detecting AI slop in drafts or transforming AI-generated content into natural human writing for social media posts, articles, and documentation.

## Core Rules

1. **Detect AI Slop (`slop-to-post detect <file>`):**
   - Scans for throat-clearing openers (*"In today's fast-paced world"*, *"У сучасному світі"*).
   - Scans for empty sycophancy (*"Great post!"*, *"Чудовий допис!"*).
   - Scans for overused AI buzzwords (*delve*, *leverage*, *testament*, *pivotal*, *занурюватися*, *поринати*, *є свідченням*).
   - Scans for binary contrast structures (*"It's not just X, it's Y"* / *"Це не просто X, це Y"*).
   - Returns a Slop Score (0 = Clean, 100 = Heavy Slop) and itemized findings.

2. **Modify & De-Slop (`slop-to-post <file>`):**
   - Preserves source language (Ukrainian, English, German, etc.).
   - Eliminates slop, fluff, colon reveals, and repetitive formatting.
   - Preserves core facts, ideas, and takeaways.

## CLI Usage

```bash
# Detect slop in text or draft file
slop-to-post detect draft.txt

# Detect slop and output report as JSON
slop-to-post detect draft.txt --json

# De-slop text directly into clean post
slop-to-post "In today's fast-paced world, it's pivotal to leverage AI."

# De-slop post file with max word count limit
slop-to-post draft.txt -w 80 -o clean_post.md

# Update CLI to latest release
slop-to-post update
```

## Options

- `detect <text_or_file>`: Analyze and score AI slop patterns
- `--max-words, -w <n>`: Maximum word count limit for rewritten post
- `--out, -o <file>`: Output clean text or report file path
- `--json`: Output as formatted JSON object
