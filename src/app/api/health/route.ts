// Einfacher Health-Check für Docker/Coolify.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, time: new Date().toISOString() });
}
