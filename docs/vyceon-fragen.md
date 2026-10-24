# VyceON – offene Punkte

Die Schnittstelle ist festgelegt: [`vyceon-schnittstelle.md`](vyceon-schnittstelle.md)
(OpenAPI: [`vyceon-api.yaml`](vyceon-api.yaml), Beispiele:
[`vyceon-beispiele/`](vyceon-beispiele/)). Die früheren Fragen zu
Authentifizierung, Endpunkten, Feldern, Bildern und Webhooks sind dort
beantwortet. Offen ist nur noch, was VyceON liefern oder bestätigen muss.

Bitte Antworten direkt hier eintragen.

## Von VyceON zu liefern

- [ ] Bestätigung, dass die Spezifikation v1 so umgesetzt wird (oder Änderungswünsche)
- [ ] Testumgebung mit fiktiven Daten: Basis-URL, Schlüssel, Club-ID
- [ ] Bild-Host der Testumgebung und der Produktion (→ `VYCEON_IMAGE_HOST`)
- [ ] Webhook-Geheimnis austauschen (mind. 32 Zeichen, sicherer Kanal)
- [ ] Produktiv-Zugangsdaten zum Livegang
- [ ] Ansprechpartner und Wartungsfenster

## Vom Betreiber zu entscheiden

- [ ] Festlegung „Neu“ / „Wieder da“: Reichen die Empfehlungen (14 bzw. 60 Tage)?
- [ ] Service-Liste: Welche Services sollen in VyceON zur Auswahl stehen
      (mit deutschem und englischem Namen)?
- [ ] Alte Produkt-Slugs der Altseite den neuen VyceON-Slugs zuordnen
      (`redirects/products.json`, siehe README)
