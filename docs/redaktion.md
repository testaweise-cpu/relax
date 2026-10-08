# Redaktionsanleitung (Keystatic)

Diese Anleitung erklärt, wie Sie Texte, Preise, Events und Fotos auf
mona-roses.com selbst ändern. Technische Kenntnisse sind nicht nötig.

## Auf einen Blick

| Was                                                           | Wo wird es gepflegt?                                |
| ------------------------------------------------------------- | --------------------------------------------------- |
| Kontaktdaten, Öffnungszeiten, Anfahrt                         | Keystatic → **Kontakt & Öffnungszeiten**            |
| Startseite (Untertitel, Vorstellung, Highlights)              | Keystatic → **Startseite**                          |
| Zimmerpreise                                                  | Keystatic → **Zimmerpreise**                        |
| Jobs-Seite (Texte, Mindestalter, Vorteile)                    | Keystatic → **Jobs**                                |
| Häufige Fragen                                                | Keystatic → **FAQ**                                 |
| Events und Neuigkeiten                                        | Keystatic → **Events & News**                       |
| Raumfotos                                                     | Keystatic → **Galerie**                             |
| Rechtlicher Hinweis („keine sexuellen Dienstleistungen“)      | Keystatic → **Rechtlicher Hinweis**                 |
| Impressum, Datenschutzerklärung                               | Keystatic → **Impressum**, **Datenschutzerklärung** |
| **Mieterinnen, Fotos der Mieterinnen, Schichten, „Jetzt da“** | **VyceON** – nicht in Keystatic                     |
| Feste Texte der Oberfläche (Menü, Buttons, Formular)          | Entwickler (Datei `src/messages`)                   |

## Anmelden

1. `https://www.mona-roses.com/keystatic` öffnen.
2. Mit dem GitHub-Konto anmelden, das freigeschaltet wurde. Falls Sie noch
   keins haben, bitte beim Entwickler melden.
3. Links erscheint das Menü mit den Bereichen **Allgemein**, **Seiten**,
   **Inhalte** und **Rechtstexte**.

## Grundregeln

- **Speichern heißt veröffentlichen.** Nach dem Klick auf **Speichern** ist
  die Änderung nach etwa ein bis zwei Minuten auf der Website sichtbar. Einen
  Entwurfsmodus gibt es nicht. Längere Texte daher am besten vorher in Ruhe
  fertig schreiben.
- **Deutsch ist Pflicht, Englisch optional.** Fast jedes Feld gibt es zweimal,
  „(DE)“ links und „(EN)“ rechts. Ist das englische Feld leer, zeigt die
  englische Seite den deutschen Text. Bitte trotzdem beide pflegen.
- **Alles ist rückgängig zu machen.** Jede Speicherung wird mit Datum
  archiviert. Wenn etwas schiefgeht, kann der Entwickler jeden früheren Stand
  wiederherstellen.
- **Die Website spricht die Gäste mit „du“ an.** Bitte in neuen Texten
  beibehalten.
- **Markierungen `TODO(…)`** stehen an Stellen, die noch mit Ihnen geklärt
  werden müssen, z. B. `Hindenburgdamm TODO(74/76)`. Ersetzen Sie die
  Markierung durch die richtige Angabe, sobald sie feststeht.

## Die Bereiche im Einzelnen

### Kontakt & Öffnungszeiten

Diese Angaben erscheinen an vielen Stellen: Kontaktseite, Fußzeile,
Anruf-Button auf dem Handy, Startseite und die Angaben für Google.

- **Telefon (Anzeige)** so, wie es auf der Seite stehen soll, z. B.
  `030 832 29 067`.
- **Telefon für tel:-Links** im internationalen Format **ohne Leerzeichen**:
  `+49`, dann die Nummer ohne die erste 0. Aus `030 832 29 067` wird also
  `+493083229067`. Diese Nummer wählt das Handy beim Tippen auf „Anrufen“.
- Gleiches gilt für die Nummer für **Bewerbungen/Vermietung**.
- **Link zu Google Maps:** in Google Maps auf „Teilen“ → „Link kopieren“.

### Startseite

- **Hero: Untertitel** steht direkt unter dem großen Schriftzug. Kurz halten,
  eine Zeile auf dem Handy.
- **Kurzvorstellung** ist der erste Textabschnitt unter dem Hero. Absätze
  entstehen durch eine Leerzeile.
- **Highlights** sind die drei Bildkacheln. Pro Kachel: Titel, kurzer Text
  (ein bis zwei Sätze), Bild und **Bildbeschreibung** (siehe „Fotos“ unten).
  Am besten genau drei Kacheln, damit das Raster aufgeht.

### Zimmerpreise

- Pro Zeile **Dauer in Minuten** und **Preis in Euro** (nur Zahlen, ohne
  „Min“ oder „€“). Die Einheiten ergänzt die Seite selbst, auf Deutsch und
  Englisch.
- Die Zeilen erscheinen in der Reihenfolge, in der sie hier stehen. Die
  Reihenfolge lässt sich durch Ziehen am Griff links ändern.
