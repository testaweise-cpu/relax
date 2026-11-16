import { getDataSource } from "@/lib/data";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Nur die beiden Größen, die die Bordell-API nennt (Kachel, Sedcard) */
const SIZES = new Set(["480x640", "1200x1600"]);

const notFound = () => new Response(null, { status: 404 });

/**
 * Sedcard-Foto ohne VYCE69-Wasserzeichen. Der Server holt es mit dem
 * Schlüssel des Hauses bei der Bordell-API und liefert es selbst aus – der
 * Schlüssel verlässt nie den Server. Ausgeliefert wird nur ein Foto, das zur
 * genannten Sedcard gehört, sonst könnte jede erfundene Kennung eine Anfrage
 * an die API auslösen und deren Kontingent aufbrauchen.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const q = new URL(request.url).searchParams;
  const size = `${q.get("w")}x${q.get("h")}`;
  if (!SLUG.test(slug) || !UUID.test(id) || !SIZES.has(size)) return notFound();

  const ds = getDataSource();
  const profile = await ds.getProfile(slug);
  const local = `/api/foto/${slug}/${id}?`;
  if (!profile?.images.some((img) => img.url.startsWith(local)))
    return notFound();

  const [w, h] = size.split("x").map(Number);
  const res = await ds.fetchPhoto(id, w, h).catch(() => null);
  const type = res?.headers.get("content-type") ?? "";
  if (!res?.ok || !type.startsWith("image/")) return notFound();
  return new Response(res.body, {
    headers: {
      "Content-Type": type,
      // kurz halten: ein zurückgezogenes Foto verschwindet nach wenigen Minuten
      "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
