import type { SlopDetectionResult, SlopMatch } from "./types.ts";

interface PatternRule {
  id: string;
  description: string;
  regex: RegExp;
  severity: "low" | "medium" | "high";
  weight: number;
}

const SLOP_PATTERNS: PatternRule[] = [
  // Throat-clearing openers
  {
    id: "throat_clearing_en",
    description: "Generic AI throat-clearing opening phrase (EN)",
    regex: /(?:^|\s|\b)(let's dive in|in today's fast-paced world|in the realm of|first and foremost|at the end of the day|it goes without saying)(?:\s|\b|$)/i,
    severity: "high",
    weight: 25,
  },
  {
    id: "throat_clearing_ua",
    description: "Generic AI throat-clearing opening phrase (UA)",
    regex: /(?:^|\s|\b)(у сучасному світі|давайте зануримося|варто зазначити|варто підкреслити|перш за все|на сьогоднішній день|не таємниця, що)(?:\s|\b|$)/i,
    severity: "high",
    weight: 25,
  },
  // Sycophancy & Colon reveals
  {
    id: "sycophancy",
    description: "Sycophantic opener or colon reveal",
    regex: /^(great (post|writeup)|thanks for sharing|couldn't agree more|here's my take|чудовий (пост|допис)|дякую(, що поділилися)?|ось моя думка)[,!.:]?/i,
    severity: "high",
    weight: 25,
  },
  // AI Buzzwords (EN)
  {
    id: "buzzwords_en",
    description: "Overused AI buzzwords (EN)",
    regex: /(?:^|\s|\b)(delve|leverage|tapestry|pivotal|testament|game-changer|foster|beacon)(?:\s|\b|$)/i,
    severity: "medium",
    weight: 15,
  },
  // AI Buzzwords (UA)
  {
    id: "buzzwords_ua",
    description: "Overused AI buzzwords (UA)",
    regex: /(?:^|\s|\b)(занурюватися|поринати|є свідченням|поворотний момент|багатогранний|варто підкреслити)(?:\s|\b|$)/i,
    severity: "medium",
    weight: 15,
  },
  // Binary Contrast
  {
    id: "binary_contrast_en",
    description: "Artificial binary contrast structure (EN)",
    regex: /(it's not (just|only) .+?, it's|not only .+?, but also)/i,
    severity: "medium",
    weight: 15,
  },
  {
    id: "binary_contrast_ua",
    description: "Artificial binary contrast structure (UA)",
    regex: /(це не просто .+?, це|не лише .+?, а й)/i,
    severity: "medium",
    weight: 15,
  },
  // Em-dash overuse
  {
    id: "em_dash_overuse",
    description: "Em-dash overuse formatting pattern",
    regex: /\s+—\s+.+?\s+—\s+/g,
    severity: "low",
    weight: 10,
  },
  // Bold header spam
  {
    id: "bold_header_spam",
    description: "Repetitive bold list header spam (- **Header:**)",
    regex: /^-\s*\*\*.+?\*\*:/m,
    severity: "low",
    weight: 10,
  },
];

export function detectSlop(text: string): SlopDetectionResult {
  if (!text || !text.trim()) {
    return {
      slopScore: 0,
      isSlop: false,
      matches: [],
      summary: "Empty text.",
    };
  }

  const matches: SlopMatch[] = [];
  let scoreSum = 0;

  for (const rule of SLOP_PATTERNS) {
    const match = text.match(rule.regex);
    if (match) {
      matches.push({
        rule: rule.id,
        match: match[0].trim(),
        description: rule.description,
        severity: rule.severity,
      });
      scoreSum += rule.weight;
    }
  }

  const slopScore = Math.min(100, scoreSum);
  const isSlop = slopScore >= 20;

  let summary = "";
  if (slopScore === 0) {
    summary = "✅ Clean! No AI slop patterns detected.";
  } else if (slopScore < 40) {
    summary = `⚠️ Moderate slop detected (Score: ${slopScore}/100). ${matches.length} issue(s) found.`;
  } else {
    summary = `🚨 Heavy AI slop detected (Score: ${slopScore}/100). ${matches.length} issue(s) found.`;
  }

  return {
    slopScore,
    isSlop,
    matches,
    summary,
  };
}
