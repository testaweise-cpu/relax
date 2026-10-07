import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("Rate-Limit", () => {
  it("erlaubt n Anfragen pro Fenster und IP", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 10)).toBe(true);
    expect(rl.check("a", 20)).toBe(false);
    expect(rl.check("b", 20)).toBe(true);
    expect(rl.check("a", 1015)).toBe(true);
  });
});
