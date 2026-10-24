# VyceON-Schnittstelle für mona-roses.com – Spezifikation v1

Diese Spezifikation legt fest, wie die Website mona-roses.com Profile, Schichten
und Anwesenheit aus VyceON liest und wie VyceON die Website über Änderungen
informiert. Die Website ist genau auf diese Schnittstelle gebaut. Das
VyceON-Team setzt sie wie beschrieben um.

| Datei                                                                  | Inhalt                                       |
| ---------------------------------------------------------------------- | -------------------------------------------- |
| [`vyceon-api.yaml`](vyceon-api.yaml)                                   | Maschinenlesbare Spezifikation (OpenAPI 3.1) |
| [`vyceon-beispiele/`](vyceon-beispiele/)                               | Beispielantworten und Webhooks (JSON)        |
| [`../src/lib/data/vyceon-source.ts`](../src/lib/data/vyceon-source.ts) | Umsetzung auf der Website (Lesen)            |
| [`../src/lib/data/webhook.ts`](../src/lib/data/webhook.ts)             | Umsetzung auf der Website (Webhook)          |

Ein automatischer Test der Website liest die Beispiele in `vyceon-beispiele/`
und prüft, dass sie korrekt verarbeitet werden. Liefert VyceON genau dieses
Format, funktioniert die Website ohne weitere Anpassung.

## Auf einen Blick

| Was               | Festlegung                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| Basis-URL         | `https://<vyceon-host>/v1` (Website: `VYCEON_API_URL`)                      |
| Authentifizierung | `Authorization: Bearer <Schlüssel>`, nur lesend, ein Schlüssel pro Club     |
| Format            | JSON, UTF-8, immer `{ "data": … }`; Fehler `{ "error": { code, message } }` |
| Zeiten            | ISO 8601 **mit Offset**, z. B. `2026-10-24T16:00:00+02:00`                  |
| Endpunkte         | Profile (Liste, einzeln), Schichten (Zeitraum), Anwesenheit                 |
| Änderungen        | Webhook `POST https://www.mona-roses.com/api/revalidate`, HMAC-signiert     |
| Versionierung     | Pfad `/v1`; neue Felder dürfen jederzeit dazukommen                         |

## 1. Authentifizierung

- Jeder Request trägt `Authorization: Bearer <VYCEON_API_KEY>`.
- Der Schlüssel gilt für **einen Club** und erlaubt **nur Lesen** der vier
  Endpunkte unten. Die Website schreibt nie in VyceON.
- Ungültiger oder fehlender Schlüssel → `401`; Schlüssel für einen anderen Club
  → `403`.
- Rotation: VyceON kann einen zweiten Schlüssel ausstellen; beide gelten, bis
  der alte widerrufen wird. Die Website tauscht den Wert über die
  Umgebungsvariable aus.

## 2. Allgemeine Regeln

- **Antwortformat:** immer ein Objekt mit `data`. Listen zusätzlich mit
  `meta.generatedAt` (Zeitpunkt der Erzeugung).
- **Fehler:** HTTP-Status plus `{ "error": { "code": "not_found", "message": "…" } }`.
  Die Website wertet nur den Status aus.
- **Unbekannte Felder** ignoriert die Website. Neue Felder sind jederzeit erlaubt,
  das Umbenennen oder Entfernen von Feldern nur in einer neuen Version (`/v2`).
- **Zeiten:** ISO 8601 mit Offset oder `Z`. Ohne Offset ist eine Zeit ungültig.
  Empfohlen ist die Berliner Ortszeit mit ihrem Offset (`+01:00` / `+02:00`).
- **Keine Paginierung:** Listen sind vollständig (höchstens 500 Profile).
- **Ungültige Einträge:** Die Website überspringt einzelne Einträge, die nicht
  dem Schema entsprechen, und protokolliert sie. Der Rest erscheint.
- **Antwortzeit:** unter 1 s; die Website bricht nach 8 s ab und zeigt dann den
  letzten bekannten Stand.

