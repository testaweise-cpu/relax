import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDataSource } from "@/lib/data";

/**
 * Videos der Gegenseite liegen einmal auf der eigenen Platte und werden von
 * dort an die Besucher:innen ausgeliefert. Jede Anfrage einzeln durchzureichen
 * würde das Kontingent des API-Schlüssels aufbrauchen (ein Video = mehrere
 * Abschnitte je Abruf) und mit ihm die Sedcard-Abfragen lahmlegen.
 */
const DIR = join(tmpdir(), "mona-roses-video");
/** Größere Videos zeigt die Website nicht (kurze Clips sind gemeint). */
const MAX_BYTES = 80 * 1024 * 1024;
/** So lange gilt eine Datei ungeprüft; danach fragt die Website einmal nach. */
const RECHECK_MS = 30 * 60 * 1000;

export type CachedVideo = { path: string; size: number; type: string };

const pending = new Map<string, Promise<CachedVideo | null>>();

const fileFor = (id: string, type: string) =>
  join(DIR, `${id}.${type === "video/webm" ? "webm" : "mp4"}`);

async function existing(
  id: string,
): Promise<(CachedVideo & { age: number }) | null> {
  for (const type of ["video/mp4", "video/webm"]) {
    const path = fileFor(id, type);
    const s = await stat(path).catch(() => null);
    if (s?.isFile() && s.size > 0)
      return { path, size: s.size, type, age: Date.now() - s.mtimeMs };
  }
  return null;
}

/** Holt das ganze Video in Abschnitten ab (die Gegenseite begrenzt jeden). */
async function download(id: string): Promise<CachedVideo | null> {
  const ds = getDataSource();
  const chunks: Buffer[] = [];
  let total = Infinity;
  let type = "video/mp4";
  let got = 0;
  while (got < total) {
    const res = await ds.fetchVideo(id, `bytes=${got}-`);
    if (!res || (res.status !== 206 && res.status !== 200)) return null;
    type = res.headers.get("content-type")?.split(";")[0] ?? type;
    if (type !== "video/mp4" && type !== "video/webm") return null;
    const range = /\/(\d+)$/.exec(res.headers.get("content-range") ?? "");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return null;
    total = range ? Number(range[1]) : buf.length;
    if (total > MAX_BYTES) return null;
    chunks.push(buf);
    got += buf.length;
  }
  await mkdir(DIR, { recursive: true });
  const path = fileFor(id, type);
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, Buffer.concat(chunks));
  await rename(tmp, path);
  return { path, size: got, type };
}

/** Darf das Video noch gezeigt werden? Eine kleine Anfrage genügt. */
async function stillAllowed(id: string): Promise<boolean | null> {
  try {
    const res = await getDataSource().fetchVideo(id, "bytes=0-0");
    if (!res) return false;
    if (res.status === 206 || res.status === 200) return true;
    // 404: zurückgezogen (gemeldet, Story abgelaufen, Sedcard nicht mehr öffentlich)
    return res.status === 404 ? false : null;
  } catch {
    return null; // Gegenseite nicht erreichbar: vorerst weiter ausliefern
  }
}

export async function getCachedVideo(id: string): Promise<CachedVideo | null> {
  const hit = await existing(id);
  if (hit && hit.age < RECHECK_MS) return hit;
  const running = pending.get(id);
  if (running) return running;
  const job = (async () => {
    if (hit) {
      const allowed = await stillAllowed(id);
      if (allowed === false) {
        await rm(hit.path, { force: true });
        return null;
      }
      const now = new Date();
      await utimes(hit.path, now, now).catch(() => {});
      return hit;
    }
    return download(id);
  })()
    .catch((error) => {
      console.error("[video] Abruf fehlgeschlagen:", error);
      return hit;
    })
    .finally(() => pending.delete(id));
  pending.set(id, job);
  return job;
}

export function readVideo(video: CachedVideo, start: number, end: number) {
  return createReadStream(video.path, { start, end });
}
