import { Readable } from "node:stream";
import { isKnownVideo } from "@/lib/data";
import { getCachedVideo, readVideo } from "@/lib/video-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const notFound = () => new Response(null, { status: 404 });

/**
 * Liefert ein Profil- oder Story-Video aus dem eigenen Zwischenspeicher, in
 * Abschnitten (Range) – so können Browser spulen und iOS spielt überhaupt ab.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID.test(id) || !(await isKnownVideo(id))) return notFound();
  const video = await getCachedVideo(id);
  if (!video) return notFound();

  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  let start = 0;
  let end = video.size - 1;
  if (match && (match[1] || match[2])) {
    if (match[1]) {
      start = Number(match[1]);
      if (match[2]) end = Math.min(Number(match[2]), end);
    } else {
      // "bytes=-500": die letzten 500 Bytes
      start = Math.max(0, video.size - Number(match[2]));
    }
    if (start > end || start >= video.size)
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${video.size}` },
      });
  }
  const partial = Boolean(match);
  return new Response(
    Readable.toWeb(readVideo(video, start, end)) as ReadableStream,
    {
      status: partial ? 206 : 200,
      headers: {
        "Content-Type": video.type,
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes",
        ...(partial
          ? { "Content-Range": `bytes ${start}-${end}/${video.size}` }
          : {}),
        // kurz im Browser halten; zurückgezogene Videos verschwinden zügig
        "Cache-Control": "private, max-age=600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
