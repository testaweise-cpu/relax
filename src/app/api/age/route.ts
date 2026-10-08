import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE_MAX_AGE, AGE_GATE } from "@/lib/age-gate";

/**
 * Rückfall ohne JavaScript: Das Formular der Altersabfrage schickt hierher.
 * Setzt das Cookie und leitet auf die vorherige Seite (nur gleiche Herkunft) zurück.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const back = String(form.get("return") ?? "/");
  const target = back.startsWith("/") && !back.startsWith("//") ? back : "/";
  const res = NextResponse.redirect(new URL(target, request.url), 303);
  res.cookies.set(AGE_GATE.cookieName, AGE_GATE.cookieValue, {
    maxAge: AGE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    httpOnly: false, // wird auch im Browser gelesen (kein Inhalt, nur "1")
  });
  return res;
}
