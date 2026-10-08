import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AbstractIntlMessages } from "next-intl";
import { describe, expect, it } from "vitest";
import de from "@/messages/de.json";
import { CLIENT_NAMESPACES, clientMessages } from "./client-messages";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !name.includes(".test.") ? [path] : [];
  });
}

describe("Client-Übersetzungen", () => {
  it("enthalten jeden Namensraum, der mit useTranslations() genutzt wird", () => {
    const used = new Set<string>();
    for (const file of sourceFiles("src")) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/useTranslations\(\s*"([^"]+)"/g))
        used.add(m[1].split(".")[0]);
      expect(src, `${file}: useTranslations() ohne Namensraum`).not.toMatch(
        /useTranslations\(\s*\)/,
      );
    }
    const allowed = new Set<string>(CLIENT_NAMESPACES);
    expect([...used].filter((ns) => !allowed.has(ns))).toEqual([]);
  });

  it("filtern auf die erlaubten Namensräume", () => {
    const picked = clientMessages(de as unknown as AbstractIntlMessages);
    expect(Object.keys(picked).sort()).toEqual([...CLIENT_NAMESPACES].sort());
    expect(picked).not.toHaveProperty("legal");
  });
});
