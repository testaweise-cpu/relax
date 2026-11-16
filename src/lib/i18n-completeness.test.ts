import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import { locales } from "@/i18n/locales";

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

  it("UI-Texte: alle zehn Sprachen haben dieselben Schlüssel wie Deutsch", () => {
    for (const l of locales) {
      const m = JSON.parse(readFileSync(`src/messages/${l}.json`, "utf8"));
      expect(keys(m).sort(), l).toEqual(keys(de).sort());
    }
  });

  it("UI-Texte: jeder Platzhalter des deutschen Textes steht auch in der Übersetzung", () => {
    const flat = (o: unknown, p = ""): [string, string][] =>
      Array.isArray(o)
        ? o.flatMap((v, i) => flat(v, `${p}[${i}]`))
        : o && typeof o === "object"
          ? Object.entries(o).flatMap(([k, v]) => flat(v, p ? `${p}.${k}` : k))
          : [[p, String(o)]];
    // Nur echte Variablen ({name}), nicht die Fälle eines ICU-Plurals
    const vars = (s: string) =>
      [...s.matchAll(/\{(\w+)(?=[,}])/g)].map((m) => m[1]).sort();
    const source = new Map(flat(de));
    const missing: string[] = [];
    for (const l of locales) {
      const m = JSON.parse(readFileSync(`src/messages/${l}.json`, "utf8"));
      for (const [k, v] of flat(m)) {
        const need = new Set(vars(source.get(k) ?? ""));
        const have = new Set(vars(v));
        for (const n of need)
          if (!have.has(n)) missing.push(`${l} ${k} {${n}}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("Redaktionstexte: jede Übersetzung gehört zu einem aktuellen deutschen Text", () => {
    const current = new Set<string>();
    const walk = (o: unknown): void => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (o && typeof o === "object") {
        const r = o as Record<string, unknown>;
        if (typeof r.de === "string" && r.de.trim()) current.add(r.de);
        Object.values(r).forEach(walk);
      }
    };
    jsonFiles("src/content").forEach((f) =>
      walk(JSON.parse(readFileSync(f, "utf8"))),
    );
    for (const l of locales.filter((x) => x !== "de" && x !== "en")) {
      const table = JSON.parse(
        readFileSync(`src/i18n/content/${l}.json`, "utf8"),
      ) as Record<string, string>;
      const missing = [...current].filter((de) => !table[de]?.trim());
      expect(missing, l).toEqual([]);
    }
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
