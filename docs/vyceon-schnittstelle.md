# VyceON-Anbindung: VYCE69 Bordell-Sync API v1

Die Website holt Mieterinnen (Sedcards) und Live-Status aus der
**VYCE69 Bordell-Sync API v1**. Die Beschreibung unten folgt der Doku im
VYCE69-Dashboard. Umgesetzt ist sie in `src/lib/data/vyceon-source.ts`,
getestet in `src/lib/data/vyceon-source.test.ts`.

Eine frühere Wunsch-Spezifikation (eigene Endpunkte für Schichten,
Anwesenheit und Webhooks) ist damit überholt und entfernt.

## Was die Website braucht

| Anzeige               | Quelle                                 |
| --------------------- | -------------------------------------- |
| Mieterinnen (Liste)   | Sedcard-Liste                          |
| Profilseite           | Sedcard-Detail                         |
| **Live / „Jetzt da“** | **`in_house` in der Sedcard-Liste**    |
| Schichtplan           | entfällt (VYCE69 liefert keine Zeiten) |

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

- **Liste und Live:** alle Seiten der Liste, Cache 60 Sekunden, also rund
  60 Abrufe pro Stunde (Limit des Schlüssels: 1000 pro Stunde).
- **Profilseite:** Sedcard-Detail, Cache 5 Minuten.
- **Live:** `in_house: true`. Seit wann jemand da ist, liefert die API nicht;
  die Website zeigt dann „jetzt im Haus“.
- **Ausfall:** letzter erfolgreicher Stand; Live-Status höchstens 15 Minuten.
- **Webhooks:** bietet VYCE69 nicht. Änderungen erscheinen nach spätestens
  1 Minute (Liste) bzw. 5 Minuten (Profilseite).

## Zuordnung der Felder

Stand 11/2026, geprüft an den echten Antworten. Umgesetzt in
`fromApiProfile` und `fromApiPresence` (`src/lib/data/vyceon-source.ts`).

| Website        | VYCE69                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `id`                                                                                                                                              |
| `slug`, `name` | `slug`, `name`                                                                                                                                    |
| `languages`    | `languages` (deutsche Namen → ISO-Code, z. B. „Englisch“ → en)                                                                                    |
| `services`     | `services[].services[]` (alle Gruppen, ohne Doppelte)                                                                                             |
| `personalNote` | `about_text`, sonst `tagline` (nur Deutsch)                                                                                                       |
| `images`       | Detail: `media[]` (`url`, `width`, `height`)                                                                                                      |
|                | Liste: `thumbnail_url`, Maße aus `?w=…&h=…`                                                                                                       |
| `isNew`        | `published_at` vor höchstens 14 Tagen                                                                                                             |
| `isBack`       | – (immer nein)                                                                                                                                    |
| `updatedAt`    | `updated_at`                                                                                                                                      |
| Live           | `in_house`; Zustand aus `presence_state` (`ready` → verfügbar, sonst „im Haus, gerade beschäftigt“); Beginn aus `in_house_since`, falls geliefert |

**Eckdaten:** Die Website
liest ein Objekt `attributes` im Sedcard-Detail: `age`, `height_cm`,
`weight_kg`, `cup_size`, `shoe_size`, `clothing_size`, `hair_color`,
`eye_color`, `body_type`, `intimate_hair`, `tattoos`, `piercings`, `origin`
(ISO-Code) bzw. `nationality`. Weitere Felder darin werden mit ihrem
Feldnamen als Beschriftung angezeigt. Ein `age` unter 18 macht das Profil
ungültig, es erscheint dann nicht. Stand 11/2026 geprüft: `age`, `height_cm`,
`cup_size` (z. B. „75B“), `clothing_size`, `eye_color`, `tattoos` und
`piercings` (Text) sind bei allen 34 Sedcards gefüllt, `hair_color` und
`shoe_size` bei 33, `body_type` und `intimate_hair` bei einer. Gewicht und
Nationalität hat VYCEON nicht; leere Zeilen blendet der Steckbrief aus.

Nicht verwendet: `availability`, `schedule` (meist leer oder Freitext),
`category`, `city`, `location`, `permalink`, `alsoWith`, `serviceFor`,
`internalMessaging` und `contacts`. Freigegebene Kontakte zeigt die Website
bewusst nicht an. Gebucht wird über das Haus.

## Voraussetzungen für den Livebetrieb

- `/api/v1/` darf **nicht** hinter der Basic-Auth (Traefik) vor vyce69.com
  liegen. Basic-Auth und API-Schlüssel nutzen denselben
  `Authorization`-Header, ein Request kann nur eines davon senden.
- `/api/img` (Bilder) ebenfalls ohne Basic-Auth erreichbar.
- `VYCEON_IMAGE_HOST=vyce69.com` beim Build (freigegeben ist nur der Pfad
  `/api/img`).
- Schlüssel vor Ablauf (365 Tage) erneuern.