## 3. Endpunkte

### 3.1 `GET /clubs/{clubId}/profiles` – alle sichtbaren Profile

Liefert **alle Profile, die auf der Website erscheinen sollen** (aktiv und zur
Veröffentlichung freigegeben), egal ob sie Schichten haben. Inaktive oder
gesperrte Profile fehlen. Reihenfolge: beliebig; die Website sortiert selbst.

Beispiel: [`profiles.json`](vyceon-beispiele/profiles.json)

### 3.2 `GET /clubs/{clubId}/profiles/{slug}` – ein Profil

- Liefert ein Profil wie in 3.1.
- Unbekannter, inaktiver oder gesperrter Slug → `404`.
- **Umbenennung:** Wird ein Slug geändert, liefert ein Aufruf mit dem **alten**
  Slug weiterhin `200` mit dem Profil (Feld `slug` = neuer Slug). Die Website
  leitet dann dauerhaft auf die neue Adresse um, damit Links und Google-Einträge
  erhalten bleiben.

Beispiel: [`profile.json`](vyceon-beispiele/profile.json),
Fehler: [`fehler-404.json`](vyceon-beispiele/fehler-404.json)

### 3.3 `GET /clubs/{clubId}/shifts?from=…&to=…` – Schichten im Zeitraum

- `from`, `to`: ISO-8601-Zeitpunkte. Die Website fragt höchstens **45 Tage** an
  (gestern bis in 31 Tagen, auf ganze Berliner Tage gerundet).
- Liefert alle Schichten **sichtbarer Profile**, die den Zeitraum **berühren**
  (`start < to` und `end > from`), also auch eine Nachtschicht, die vor `from`
  begann.
- Schichten über Mitternacht sind ein Eintrag (z. B. 22:00 bis 06:00 am
  Folgetag). `end` muss nach `start` liegen.
- Abgesagte Schichten fehlen in der Antwort.

Beispiel: [`shifts.json`](vyceon-beispiele/shifts.json)

### 3.4 `GET /clubs/{clubId}/presence` – wer ist jetzt im Haus

- Liefert die Profile, die **jetzt eingecheckt** sind (Check-in im Haus, nicht
  aus dem Schichtplan berechnet).
- `since`: Zeitpunkt des Check-ins. `until`: geplantes Ende, falls bekannt
  (z. B. aus der Schicht); sonst weglassen.
- Nach dem Check-out verschwindet der Eintrag.
- Nur sichtbare Profile (wie 3.1).

Beispiel: [`presence.json`](vyceon-beispiele/presence.json)

## 4. Felder

### Profil

| Feld           | Typ          | Pflicht | Festlegung                                                                                   |
| -------------- | ------------ | ------- | -------------------------------------------------------------------------------------------- |
| `id`           | string       | ja      | Stabile, eindeutige ID; ändert sich nie                                                      |
| `slug`         | string       | ja      | Nur `a–z`, `0–9`, `-` (z. B. `aurora`, `mia-rose`); eindeutig; keine Zeiten, „kopie“, Emojis |
| `name`         | string       | ja      | Nur der Name, 1–40 Zeichen; keine Zusätze wie „Neu“ oder Uhrzeiten                           |
| `isNew`        | boolean      | nein    | „Neu im Haus“ (VyceON entscheidet, empfohlen: erste Schicht vor ≤ 14 Tagen)                  |
| `isBack`       | boolean      | nein    | „Wieder da“ (empfohlen: nach ≥ 60 Tagen Pause zurück)                                        |
| `gender`       | string       | nein    | Standard `female`                                                                            |
| `languages`    | string[]     | nein    | ISO-639-1-Codes, klein: `de`, `en`, `ro`                                                     |
| `origin`       | string       | nein    | ISO-3166-1-alpha-2-Code, groß: `DE`, `RO`                                                    |
| `heightCm`     | integer      | nein    | Körpergröße in cm (120–230)                                                                  |
| `cupSize`      | string       | nein    | Körbchengröße als Text, z. B. `C`                                                            |
| `shoeSize`     | number       | nein    | EU-Schuhgröße (30–50)                                                                        |
| `weightKg`     | number       | nein    | Gewicht in kg (30–200)                                                                       |
| `services`     | Service[]    | nein    | Siehe unten; Reihenfolge = Anzeige                                                           |
| `personalNote` | Text (DE/EN) | nein    | Persönlicher Text, siehe unten                                                               |
| `images`       | Bild[]       | nein    | Siehe Abschnitt 5; erstes Bild = Titelbild                                                   |
| `updatedAt`    | Zeitpunkt    | ja      | Letzte Änderung am Profil (für die Sitemap)                                                  |

