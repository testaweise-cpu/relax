# VyceON-Anbindung: VYCE69 Bordell-Sync API v1

Die Website holt Mieterinnen (Sedcards) und Live-Status aus der
**VYCE69 Bordell-Sync API v1**. Die Beschreibung unten folgt der Doku im
VYCE69-Dashboard. Umgesetzt ist sie in `src/lib/data/vyceon-source.ts`,
getestet in `src/lib/data/vyceon-source.test.ts`.

Eine frühere Wunsch-Spezifikation (eigene Endpunkte für Schichten,
Anwesenheit und Webhooks) ist damit überholt und entfernt.

## Was die Website braucht

| Anzeige                   | Quelle                                   |
| ------------------------- | ---------------------------------------- |
| Mieterinnen (Liste)       | Sedcard-Liste                            |
| Profilseite               | Sedcard-Detail                           |
| Schichtplan, „heute noch“ | Zeitplanung im Sedcard-Detail            |
| **Live / „Jetzt da“**     | **berechnet: wer gerade in Schicht ist** |

## API

- **Basis-URL:** `https://vyce69.com/api/v1` (`VYCEON_API_URL`)
- **Authentifizierung:** Header `Authorization: Bearer vyc_live_…`, nie im
  Query-String. Scope `bordell:sedcards:read`, Organisation wird pro Request
  geprüft. Schlüssel gelten nur für aktuelle Owner/Manager und laufen nach
  **365 Tagen** ab. Der Rohschlüssel wird nur einmal angezeigt.
- **Nur serverseitig:** Der Schlüssel gehört nur in die Server-Umgebung
  (`VYCEON_API_KEY`), nie in Browser-Code, HTML, Analytics oder Fehlerlogs.
  Die Website ruft die API ausschließlich auf dem Server ab.
- **Inhalt:** nur veröffentlichte, nicht gelöschte Sedcards, die dem Studio
  fest oder als aktiver Gast zugeordnet sind.

### Endpunkte

`GET /bordells/{organizationId}/sedcards`

- Parameter: `page`, `per_page` (1–100), `search`, `order=newest|name`
- Antwort: Einträge plus Paginierung
- Die Website lädt alle Seiten mit `per_page=100&order=name`.

`GET /bordells/{organizationId}/sedcards/{slug-or-id}`

- Bio, Ort, Verfügbarkeit, 16-Gruppen-Serviceauswahl, „Service für“,
  „Auch mit“, Sprachen, freigegebene Kontakte, **Zeitplanung** und
  freigegebene Bilder

### Fehler

Form: `{"success":false,"error":"code"}`

| Status | Bedeutung                         | Website                          |
| ------ | --------------------------------- | -------------------------------- |
| 400    | ungültige Parameter               | Ausfall → letzter Stand          |
| 401    | Schlüssel ungültig                | Ausfall → letzter Stand          |
| 403    | Scope oder Organisationsrecht weg | Ausfall → letzter Stand          |
| 404    | Profil nicht freigegeben          | Profilseite 404, keine Schichten |
| 429    | Ratenlimit                        | Ausfall → letzter Stand          |
| 503    | Ratenbegrenzung nicht verfügbar   | Ausfall → letzter Stand          |

`success:false` gilt auch bei Status 200 als Fehler.

## Wie die Website abruft

- **Profile:** alle Seiten der Liste, Cache 5 Minuten.
- **Schichten:** das Detail jeder Sedcard (höchstens 4 gleichzeitig),
  Cache 5 Minuten. Bei 30 Mieterinnen sind das rund 30 Abrufe alle
  5 Minuten, plus Profilseiten nach Bedarf.
- **Live:** bei jeder Anfrage aus den Schichten berechnet: `Beginn ≤ jetzt <
Ende`. Der Status wechselt dadurch genau zu Schichtbeginn und -ende.
- **Ausfall:** letzter erfolgreicher Stand; Schichten höchstens 6 Stunden.
- **Webhooks:** bietet VYCE69 nicht. Änderungen erscheinen nach spätestens
  5 Minuten.

## Zuordnung der Felder

> TODO(VyceON): Die Feldnamen der Antworten stehen nicht in der Doku. Sie
> werden mit der ersten echten Antwort festgelegt, und zwar nur in
> `fromApiProfile` und `fromApiSchedule` in `src/lib/data/vyceon-source.ts`.

| Website                      | VYCE69 (zu bestätigen)                                                    |
| ---------------------------- | ------------------------------------------------------------------------- |
| `id`, `slug`, `name`         | ?                                                                         |
| `languages`                  | Sprachen                                                                  |
| `services` (Name DE/EN)      | 16-Gruppen-Serviceauswahl                                                 |
| `personalNote`               | Bio                                                                       |
| `images` (URL, Breite, Höhe) | freigegebene Bilder                                                       |
| `isNew`, `isBack`            | ? (sonst aus `newest` bzw. leer)                                          |
| Schichten (`start`, `end`)   | Zeitplanung                                                               |
| –                            | Ort, Verfügbarkeit, Kontakte, „Service für“, „Auch mit“ (nicht angezeigt) |

Freigegebene Kontakte zeigt die Website bewusst nicht an. Gebucht wird über
das Haus.

## Voraussetzungen für den Livebetrieb

- `/api/v1/` darf **nicht** hinter der Basic-Auth (Traefik) vor vyce69.com
  liegen. Basic-Auth und API-Schlüssel nutzen denselben
  `Authorization`-Header, ein Request kann nur eines davon senden.
- Bild-Host der freigegebenen Bilder (`VYCEON_IMAGE_HOST`, beim Build).
- Schlüssel vor Ablauf (365 Tage) erneuern.
