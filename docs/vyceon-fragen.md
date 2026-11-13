# VyceON – offene Punkte

Angebunden ist die VYCE69 Bordell-Sync API v1, siehe
[`vyceon-schnittstelle.md`](vyceon-schnittstelle.md).

Bitte Antworten direkt hier eintragen.

## Vom Betreiber zu erledigen

- [ ] Schlüssel „Mona Roses Webseite“ läuft am 12.11.2027 ab: vorher erneuern
- [ ] Empfehlung: Der aktuelle Schlüssel wurde im Klartext weitergegeben.
      Vor dem Livegang einen neuen anlegen und nur in der Server-Umgebung
      hinterlegen.
- [ ] Alte Produkt-Slugs der Altseite den neuen Slugs zuordnen
      (`redirects/products.json`, siehe README)

## Erledigt

- [x] `organizationId`, Schlüssel, `/api/v1/` und `/api/img` ohne Basic-Auth
- [x] Bild-URLs mit öffentlichem Host und Bildmaßen
- [x] Feldzuordnung (siehe Schnittstelle)

## Noch offen bei VYCE69

- [x] `in_house: true` für alle Eingecheckten, `presence_state` (`ready`, `on_site`)
- [ ] Alle Werte von `presence_state` bestätigen (bisher gesehen: `ready`, `on_site`)
- [ ] Sedcard „Alexia“ fehlt in der API, obwohl im Dashboard „Im Haus“
- [ ] Eckdaten im Feld `attributes` ausgeben (Größe, BH-Größe, Alter usw.,
      siehe Schnittstelle); der Steckbrief zeigt sie dann automatisch
- [ ] Optional: `in_house_since` befüllen, dann zeigt die Website „seit 18 Uhr“
- [ ] Optional: Schichtzeiten in `schedule` (Beginn/Ende), dann kommt der
      Wochenplan zurück
- [ ] Optional: englische Bio
