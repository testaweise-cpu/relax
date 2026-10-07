# Offene Punkte zur VyceON-Schnittstelle

Die VyceON-API wird parallel gebaut. Alle Annahmen der Website stehen in
**einer** Datei: `src/lib/data/vyceon-source.ts` (markiert mit `// ANNAHME:`),
die Webhook-Annahmen in `src/lib/data/webhook.ts`. Weicht die echte API ab,
werden nur diese Dateien angepasst – Seiten und Komponenten bleiben gleich.

Stand: Phase 3. Bitte Antworten direkt hier eintragen.

## 1. Authentifizierung

- [ ] Bearer-Token im Header `Authorization: Bearer <VYCEON_API_KEY>` – korrekt?
- [ ] Ist der Schlüssel pro Club oder global? Ablauf, Rotation, Rate-Limits?
- [ ] Nur lesender Zugriff für die Website möglich (eigener Schlüssel)?

## 2. Endpunkte (angenommen)

| Zweck        | Annahme                                     | Fragen                                                                |
| ------------ | ------------------------------------------- | --------------------------------------------------------------------- |
| Alle Profile | `GET /clubs/:clubId/profiles`               | Nur aktive? Paginierung? Sortierung?                                  |
| Ein Profil   | `GET /clubs/:clubId/profiles/:slug`         | Slug oder ID? 404 bei unbekannt? Slug-Änderungen (Weiterleitung)?     |
| Schichten    | `GET /clubs/:clubId/shifts?from=ISO&to=ISO` | Liefert auch Schichten, die den Zeitraum nur berühren? Max. Zeitraum? |
| Anwesenheit  | `GET /clubs/:clubId/presence`               | Check-in-basiert oder aus Schichten berechnet? `until` bekannt?       |

- [ ] Antwortformat: Array oder `{ data: [...] }`? (beides wird akzeptiert)
- [ ] Zeiten: ISO 8601 **mit Offset** (z. B. `2026-10-07T16:00:00+02:00`)? Pflicht für korrekte Nachtschichten.

## 3. Datenfelder (Modell der Website, `src/lib/data/types.ts`)

- [ ] `slug`: sauber (`lydia`), eindeutig, ohne Zeiten/„kopie“? Bleibt er stabil?
- [ ] `name`: nur der Name? „Neu“/„Wieder da“ als eigene Felder `isNew`/`isBack`?
- [ ] `languages`: ISO-639-1-Codes (`de`, `en`, `ro`)? `origin`: ISO-3166-Ländercode (`RO`)?
- [ ] `services`: freie Texte oder feste Liste mit IDs (für Übersetzung DE/EN)?
- [ ] `personalNote` und `services`: einsprachig oder DE/EN? Die englische Website zeigt sie derzeit unverändert (deutsch).
- [ ] Maße: Einheiten (cm, kg, EU-Schuhgröße), Körbchengröße als Text?
- [ ] Welche Felder sind optional?

## 4. Bilder

- [ ] Von welcher Domain? (→ `VYCEON_IMAGE_HOST`)
- [ ] Liefert die API Breite/Höhe (Pflicht für feste Seitenverhältnisse, kein Layout-Sprung)?
- [ ] Gibt es Größenvarianten / ein Bild-CDN? Formate (WebP/AVIF)?
- [ ] Alt-Texte oder Bildbeschreibungen?
- [ ] Reihenfolge / Titelbild markiert?

## 5. Webhooks (angenommen)

- `POST https://www.mona-roses.com/api/revalidate`
- Header `X-Vyceon-Timestamp` (Unix-Sekunden) und
  `X-Vyceon-Signature: sha256=<hex>` = HMAC-SHA256(`VYCEON_WEBHOOK_SECRET`, `"<timestamp>.<rohBody>"`)
- Body `{ "type": "profile.updated", "data": { "slug": "lydia" } }`
- Ereignistypen: `profile.*`, `shift.*`, `presence.*` / `checkin` / `checkout`

Fragen:

- [ ] Signaturverfahren und Header-Namen so umsetzbar?
- [ ] Welche Ereignisse gibt es genau? Kommt bei Profiländerungen der Slug mit (alter + neuer bei Umbenennung)?
- [ ] Wiederholungen bei Fehlern (Retry-Strategie)?

## 6. Betrieb

- [ ] Verfügbarkeit / Wartungsfenster? (Website zeigt bei Ausfall die letzten Daten)
- [ ] Testumgebung mit Beispieldaten für die Abnahme?
