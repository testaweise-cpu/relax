import { describe, expect, it, vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.mona-roses.com/");
const { absoluteUrl, alternatesFor, localizedPath } = await import("./site");

describe("URLs und hreflang", () => {
  it("Deutsch ohne Präfix, Englisch unter /en", () => {
    expect(localizedPath("de", "/")).toBe("/");
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("en", "/preise")).toBe("/en/preise");
    expect(absoluteUrl("de", "/preise")).toBe(
      "https://www.mona-roses.com/preise",
    );
  });

  it("Canonical und Sprachvarianten inkl. x-default", () => {
    expect(alternatesFor("en", "/jobs")).toEqual({
      canonical: "https://www.mona-roses.com/en/jobs",
      languages: {
        de: "https://www.mona-roses.com/jobs",
        en: "https://www.mona-roses.com/en/jobs",
        "x-default": "https://www.mona-roses.com/jobs",
      },
    });
  });
});
