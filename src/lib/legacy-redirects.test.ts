import { describe, expect, it } from "vitest";
import { resolveLegacy } from "./legacy-redirects";

describe("Weiterleitungen der Altseite", () => {
  it.each([
    ["/anwesenheit", "/jetzt-da"],
    ["/anwesenheit/", "/jetzt-da"],
    ["/events-news/", "/events"],
    ["/m/mieterinnen", "/mieterinnen"],
    ["/m/miet/", "/mieterinnen"],
    ["/shop/", "/mieterinnen"],
    ["/warenkorb/", "/"],
    ["/kasse", "/"],
    ["/mein-konto/", "/"],
    ["/dolls/", "/"],
    ["/product/lydia-16-24-uhr-kopie/", "/mieterinnen"],
    ["/product-category/damen/", "/mieterinnen"],
    ["/preise/", "/preise"],
  ])("%s → %s (301)", (from, to) => {
    expect(resolveLegacy(from)).toEqual({ status: 301, location: to });
  });

  it.each([
    "/feed",
    "/feed/",
    "/wp-admin",
    "/wp-login.php",
    "/wp-content/uploads/x.jpg",
    "/wp-json/wp/v2/pages",
    "/category/news/feed",
  ])("%s → 410 Gone", (path) => {
    expect(resolveLegacy(path)).toEqual({ status: 410 });
  });

  it("neue Seiten bleiben unberührt", () => {
    expect(resolveLegacy("/")).toBeNull();
    expect(resolveLegacy("/preise")).toBeNull();
    expect(resolveLegacy("/mieterinnen/aurora")).toBeNull();
    expect(resolveLegacy("/en/preise")).toBeNull();
  });
});
