import { describe, expect, it } from "vitest";
import {
  applicationSchema,
  fieldErrors,
  MAX_PHOTO_BYTES,
  validatePhotos,
} from "./schema";

const schema = applicationSchema(21);
const valid = {
  name: "Nova",
  age: "24",
  contact: "+49 170 1234567",
  consent: "on",
};

describe("Bewerbungs-Schema", () => {
  it("akzeptiert eine gültige Bewerbung (Telefon oder E-Mail)", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(
      schema.safeParse({ ...valid, contact: "nova@example.com" }).success,
    ).toBe(true);
  });

  it("Mindestalter und Einwilligung sind Pflicht", () => {
    const r = schema.safeParse({ ...valid, age: "20", consent: undefined });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(fieldErrors(r.error)).toEqual({ age: "age", consent: "consent" });
  });

  it("lehnt unbrauchbare Kontaktdaten ab", () => {
    expect(schema.safeParse({ ...valid, contact: "hallo" }).success).toBe(
      false,
    );
  });

  it("Fotos: max. 3, nur JPG/PNG/WebP, je max. 8 MB; leere Felder zählen nicht", () => {
    const f = (type: string, size = 1000) => ({ name: "x", type, size });
    expect(
      validatePhotos([
        f("image/jpeg"),
        f("image/png"),
        f("image/webp"),
        f("", 0),
      ]).ok,
    ).toBe(true);
    expect(
      validatePhotos([
        f("image/jpeg"),
        f("image/jpeg"),
        f("image/jpeg"),
        f("image/jpeg"),
      ]).ok,
    ).toBe(false);
    expect(validatePhotos([f("image/gif")]).ok).toBe(false);
    expect(validatePhotos([f("image/jpeg", MAX_PHOTO_BYTES + 1)]).ok).toBe(
      false,
    );
  });
});