- Die Tabelle steht auf der Preisseite und verkürzt auf der Startseite.

### Jobs

- **Mindestalter für Bewerbungen:** Das Bewerbungsformular prüft das Alter
  danach.
- **Was wir bieten:** eine Liste kurzer Punkte.
- **Weitere Informationen (Links):** Linktext und Adresse.

Bewerbungen aus dem Formular kommen per E-Mail an die hinterlegte Adresse.
Fotos hängen an der Mail und werden auf der Website nicht gespeichert.

### FAQ

Jede Frage ist ein eigener Eintrag.

- **Seite** legt fest, wo die Frage erscheint: **Preise**, **Jobs** oder
  **Allgemein**. Allgemeine Fragen erscheinen auf der Kontaktseite.
- **Reihenfolge:** kleinere Zahl = weiter oben (z. B. 10, 20, 30; dann lässt
  sich später etwas dazwischenschieben).
- **Interner Name** wird nur in Keystatic angezeigt.

### Events & News

- **Datum** ist Pflicht. Events ab heute erscheinen oben unter „Demnächst“,
  vergangene darunter. Das nächste Event wird zusätzlich auf der Startseite
  angekündigt.
- **Uhrzeit** ist optional und frei formulierbar, z. B. „ab 20 Uhr“.
- **URL-Name** wird aus dem Titel vorgeschlagen und muss nicht geändert werden.
- **Bild** ist optional.

### Galerie

- **Bereich:** „Zimmer & Suiten“ oder „Bar & Club“.
- **Reihenfolge** wie bei den FAQ.
- Ein Bild löschen: Eintrag öffnen → Menü oben rechts → **Löschen**.

### Rechtlicher Hinweis

Der Satz, dass Mona Roses selbst keine sexuellen Dienstleistungen anbietet,
wird **nur hier** gepflegt und erscheint automatisch auf allen Seiten. Bitte
nur nach Rücksprache mit der rechtlichen Beratung ändern.

- **Kurzfassung:** Fußzeile jeder Seite und Preisbereich der Startseite.
- **Langfassung:** Preisseite.

### Impressum und Datenschutzerklärung

Diese Texte haben einen kleinen Editor mit Formatierungen:

- **Fett** und _kursiv_ über die Leiste oder `Strg`/`Cmd` + `B` bzw. `I`.
- **Zwischenüberschriften** über das Format-Menü der Leiste.
- **Link:** Text markieren → Link-Symbol → Adresse einfügen, bei E-Mails mit
  `mailto:` davor, z. B. `mailto:info@mona-roses.com`.
- **Neuer Absatz:** `Enter`. **Zeilenumbruch** ohne neuen Absatz (z. B. in
  einer Adresse): `Umschalt` + `Enter`.

Maßgeblich ist die deutsche Fassung. Die englische ist eine Übersetzung zur
Information. Änderungen bitte nur nach rechtlicher Prüfung.

## Fotos

- **Format:** JPG oder WebP, Querformat oder Hochformat. Am besten mindestens
  **1600 Pixel** an der längeren Seite und höchstens etwa **3 MB**. Die Website
  verkleinert und komprimiert die Bilder automatisch für jedes Gerät.
- **Bildbeschreibung (Alt-Text):** Ein kurzer Satz, der beschreibt, was zu
  sehen ist, z. B. „Zimmer mit Barockspiegel und rotem Licht“. Er wird blinden
  Menschen vorgelesen und hilft bei Google. Nicht „Bild 1“ oder nur Stichworte.
- **Keine erkennbaren Personen ohne schriftliche Einwilligung.** Fotos der
  Mieterinnen gehören nicht in die Galerie. Sie kommen über VyceON auf die
  Profile.
- **Standortdaten:** Handyfotos enthalten oft den Aufnahmeort (GPS). Vor dem
  Hochladen am besten entfernen, z. B. am iPhone beim Teilen über „Optionen“ →
  „Ort“ ausschalten.

## Mieterinnen und „Jetzt da“

Profile, Fotos, Sprachen, Schichten und die Anwesenheit kommen automatisch aus
**VyceON**. Änderungen dort erscheinen auf der Website innerhalb weniger
Sekunden bis höchstens fünf Minuten. In Keystatic gibt es dafür nichts zu tun.

Profile ohne Schicht in den nächsten 30 Tagen bleiben erreichbar, erscheinen
aber nicht bei Google.

## Wenn etwas nicht klappt

| Problem                                         | Lösung                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Änderung ist nach 5 Minuten noch nicht sichtbar | Seite im Browser neu laden (am Handy: Tab schließen und neu öffnen). Sonst Entwickler informieren. |
| Speichern geht nicht, Feld ist rot markiert     | Pflichtfeld (meist „(DE)“) ist leer oder ungültig.                                                 |
| Anmeldung funktioniert nicht                    | GitHub-Konto beim Entwickler freischalten lassen.                                                  |
| Versehentlich etwas gelöscht                    | Nichts weiter ändern und den Entwickler bitten, den alten Stand wiederherzustellen.                |
