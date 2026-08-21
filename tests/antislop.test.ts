import { test, expect } from "bun:test";
import { appendDeSlopInstructions, sanitizeText } from "../src/antislop.ts";

test("appendDeSlopInstructions appends instructions and optional maxWords", () => {
  const result = appendDeSlopInstructions("Base prompt", 60);
  expect(result).toContain("CRITICAL DESLOPPING DIRECTIVES");
  expect(result).toContain("under 60 words");
});

test("sanitizeText removes throat-clearing openers and sycophancy", () => {
  expect(sanitizeText("Let's dive in! Our architecture works well.")).toBe("Our architecture works well.");
  expect(sanitizeText("У сучасному світі, ми будуємо якісний продукт.")).toBe("ми будуємо якісний продукт.");
});

test("sanitizeText truncates to maxWords when specified", () => {
  const text = "One two three four five six seven eight nine ten.";
  expect(sanitizeText(text, 5)).toBe("One two three four five.");
});
