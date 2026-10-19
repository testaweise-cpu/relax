import { describe, expect, it } from "vitest";
import { sameOriginTarget } from "./age-gate";

const req = "https://www.mona-roses.com/api/age";

describe("sameOriginTarget (Rücksprung nach der Altersabfrage)", () => {
  it.each([
    ["/preise", "https://www.mona-roses.com/preise"],
    ["/en/galerie?x=1", "https://www.mona-roses.com/en/galerie?x=1"],
  ])("erlaubt %s", (back, expected) => {
    expect(sameOriginTarget(back, req).href).toBe(expected);
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "https://evil.com/",
    "javascript:alert(1)",
  ])("leitet %s auf die Startseite um", (back) => {
    expect(sameOriginTarget(back, req).href).toBe(
      "https://www.mona-roses.com/",
    );
  });
});
