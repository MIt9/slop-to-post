import { test, expect } from "bun:test";
import { detectSlop } from "../src/detector.ts";

test("detectSlop returns score 0 for clean human text", () => {
  const result = detectSlop("We refactored our API routes and cut p99 latency by 45ms.");
  expect(result.slopScore).toBe(0);
  expect(result.isSlop).toBe(false);
  expect(result.matches).toHaveLength(0);
});

test("detectSlop catches throat-clearing and buzzwords", () => {
  const result = detectSlop("In today's fast-paced world, it's crucial to delve into high-performing systems.");
  expect(result.slopScore).toBeGreaterThan(0);
  expect(result.isSlop).toBe(true);
  expect(result.matches.some((m) => m.rule === "throat_clearing_en")).toBe(true);
  expect(result.matches.some((m) => m.rule === "buzzwords_en")).toBe(true);
});

test("detectSlop catches Ukrainian throat-clearing and buzzwords", () => {
  const result = detectSlop("У сучасному світі варто підкреслити, як важливо занурюватися в технології.");
  expect(result.slopScore).toBeGreaterThan(0);
  expect(result.isSlop).toBe(true);
  expect(result.matches.some((m) => m.rule === "throat_clearing_ua")).toBe(true);
});
