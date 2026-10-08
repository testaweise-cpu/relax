import { describe, expect, it } from "vitest";
import { presenceResponseSchema } from "./presence-dto";
import { parsePresenceResponse } from "./presence-guard";

const valid = {
  updatedAt: "2026-10-08T10:00:00.000Z",
  present: [
    {
      slug: "aurora",
      name: "Aurora",
      languages: ["de", "en"],
      isNew: false,
      isBack: true,
      image: { url: "/mock/aurora-1.webp", width: 900, height: 1200 },
      since: "2026-10-08T08:00:00.000Z",
      until: null,
    },
    {
      slug: "bella",
      name: "Bella",
      languages: [],
      isNew: true,
      isBack: false,
      image: null,
      since: "2026-10-08T09:00:00.000Z",
      until: "2026-10-08T18:00:00.000Z",
    },
  ],
};

describe("parsePresenceResponse", () => {
  it("liefert dasselbe Ergebnis wie das zod-Schema", () => {
    expect(parsePresenceResponse(valid)).toEqual(
      presenceResponseSchema.parse(valid),
    );
  });

  it.each([
    ["kein Objekt", null],
    ["present fehlt", { updatedAt: valid.updatedAt }],
    [
      "Bild ohne Breite",
      {
        ...valid,
        present: [
          { ...valid.present[0], image: { url: "/x.webp", height: 1 } },
        ],
      },
    ],
    [
      "isNew kein Boolean",
      { ...valid, present: [{ ...valid.present[1], isNew: "ja" }] },
    ],
  ])("lehnt ab: %s", (_, input) => {
    expect(parsePresenceResponse(input)).toBeNull();
    expect(presenceResponseSchema.safeParse(input).success).toBe(false);
  });
});
