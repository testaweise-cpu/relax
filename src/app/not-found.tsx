import Link from "next/link";

// Fallback für Pfade außerhalb von [locale] (z. B. Dateien ohne Treffer).
export default function GlobalNotFound() {
  return (
    <html lang="de">
      <body
        style={{
          background: "#0e0709",
          color: "#fbeef1",
          fontFamily: "system-ui",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <h1>404 – Seite nicht gefunden</h1>
        <p>
          <Link href="/" style={{ color: "#ffc46b" }}>
            Zur Startseite
          </Link>
        </p>
      </body>
    </html>
  );
}
