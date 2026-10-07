import { describe, expect, it } from "vitest";
import { sign, tagsForEvent, verifySignature } from "./webhook";

const secret = "geheim-geheim-geheim";
const body = JSON.stringify({
  type: "profile.updated",
  data: { slug: "lydia" },
});
const now = new Date("2026-10-07T12:00:00Z");
const ts = String(Math.floor(now.getTime() / 1000));

describe("Webhook-Signatur", () => {
  it("akzeptiert eine korrekte Signatur", () => {
    expect(
      verifySignature({
        secret,
        body,
        timestamp: ts,
        signature: sign(secret, ts, body),
        now,
      }),
    ).toEqual({ ok: true });
  });

  it("lehnt veränderten Inhalt, falsches Geheimnis und fehlende Header ab", () => {
    const sig = sign(secret, ts, body);
    expect(
      verifySignature({
        secret,
        body: body + " ",
        timestamp: ts,
        signature: sig,
        now,
      }).ok,
    ).toBe(false);
    expect(
      verifySignature({
        secret: "anderes-geheimnis!",
        body,
        timestamp: ts,
        signature: sig,
        now,
      }).ok,
    ).toBe(false);
    expect(
      verifySignature({ secret, body, timestamp: null, signature: sig, now })
        .ok,
    ).toBe(false);
    expect(
      verifySignature({
        secret,
        body,
        timestamp: ts,
        signature: "sha256=abc",
        now,
      }).ok,
    ).toBe(false);
  });

  it("lehnt alte Zeitstempel ab (Wiederholungsschutz)", () => {
    const old = String(Number(ts) - 600);
    expect(
      verifySignature({
        secret,
        body,
        timestamp: old,
        signature: sign(secret, old, body),
        now,
      }),
    ).toEqual({
      ok: false,
      reason: "Zeitstempel zu alt",
    });
  });
});

describe("Tags je Ereignis", () => {
  it("Profiländerung trifft Liste und Einzelprofil", () => {
    expect(
      tagsForEvent({ type: "profile.updated", data: { slug: "lydia" } }),
    ).toEqual(["profiles", "profile:lydia"]);
  });
  it("Schichten und Anwesenheit getrennt", () => {
    expect(tagsForEvent({ type: "shift.created" })).toEqual(["shifts"]);
    expect(tagsForEvent({ type: "checkin" })).toEqual(["presence"]);
  });
  it("unbekannte Ereignisse leeren sicherheitshalber alles", () => {
    expect(tagsForEvent({ type: "club.updated" })).toEqual([
      "profiles",
      "shifts",
      "presence",
    ]);
  });
});
