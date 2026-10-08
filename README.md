# Mona Roses 2.0

Relaunch von mona-roses.com: Zimmervermietung mit Bar und Tabledance in
Berlin-Steglitz, rund um die Uhr geöffnet.

- **Technik:** Next.js 16 (App Router, `output: "standalone"`), React 19,
  TypeScript (strict), Tailwind CSS 4, next-intl (DE ohne Präfix, EN unter
  `/en`), Keystatic als Redaktionssystem, zod, Nodemailer.
- **Daten:** Sedcards, Schichten und Anwesenheit kommen aus VyceON (Vyce69).
  Bis die API steht, liefert eine Mock-Quelle fiktive Profile. Umschalten per
  `DATA_SOURCE`, ohne Codeänderung.
- **Ohne Fremdanbieter:** kein Tracking, keine externen Skripte oder
  Schriften. Schriften liefert die Seite selbst aus.
- **Betrieb:** ein Docker-Container (Node 22), z. B. auf einem eigenen Server
  mit Coolify. Nicht auf Vercel/Netlify ausgelegt.

Weitere Dokumente:

| Datei                                            | Inhalt                                        |
| ------------------------------------------------ | --------------------------------------------- |
| [`docs/redaktion.md`](docs/redaktion.md)         | Anleitung für die Redaktion (Keystatic)       |
| [`docs/offene-fragen.md`](docs/offene-fragen.md) | Offene Fragen an den Kunden                   |
| [`docs/vyceon-fragen.md`](docs/vyceon-fragen.md) | Offene Fragen an das VyceON-Team              |
| [`src/content/todos.md`](src/content/todos.md)   | Widersprüche aus den Altinhalten (als `TODO`) |

---

## Inhalt

