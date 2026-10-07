import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import de from "@/messages/de.json";
import en from "@/messages/en.json";

function keys(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj))
    return obj.flatMap((v, i) => keys(v, `${prefix}[${i}]`));
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) =>
      keys(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

/** Alle {de, en}-Paare in einem Keystatic-Inhalt, bei denen DE gefüllt und EN leer ist. */
function missingEn(obj: unknown, path = ""): string[] {
  if (Array.isArray(obj))
    return obj.flatMap((v, i) => missingEn(v, `${path}[${i}]`));
  if (obj && typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    if ("de" in o && "en" in o && typeof o.de === "string") {
      return o.de.trim() && !String(o.en ?? "").trim() ? [path] : [];
    }
    return Object.entries(o).flatMap(([k, v]) =>
      missingEn(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

function jsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? jsonFiles(join(dir, e.name))
      : e.name.endsWith(".json")
        ? [join(dir, e.name)]
        : [],
  );
}

describe("Zweisprachigkeit", () => {
  it("UI-Texte: DE und EN haben dieselben Schlüssel", () => {
    expect(keys(en).sort()).toEqual(keys(de).sort());
  });

  it("Keystatic-Inhalte: jedes deutsche Feld hat eine englische Fassung", () => {
    const files = jsonFiles("src/content");
    expect(files.length).toBeGreaterThan(10);
    const missing = files.flatMap((f) =>
      missingEn(JSON.parse(readFileSync(f, "utf8"))).map((p) => `${f}: ${p}`),
    );
    expect(missing).toEqual([]);
  });
});
