import Link from "next/link";

// Fallback für Pfade außerhalb von [locale] (z. B. Dateien ohne Treffer).
export default function GlobalNotFound() {
  return (
    <html lang="de">
      <body
        style={{
          background: "#0d0b1e",
          color: "#ece8ff",
          fontFamily: "system-ui",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <h1>404 – Seite nicht gefunden</h1>
        <p>
          <Link href="/" style={{ color: "#22e4ff" }}>
            Zur Startseite
          </Link>
        </p>
      </body>
    </html>
  );
}
