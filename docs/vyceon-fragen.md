# Offene Punkte zur VyceON-Schnittstelle

Die VyceON-API wird parallel gebaut. Alle Annahmen der Website stehen in
`src/lib/data/vyceon-source.ts` (markiert mit `// ANNAHME:`). Diese Liste
wird in Phase 3 ausführlich ergänzt.

## Authentifizierung

- Bearer-Token im Header `Authorization: Bearer <VYCEON_API_KEY>` – korrekt?
- Ist der Schlüssel pro Club oder global? Ablauf/Rotation?

## Endpunkte (Annahme)

- `GET /clubs/:clubId/profiles`
- `GET /clubs/:clubId/profiles/:slug`
- `GET /clubs/:clubId/shifts?from=&to=`
- `GET /clubs/:clubId/presence`

## Webhooks

- Welche Ereignisse (Profil geändert, Schicht geändert, Check-in/Check-out)?
- Format der Signatur (HMAC-SHA256 über den Roh-Body? Header-Name? Zeitstempel gegen Replay?)

## Bilder

- Von welcher Domain werden Bilder ausgeliefert? Welche Größen/Formate?
- Liefert die API Breite/Höhe und Alt-Texte mit?
