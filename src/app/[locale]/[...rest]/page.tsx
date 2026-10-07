import { notFound } from "next/navigation";

// Fängt unbekannte Pfade innerhalb einer Sprache ab, damit die
// sprachspezifische not-found-Seite gerendert wird.
export default function CatchAll() {
  notFound();
}