1. [Entwicklung](#entwicklung)
2. [Umgebungsvariablen](#umgebungsvariablen)
3. [Deployment mit Docker](#deployment-mit-docker)
4. [Datenquelle und VyceON-Webhook](#datenquelle-und-vyceon-webhook)
5. [Keystatic (Redaktionssystem)](#keystatic-redaktionssystem)
6. [Betrieb](#betrieb)
7. [Checkliste für den Livegang](#checkliste-für-den-livegang)

---

## Entwicklung

Voraussetzungen: Node.js 22, pnpm (über Corepack).

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000 · Redaktion unter /keystatic
```

| Befehl                  | Zweck                                                      |
| ----------------------- | ---------------------------------------------------------- |
| `pnpm dev`              | Entwicklungsserver                                         |
| `pnpm build`            | Produktions-Build (`.next/standalone`)                     |
| `pnpm start`            | Produktions-Build starten                                  |
| `pnpm lint`             | ESLint                                                     |
| `pnpm typecheck`        | Routen-Typen erzeugen und TypeScript prüfen                |
| `pnpm format`           | Prettier (`format:check` nur prüfen)                       |
| `pnpm test`             | Unit-Tests (Vitest)                                        |
| `pnpm test:e2e`         | Browser-Tests (Playwright) – startet selbst `pnpm start`   |
| `pnpm lighthouse [URL]` | Lighthouse mobil für die Hauptseiten (Standard: localhost) |
| `pnpm check`            | Lint, Typen und Unit-Tests in einem Durchgang              |

### Browser-Tests

`pnpm test:e2e` braucht einen Produktions-Build (`pnpm build`). Gegen einen
laufenden Server oder Container: `E2E_BASE_URL=http://localhost:3000 pnpm
test:e2e`. Ein vorhandenes Chromium nutzt `PW_CHROMIUM_PATH=/pfad/zu/chromium`,
sonst einmalig `pnpm exec playwright install chromium`.

Geprüft werden u. a.: alle Hauptseiten in DE und EN, Barrierefreiheit (axe,
WCAG 2.1 AA), Altersabfrage, Weiterleitungen der Altseite, Bewerbungsformular,
Live-Anwesenheit, reduzierte Bewegung, kein seitliches Scrollen auf dem Handy,
keine externen Requests.

### Projektstruktur

```
src/app/[locale]/        Seiten (DE/EN), API-Routen unter src/app/api
src/components/          UI-Bausteine, Layout, Sedcards, Altersabfrage …
src/content/             Inhalte aus Keystatic (JSON) – von der Redaktion gepflegt
src/lib/data/            Datenschicht: Mock- und VyceON-Quelle, Webhook
src/lib/time/            Zeitlogik in Europe/Berlin (Schichten, „heute 16–24 Uhr“)
src/messages/            Feste Oberflächentexte DE/EN (next-intl)
src/proxy.ts             Weiterleitungen der Altseite und Sprach-Routing
keystatic.config.ts      Felder und Bereiche des Redaktionssystems
redirects/products.json  Alte Produkt-URLs → neue Sedcards
public/media, /images    Video und Fotos (aus der Altseite übernommen)
public/mock/             Fiktive Platzhalterbilder der Mock-Profile
```

Die Styleguide-Seite `/styleguide` zeigt alle Bausteine des Designs (nicht
indexiert).

---

## Umgebungsvariablen

Vorlage mit Kommentaren: [`.env.example`](.env.example). Serverseitige Werte
werden beim Start mit zod geprüft (`src/lib/env.ts`); ein ungültiger Wert
bricht den Start mit einer klaren Meldung ab. Leere Werte gelten als „nicht
gesetzt“.

**Build** = wird beim `docker build` als Build-Argument übergeben und ins Image
eingebettet. **Laufzeit** = wird beim Start des Containers gesetzt.

| Variable                                | Wann     | Pflicht                 | Bedeutung                                                                        |
| --------------------------------------- | -------- | ----------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                  | Build    | ja                      | Öffentliche Adresse, z. B. `https://www.mona-roses.com` (Canonical, Sitemap, OG) |
| `VYCEON_IMAGE_HOST`                     | Build    | bei VyceON              | Hostname der VyceON-Profilbilder, für die Bildoptimierung freigegeben            |
| `NEXT_PUBLIC_KEYSTATIC_STORAGE`         | Build    | –                       | `local` (Standard) oder `github`                                                 |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`     | Build    | bei `github`            | Repository als `owner/repo`                                                      |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Build    | bei `github`            | Name der GitHub-App (siehe Keystatic)                                            |
| `DATA_SOURCE`                           | Laufzeit | –                       | `mock` (Standard) oder `vyceon`                                                  |
| `VYCEON_API_URL`                        | Laufzeit | bei `vyceon`            | Basis-URL der API                                                                |
| `VYCEON_API_KEY`                        | Laufzeit | bei `vyceon`            | API-Schlüssel                                                                    |
| `VYCEON_CLUB_ID`                        | Laufzeit | bei `vyceon`            | Kennung von Mona Roses bei VyceON                                                |
| `VYCEON_WEBHOOK_SECRET`                 | Laufzeit | für den Webhook         | Gemeinsames Geheimnis, mind. 16 Zeichen (`openssl rand -hex 32`)                 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Laufzeit | fürs Bewerbungsformular | Mailserver; `SMTP_SECURE=true` bei Port 465, sonst `false` (STARTTLS)            |
| `SMTP_USER`, `SMTP_PASS`                | Laufzeit | je nach Server          | Zugangsdaten                                                                     |
| `SMTP_FROM`                             | Laufzeit | fürs Bewerbungsformular | Absender, z. B. `"Mona Roses Website <noreply@mona-roses.com>"`                  |
| `JOBS_MAIL_TO`                          | Laufzeit | fürs Bewerbungsformular | Empfänger der Bewerbungen                                                        |
| `RATE_LIMIT_PER_HOUR`                   | Laufzeit | –                       | Bewerbungen pro IP und Stunde (Standard 5)                                       |
| `TRUST_PROXY`                           | Laufzeit | –                       | `true` (Standard): Client-IP aus dem letzten `X-Forwarded-For`-Eintrag           |
| `KEYSTATIC_GITHUB_CLIENT_ID`            | Laufzeit | bei `github`            | GitHub-App                                                                       |
| `KEYSTATIC_GITHUB_CLIENT_SECRET`        | Laufzeit | bei `github`            | GitHub-App                                                                       |
| `KEYSTATIC_SECRET`                      | Laufzeit | bei `github`            | Zufallswert für die Admin-Sitzung                                                |

Ohne SMTP startet die Seite trotzdem. Das Bewerbungsformular zeigt dann einen
Hinweis und verweist auf Telefon und E-Mail.

---

## Deployment mit Docker

Das [`Dockerfile`](Dockerfile) baut in drei Stufen (Abhängigkeiten → Build →
schlankes Laufzeit-Image mit Node 22 Alpine) und startet den Standalone-Server
als unprivilegierter Benutzer auf Port 3000.

```bash
docker build -t mona-roses \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.mona-roses.com \
  .

docker run -d --name mona-roses --restart unless-stopped \
  --env-file .env.production \
  -p 3000:3000 mona-roses
```

- **Internet beim Build:** `next/font` lädt die Google-Schriften einmalig beim
  Build herunter. Im Betrieb gibt es keine Requests zu Google. Bricht der Build
  mit `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` ab,
  war der Download kurz gestört: den Build einfach erneut starten.
- **Healthcheck:** `GET /api/health` liefert `{"ok":true,…}`. Er ist im Image
  hinterlegt (`HEALTHCHECK`, berücksichtigt `PORT`) und eignet sich auch für
  Coolify oder Uptime-Monitore.
- **Reverse Proxy:** TLS übernimmt der Proxy davor (z. B. Traefik in Coolify).
  `TRUST_PROXY=true` setzt voraus, dass genau **ein** Proxy den Header
  `X-Forwarded-For` ergänzt. Bei mehreren Proxys oder direktem Betrieb ohne
  Proxy `TRUST_PROXY=false` setzen.
- **Eine Instanz:** Daten-Cache und Rate-Limit liegen im Container. Für diese
  Seite reicht eine Instanz. Bei mehreren Instanzen wären ein gemeinsamer
  Cache und ein gemeinsames Rate-Limit nötig.
- **Kein Volume nötig:** Inhalte und Bilder aus Keystatic sind Teil des Images.
  Der Cache in `.next/cache` darf bei jedem Deployment verloren gehen.
- **Upload-Größe:** Das Bewerbungsformular nimmt bis zu 3 Fotos à 8 MB an. Ein
  Proxy davor muss Anfragen bis ca. 26 MB durchlassen.

### Coolify

1. Neue Ressource → „Dockerfile“ aus diesem Repository, Branch `main`.
2. Port `3000`, Healthcheck-Pfad `/api/health`.
3. Build-Variablen: `NEXT_PUBLIC_SITE_URL` und ggf. `VYCEON_IMAGE_HOST` und
   `NEXT_PUBLIC_KEYSTATIC_*`. In Coolify bei diesen Variablen
   „Build Variable“ anhaken.
4. Laufzeit-Variablen: alle übrigen aus der Tabelle oben.
5. Domains `mona-roses.com` und `www.mona-roses.com` eintragen. Die Domain ohne
   `www` leitet auf die mit `www` um (oder umgekehrt, passend zu
   `NEXT_PUBLIC_SITE_URL`).
6. Automatisches Deployment bei Push aktivieren. Das braucht der GitHub-Modus
   von Keystatic, damit Änderungen der Redaktion live gehen.

### Build hinter einem Firmen-Proxy

Muss der Build über einen Proxy mit eigener Zertifizierungsstelle laufen,
dürfen deren Zertifikate nicht ins Image. Stattdessen eine Kopie des
Dockerfiles verwenden, die in den Stufen `deps` und `build` das CA-Zertifikat
über einen benannten Build-Kontext einbindet
(`COPY --from=ca ca.crt …` und `ENV NODE_EXTRA_CA_CERTS=…`). Diese Kopie wird
mit `--build-context ca=/pfad --network host` und den Proxy-Variablen als
Build-Argumente gebaut. So wurde das Image auch in der Entwicklungsumgebung
geprüft.

---

## Datenquelle und VyceON-Webhook

`DATA_SOURCE=mock` liefert 11 fiktive Profile mit Schichten relativ zur
aktuellen Uhrzeit. Fotos und Namen sind erfunden, keine echten Personen.
`DATA_SOURCE=vyceon` holt die echten Daten (`src/lib/data/vyceon-source.ts`).

Viele Details der VyceON-API sind noch **Annahmen** und mit `ANNAHME`
markiert: Endpunkte, Felder, Ereignisnamen, Signaturformat. Die zugehörigen
Fragen stehen in [`docs/vyceon-fragen.md`](docs/vyceon-fragen.md). Sobald die
API dokumentiert ist, werden nur `vyceon-source.ts` und `webhook.ts`
angepasst. Die Seiten bleiben unverändert.

### Aktualität und Cache

| Daten       | Cache       | Cache-Tag                    |
| ----------- | ----------- | ---------------------------- |
| Profile     | 5 Minuten   | `profiles`, `profile:<slug>` |
| Schichten   | 5 Minuten   | `shifts`                     |
| Anwesenheit | 60 Sekunden | `presence`                   |

Ist VyceON nicht erreichbar, zeigt die Seite den letzten erfolgreichen Stand.
Die Seite „Jetzt da“ fragt `/api/presence` alle 60 Sekunden neu ab, aber nur,
solange der Tab sichtbar ist.

Profile ohne Schicht in den nächsten 30 Tagen bleiben erreichbar, sind aber
`noindex` und nicht in der Sitemap.

### Webhook einrichten

Damit Änderungen sofort sichtbar sind (statt nach bis zu 5 Minuten), schickt
VyceON bei jeder Änderung einen Webhook:

- **Adresse:** `POST https://www.mona-roses.com/api/revalidate`
- **Geheimnis:** `VYCEON_WEBHOOK_SECRET` (auf beiden Seiten gleich, mind. 16
  Zeichen). Ohne Geheimnis antwortet der Endpunkt mit `503`.
- **Header `X-Vyceon-Timestamp`:** Unix-Zeit in Sekunden. Darf höchstens
  5 Minuten abweichen, als Schutz gegen wiederholte Anfragen.
- **Header `X-Vyceon-Signature`:** `sha256=` + HMAC-SHA256 als Hex über
  `<timestamp>.<roher Body>`.
- **Body (JSON):** `{"type": "<ereignis>", "data": {"slug": "…"}}`

| Ereignis (`type`)                       | Geleert                            |
| --------------------------------------- | ---------------------------------- |
| `profile.*` (z. B. `profile.updated`)   | Profilliste und betroffene Profile |
| `shift.*`                               | Schichten                          |
| `presence.*`, `checkin.*`, `checkout.*` | Anwesenheit                        |
| unbekannt                               | alles                              |

Antworten: `200 {"revalidated":[…]}`, `401` bei falscher oder veralteter
Signatur, `400` bei ungültigem JSON.

Test von der Kommandozeile:

```bash
SECRET=…            # wie VYCEON_WEBHOOK_SECRET
TS=$(date +%s)
BODY='{"type":"presence.updated"}'
SIG="sha256=$(printf '%s.%s' "$TS" "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.* //')"
curl -i -X POST https://www.mona-roses.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-Vyceon-Timestamp: $TS" -H "X-Vyceon-Signature: $SIG" \
  --data "$BODY"
```

---

## Keystatic (Redaktionssystem)

Keystatic speichert Inhalte als Dateien im Repository (`src/content`,
Bilder unter `public/images`). Es gibt keine Datenbank. Die Anleitung für die
Redaktion steht in [`docs/redaktion.md`](docs/redaktion.md).

| Modus              | Wo landen Änderungen?                    | Admin `/keystatic`                        |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| `local` (Standard) | direkt als Dateien im Arbeitsverzeichnis | nur in der Entwicklung (`pnpm dev`)       |
| `github`           | als Commit im GitHub-Repository          | auch in Produktion, Anmeldung über GitHub |

Im lokalen Modus ist der Admin in Produktion bewusst abgeschaltet
(`404`). Änderungen würden sonst im Container landen und beim nächsten
Deployment verloren gehen.

### GitHub-Modus einrichten (einmalig)

1. Lokal `.env.local` mit `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` und
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo` anlegen, `pnpm dev` starten
   und `http://localhost:3000/keystatic` öffnen.
2. Keystatic führt durch das Anlegen einer **GitHub-App** und schreibt
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET` und `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` in
   `.env.local`.
3. In den Einstellungen der GitHub-App die Callback-URL der Produktion
   ergänzen: `https://www.mona-roses.com/api/keystatic/github/oauth/callback`.
4. Die App im Repository installieren und den Redakteurinnen und Redakteuren
   Schreibrechte auf das Repository geben.
5. Alle vier Werte und `NEXT_PUBLIC_KEYSTATIC_*` im Deployment setzen (die
   `NEXT_PUBLIC_*` als Build-Variablen) und neu bauen.

Danach gilt: Speichern in `/keystatic` erzeugt einen Commit, der Commit löst
das Deployment aus, nach ein bis zwei Minuten ist die Änderung live.

---

## Betrieb

### Weiterleitungen der Altseite

Die Weiterleitungen sind in `src/proxy.ts` bzw. `src/lib/legacy-redirects.ts`
festgelegt und mit Tests abgesichert:

| Alte Adresse                                                | Neu                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `/product/<alt>`                                            | `/mieterinnen/<neu>` laut `redirects/products.json`, sonst `/mieterinnen` |
| `/product-category/…`, `/m/mieterinnen`, `/m/miet`, `/shop` | `/mieterinnen`                                                            |
| `/anwesenheit`                                              | `/jetzt-da`                                                               |
| `/events-news`                                              | `/events`                                                                 |
| `/warenkorb`, `/kasse`, `/mein-konto`, `/dolls`             | `/`                                                                       |
| `/feed`, `/wp-*`                                            | `410 Gone`                                                                |
| Schrägstrich am Ende (`/preise/`)                           | ohne (`/preise`)                                                          |

Alle Weiterleitungen sind `301`.

**Produkt-Slugs:** `node scripts/export-old-product-slugs.mjs` liest die 53
alten Produkt-URLs der Altseite aus und schreibt
`redirects/products.todo.json`. Die Datei ist nicht im Repository, weil sie
echte Namen enthält. Sobald die VyceON-Slugs feststehen, die Zuordnung
`alt → neu` in `redirects/products.json` unter `map` eintragen. Fehlt ein
Eintrag, leitet die Seite auf `/mieterinnen` um.

### Altersabfrage

- Beim ersten Besuch erscheint ein Overlay. Die Bestätigung setzt das Cookie
  `age_ok` für 30 Tage. Konstanten stehen in `src/lib/age-gate.ts`.
- Ohne JavaScript funktioniert die Bestätigung als Formular an `/api/age`.
- Impressum und Datenschutz sind ohne Bestätigung lesbar.
- **Die rechtliche Prüfung nach JMStV steht aus** (siehe offene Fragen).

### Sicherheit

- Header: HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy` und `Permissions-Policy` (`next.config.ts`).
- Bewerbungsformular: Prüfung mit zod auf dem Server, Rate-Limit pro IP,
  Honeypot-Feld, Dateityp- und Größenprüfung der Fotos. Die Fotos werden nur
  per Mail versendet und nicht gespeichert.
- Webhook: HMAC-Signatur mit Zeitstempel, Vergleich in konstanter Zeit.

### Logs

Der Container schreibt nach stdout/stderr (`docker logs mona-roses`).
Erwähnenswert:

- `[webhook] abgelehnt: …`: falsche Signatur oder Uhrzeit.
- `[vyceon] … fehlgeschlagen`: API nicht erreichbar oder Fehler. Die Seite
  zeigt dann den letzten Stand.
- `[vyceon] Profil "…" ungültig` bzw. `[data] … übersprungen`: ein Datensatz
  passt nicht zum erwarteten Format. Er wird ausgelassen, der Rest erscheint.
- `[jobs] …`: SMTP fehlt oder der Versand einer Bewerbung ist fehlgeschlagen.

### Updates

Abhängigkeiten aktualisieren mit `pnpm update --interactive --latest`, danach
`pnpm check`, `pnpm build` und `pnpm test:e2e`. Bei Next.js-Updates die
Hinweise in `node_modules/next/dist/docs/` beachten (siehe `AGENTS.md`).

### Leistung messen

Nach jedem größeren Update und vor dem Livegang:

```bash
pnpm lighthouse https://www.mona-roses.com
```

Stand Phase 8 (Mobil, erster Besuch, simuliertes langsames 4G):

| Bereich          | Ergebnis                                        |
| ---------------- | ----------------------------------------------- |
| Leistung         | 85–95 je nach Seite (Startseite 89, Galerie 95) |
| Barrierefreiheit | 100 auf allen Hauptseiten                       |
| Best Practices   | 100                                             |
| SEO              | 100                                             |
| CLS              | 0–0,013                                         |
| LCP (simuliert)  | 2,9–3,8 s                                       |

Den größten Teil der LCP-Zeit macht das Grundgerüst von React und Next.js
aus. Ohne JavaScript läge LCP bei 2,3 s. Echte Messwerte von Besuchern sind
meist besser als die Simulation.

---

## Checkliste für den Livegang

- [ ] Offene Fragen in `docs/offene-fragen.md` und `src/content/todos.md`
      geklärt. Danach sind alle `TODO(…)` in den Inhalten ersetzt (`grep -rn
"TODO(" src/content`).
- [ ] Impressum und Datenschutzerklärung rechtlich geprüft und vollständig
      (Anbieter, USt-IdNr., Hosting, Jugendschutzbeauftragte/r).
- [ ] Altersabfrage nach JMStV geprüft.
- [ ] `NEXT_PUBLIC_SITE_URL` stimmt mit der Hauptdomain überein (mit oder ohne
      `www`), die andere Domain leitet um.
- [ ] SMTP eingerichtet, Testbewerbung kommt an (auch mit Foto).
- [ ] VyceON: `DATA_SOURCE=vyceon`, Zugangsdaten, `VYCEON_IMAGE_HOST` (Build),
      Webhook eingerichtet und mit dem `curl`-Beispiel getestet.
- [ ] `redirects/products.json` mit den alten Produkt-Slugs befüllt.
- [ ] Keystatic im GitHub-Modus eingerichtet, Redaktion eingewiesen
      (`docs/redaktion.md`).
- [ ] Healthcheck und Uptime-Monitor auf `/api/health`.
- [ ] Nach dem Umschalten der Domain: Stichproben alter URLs (z. B.
      `/anwesenheit/`, `/product/…`), `robots.txt`, `sitemap.xml`, die
      Sitemap in der Google Search Console einreichen.
- [ ] `pnpm lighthouse https://www.mona-roses.com` und Sichtprüfung auf
      einem echten Handy.