Die Website zeigt Name, Bilder, Sprachen, Herkunft, Maße, Services und den
persönlichen Text. Telefonnummern, echte Namen, Adressen oder Kontaktdaten der
Mieterinnen gehören **nicht** in die Schnittstelle.

### Zweisprachige Texte

`personalNote` und jeder Eintrag in `services` sind Objekte mit `de` (Pflicht)
und `en` (optional). Fehlt `en`, zeigt die englische Website den deutschen Text.

```json
"personalNote": { "de": "Ich liebe lange Abende mit Musik.", "en": "I love long evenings with music." },
"services": [{ "id": "massage", "de": "Massage", "en": "Massage" }]
```

`services[].id` ist optional, aber empfohlen: ein stabiler Schlüssel aus einer
festen Liste in VyceON (z. B. `massage`, `tabledance`).

### Schicht

| Feld        | Typ       | Pflicht | Festlegung             |
| ----------- | --------- | ------- | ---------------------- |
| `id`        | string    | ja      | Stabile ID der Schicht |
| `profileId` | string    | ja      | `id` des Profils       |
| `start`     | Zeitpunkt | ja      | Beginn                 |
| `end`       | Zeitpunkt | ja      | Ende, nach `start`     |

### Anwesenheit

| Feld        | Typ       | Pflicht | Festlegung       |
| ----------- | --------- | ------- | ---------------- |
| `profileId` | string    | ja      | `id` des Profils |
| `since`     | Zeitpunkt | ja      | Check-in         |
| `until`     | Zeitpunkt | nein    | Geplantes Ende   |

## 5. Bilder

| Feld     | Typ     | Pflicht | Festlegung                                                    |
| -------- | ------- | ------- | ------------------------------------------------------------- |
| `url`    | string  | ja      | Absolute `https`-URL auf **einem** festen Bild-Host           |
| `width`  | integer | ja      | Breite in Pixeln (verhindert Layout-Sprünge)                  |
| `height` | integer | ja      | Höhe in Pixeln                                                |
| `alt`    | string  | nein    | Bildbeschreibung (Deutsch); sonst nutzt die Website den Namen |

- **Host:** ein fester Hostname (z. B. `img.vyceon.example`). Er wird auf der
  Website als `VYCEON_IMAGE_HOST` eingetragen; andere Hosts werden nicht geladen.
- **Format:** JPEG oder WebP, Hochformat 3:4 empfohlen, mindestens 1200 px an
  der langen Seite. Die Website erzeugt selbst passende Größen und AVIF/WebP.
- **Reihenfolge:** wie im Array; das erste Bild ist das Titelbild.
- **Metadaten:** EXIF und GPS vor der Auslieferung entfernen.
- **Aufrufbar** ohne Anmeldung (nicht ratbare URLs sind ausreichend). Bei
  Änderung eines Bildes eine neue URL vergeben, damit Caches nicht das alte zeigen.

## 6. Webhook (VyceON → Website)

Bei jeder Änderung schickt VyceON einen Webhook. Die Website aktualisiert dann
nur die betroffenen Daten, statt bis zu 5 Minuten zu warten.

**Adresse:** `POST https://www.mona-roses.com/api/revalidate`

**Header:**

