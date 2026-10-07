import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("nutzt sinnvolle Standardwerte", async () => {
    vi.stubEnv("DATA_SOURCE", "");
    const { env } = await import("./env");
    expect(env.DATA_SOURCE).toBe("mock");
    expect(env.SMTP_PORT).toBe(587);
    expect(env.SMTP_SECURE).toBe(false);
  });

  it("lehnt eine unbekannte Datenquelle ab", async () => {
    vi.stubEnv("DATA_SOURCE", "wordpress");
    await expect(import("./env")).rejects.toThrow(/DATA_SOURCE/);
  });
});
