import { describe, expect, it } from "vitest";
import { isPreviewAuthorized } from "./preview-auth";

const basic = (s: string) => `Basic ${Buffer.from(s).toString("base64")}`;

describe("Vorschau-Passwortschutz", () => {
  it("lässt nur die richtige Kombination durch", () => {
    expect(isPreviewAuthorized(basic("mona:geheim"), "mona", "geheim")).toBe(
      true,
    );
    expect(isPreviewAuthorized(basic("mona:falsch"), "mona", "geheim")).toBe(
      false,
    );
    expect(isPreviewAuthorized(basic("anna:geheim"), "mona", "geheim")).toBe(
      false,
    );
  });

  it("Passwörter mit Doppelpunkt und Umlauten funktionieren", () => {
    expect(isPreviewAuthorized(basic("mona:a:b:ü"), "mona", "a:b:ü")).toBe(
      true,
    );
  });

  it("lehnt fehlende oder kaputte Header ab", () => {
    expect(isPreviewAuthorized(null, "mona", "geheim")).toBe(false);
    expect(isPreviewAuthorized("Bearer abc", "mona", "geheim")).toBe(false);
    expect(isPreviewAuthorized("Basic !!!", "mona", "geheim")).toBe(false);
    expect(isPreviewAuthorized(basic("ohne-doppelpunkt"), "mona", "x")).toBe(
      false,
    );
  });
});
