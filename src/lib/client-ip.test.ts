import { describe, expect, it } from "vitest";
import { clientIpFrom } from "./client-ip";

const headers = (h: Record<string, string>) => (n: string) => h[n] ?? null;

describe("Client-IP", () => {
  it("nimmt den vom Proxy angehängten (letzten) Eintrag – gefälschte Einträge zählen nicht", () => {
    expect(
      clientIpFrom(
        headers({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" }),
        true,
      ),
    ).toBe("203.0.113.9");
  });
  it("fällt auf X-Real-IP zurück", () => {
    expect(clientIpFrom(headers({ "x-real-ip": "203.0.113.9" }), true)).toBe(
      "203.0.113.9",
    );
  });
  it("ohne vertrauenswürdigen Proxy: keine Header auswerten", () => {
    expect(clientIpFrom(headers({ "x-forwarded-for": "1.2.3.4" }), false)).toBe(
      "unknown",
    );
  });
});