| Header               | Inhalt                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| `Content-Type`       | `application/json`                                                        |
| `X-Vyceon-Timestamp` | Unix-Zeit in Sekunden beim Versand                                        |
| `X-Vyceon-Signature` | `sha256=` + HMAC-SHA256 als Hex (klein) über `"<timestamp>.<roher Body>"` |
| `X-Vyceon-Event-Id`  | Wie `id` im Body (optional, für Logs)                                     |

Das gemeinsame Geheimnis (`VYCEON_WEBHOOK_SECRET`, mindestens 32 Zeichen) wird
einmalig zwischen VyceON und dem Betreiber der Website ausgetauscht. Die Website
lehnt Webhooks ab, deren Zeitstempel mehr als 5 Minuten abweicht.

**Body:**

```json
{
  "id": "evt_01JB7Q2W8M",
  "type": "profile.updated",
  "occurredAt": "2026-10-24T18:01:12+02:00",
  "data": {
    "profileId": "prf_8f3k2",
    "slug": "aurora",
    "previousSlug": "aurora-berlin"
  }
}
```

**Ereignisse:**

| `type`                                                  | Wann                                      | `data`                                              |
| ------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `profile.created`, `profile.updated`, `profile.deleted` | Profil neu, geändert, unsichtbar/gelöscht | `profileId`, `slug`, bei Umbenennung `previousSlug` |
| `shift.created`, `shift.updated`, `shift.deleted`       | Schicht neu, geändert, abgesagt           | `profileId`                                         |
| `presence.checkin`, `presence.checkout`                 | Check-in, Check-out                       | `profileId`, `slug`                                 |

Ein unbekannter `type` ist erlaubt: Die Website aktualisiert dann alle Daten.

**Antworten der Website:** `200` = verarbeitet; `401` = Signatur oder Zeit
falsch (nicht wiederholen, Konfiguration prüfen); `400` = Body ungültig;
`503` = Webhook auf der Website noch nicht eingerichtet.

**Wiederholung:** Bei Netzwerkfehlern, Zeitüberschreitung (10 s) oder `5xx`
wiederholt VyceON mit wachsendem Abstand (z. B. 1 min, 5 min, 30 min, 2 h) bis
zu 24 Stunden. Ein Webhook darf mehrfach ankommen; die Website verarbeitet ihn
dann einfach erneut.

Beispiele: [`webhook-profile-updated.json`](vyceon-beispiele/webhook-profile-updated.json),
[`webhook-presence-checkin.json`](vyceon-beispiele/webhook-presence-checkin.json).
Ein Test von der Kommandozeile steht in der [README](../README.md#webhook-einrichten).

## 7. Last und Caching

Die Website fragt VyceON nicht bei jedem Seitenaufruf, sondern hält die Daten
zwischen:

| Daten       | Höchstens alle | Zusätzlich                      |
| ----------- | -------------- | ------------------------------- |
| Profile     | 5 Minuten      | nach jedem `profile.*`-Webhook  |
| Schichten   | 5 Minuten      | nach jedem `shift.*`-Webhook    |
| Anwesenheit | 60 Sekunden    | nach jedem `presence.*`-Webhook |

Das sind im Normalbetrieb wenige Requests pro Minute. VyceON sollte für den
Website-Schlüssel mindestens **120 Requests pro Minute** erlauben.

## 8. Abnahme

1. VyceON stellt eine **Testumgebung** mit fiktiven Profilen, Schichten und
   Anwesenheit bereit (Basis-URL, Schlüssel, Club-ID, Bild-Host).
2. Die Website wird mit `DATA_SOURCE=vyceon` gegen die Testumgebung gestartet;
   die Antworten werden mit den Beispielen in `vyceon-beispiele/` verglichen.
3. VyceON schickt je einen Webhook pro Ereignistyp; die Website antwortet mit
   `200` und zeigt die Änderung sofort.
4. Danach Umstellung auf die Produktiv-Zugangsdaten.
