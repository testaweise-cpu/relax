import { existsSync } from "node:fs";
import { join } from "node:path";
import { createReader } from "@keystatic/core/reader";
import { describe, expect, it } from "vitest";
import config from "../../keystatic.config";

const reader = createReader(process.cwd(), config);

describe("Keystatic-Inhalte", () => {
  it("Galerie: jedes Bild existiert und hat einen deutschen Alt-Text", async () => {
    const entries = await reader.collections.gallery.all();
    expect(entries.length).toBeGreaterThan(0);
    for (const { slug, entry } of entries) {
      expect(entry.alt.de, slug).not.toBe("");
      expect(entry.image, slug).toBeTruthy();
      expect(existsSync(join("public", entry.image!)), entry.image!).toBe(true);
    }
  });

  it("Pflicht-Singletons sind lesbar", async () => {
    await expect(
      reader.singletons.settings.readOrThrow(),
    ).resolves.toBeTruthy();
    await expect(
      reader.singletons.legalNotice.readOrThrow(),
    ).resolves.toBeTruthy();
    await expect(reader.singletons.prices.readOrThrow()).resolves.toBeTruthy();
  });
});
