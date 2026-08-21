export const DE_SLOP_PROMPT_INSTRUCTIONS = `
CRITICAL DESLOPPING DIRECTIVES (STRICT HUMAN STYLE):
1. PRESERVE SOURCE LANGUAGE & CORE MESSAGE:
   - Detect the language of the source text (Ukrainian, English, German, etc.) and write the de-sloped version strictly in that EXACT SAME language.
   - Keep the key information, factual technical points, and main intent intact.

2. REMOVE ALL AI SLOP & SYCOPHANCY:
   - Strip empty openers ("Let's dive in", "In today's fast-paced world", "У сучасному світі", "Давайте зануримося").
   - Strip empty sycophancy ("Great post!", "Thanks for sharing!", "Чудовий допис!").
   - Ban AI buzzwords: delve, leverage, testament, pivotal, tapestry, game-changer, занурюватися, поринати, є свідченням, поворотний момент.
   - Replace binary contrasts ("It's not just X, it's Y" / "Це не просто X, це Y") with direct assertions.

3. HUMAN VOICE & CONCISE STRUCTURE:
   - Write like a real experienced professional.
   - Vary sentence lengths naturally.
   - Avoid repetitive bullet point bold headers (- **Header:**). Use clean prose.
`;

export function appendDeSlopInstructions(prompt: string, maxWords?: number): string {
  let instructions = DE_SLOP_PROMPT_INSTRUCTIONS.trim();
  if (maxWords && maxWords > 0) {
    instructions += `\n\nWORD COUNT LIMIT: Keep the final output under ${maxWords} words.`;
  }
  return `${prompt.trim()}\n\n${instructions}`;
}

export function sanitizeText(text: string, maxWords?: number): string {
  if (!text) return text;
  let clean = text.trim();

  // Strip leading/trailing double quotes
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith('“') && clean.endsWith('”'))) {
    clean = clean.slice(1, -1).trim();
  }

  // 1. Strip throat-clearing & sycophancy openers
  const openers = [
    /^(let's dive in|in today's fast-paced world|in the realm of|first and foremost|at the end of the day)[,!.:]?\s*/i,
    /^(у сучасному світі|давайте зануримося|варто зазначити|перш за все|на сьогоднішній день)[,!.:]?\s*/i,
    /^(great (post|writeup)|thanks for sharing|couldn't agree more|here's my take|чудовий (пост|допис)|дякую(, що поділилися)?|ось моя думка)[,!.:]?\s*/i,
  ];

  for (const regex of openers) {
    clean = clean.replace(regex, "");
  }

  // 2. Remove binary contrasts
  clean = clean.replace(/(?:it's|it is) not (?:just|only) (.+?), (?:it's|it is) (.+?)\./gi, "$2.");
  clean = clean.replace(/це не просто (.+?), це (.+?)\./gi, "$2.");

  // 3. Clean em-dashes
  clean = clean.replace(/\s*—\s*/g, ", ");

  clean = clean.trim();

  // 4. Optional word count truncation
  if (maxWords && maxWords > 0) {
    const words = clean.split(/\s+/);
    if (words.length > maxWords) {
      let truncated = words.slice(0, maxWords).join(" ");
      if (!/[.!?]$/.test(truncated)) {
        truncated += ".";
      }
      clean = truncated;
    }
  }

  return clean;
}
