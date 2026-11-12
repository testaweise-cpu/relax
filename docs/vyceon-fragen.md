# VyceON – offene Punkte

Angebunden ist die VYCE69 Bordell-Sync API v1, siehe
[`vyceon-schnittstelle.md`](vyceon-schnittstelle.md).

Bitte Antworten direkt hier eintragen.

## Vom Betreiber zu erledigen

- [ ] Den bereits offengelegten Sync-Schlüssel widerrufen und einen neuen anlegen
      (nur über ein sicheres Formular weitergeben, nie im Chat)
- [ ] `organizationId` von Mona Roses
- [ ] `/api/v1/` von der Basic-Auth (Traefik) vor vyce69.com ausnehmen
- [ ] Erinnerung: Schlüssel läuft nach 365 Tagen ab
- [ ] Alte Produkt-Slugs der Altseite den neuen Slugs zuordnen
      (`redirects/products.json`, siehe README)

## Mit der ersten echten Antwort zu klären

- [ ] Feldnamen von Liste und Detail (Zuordnung, siehe Schnittstelle)
- [ ] Format der Zeitplanung: einzelne Schichten mit Beginn/Ende oder
      Wochenmuster? Zeitzone?
- [ ] Wie wird „Neu“ / „Wieder da“ abgebildet?
- [ ] Gibt es englische Texte (Bio, Services)?
- [ ] Bild-Host und Bildmaße (`VYCEON_IMAGE_HOST`)
- [ ] Wie heißt der Paginierungsblock (`total_pages`, `has_more` …)?
