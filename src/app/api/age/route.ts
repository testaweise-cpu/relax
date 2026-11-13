import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE_MAX_AGE, AGE_GATE, sameOriginTarget } from "@/lib/age-gate";

/**
 * Rückfall ohne JavaScript: Das Formular der Altersabfrage schickt hierher.
 * Setzt das Cookie und leitet auf die vorherige Seite (nur gleiche Herkunft) zurück.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const target = sameOriginTarget(
    String(form.get("return") ?? "/"),
    request.url,
  );
  // Relativ weiterleiten: Im Container ist request.url die interne Adresse
  // (0.0.0.0:3000), eine absolute Location würde den Browser dorthin schicken.
  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: target.pathname + target.search },
  });
  res.cookies.set(AGE_GATE.cookieName, AGE_GATE.cookieValue, {
    maxAge: AGE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    httpOnly: false, // wird auch im Browser gelesen (kein Inhalt, nur "1")
  });
  return res;
}
