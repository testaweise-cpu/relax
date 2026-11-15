import { readFile, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Nachgestellte Gegenseite: liefert ein Video in Abschnitten von 4 Bytes,
// so wie die Bordell-API jeden Abschnitt begrenzt.
const VIDEO = Buffer.from("0123456789abcdef!");
let calls: string[] = [];
let upstream: (range?: string) => Response | null = () => null;

vi.mock("@/lib/data", () => ({
  getDataSource: () => ({
    fetchVideo: async (_id: string, range?: string) => {
      calls.push(range ?? "");
      return upstream(range);
    },
  }),
}));

function chunked(range?: string) {
  const start = Number(/bytes=(\d+)-/.exec(range ?? "")?.[1] ?? 0);
  const end = Math.min(start + 3, VIDEO.length - 1);
  return new Response(new Uint8Array(VIDEO.subarray(start, end + 1)), {
    status: 206,
    headers: {
      "content-type": "video/mp4",
      "content-range": `bytes ${start}-${end}/${VIDEO.length}`,
    },
  });
}

const DIR = join(tmpdir(), "mona-roses-video");
const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

describe("Video-Zwischenspeicher", () => {
  beforeEach(async () => {
    calls = [];
    upstream = chunked;
    await rm(DIR, { recursive: true, force: true });
  });

  it("setzt das Video aus Abschnitten zusammen und fragt danach nicht erneut", async () => {
    const { getCachedVideo } = await import("./video-cache");
    const video = await getCachedVideo(id(1));
    expect(video?.size).toBe(VIDEO.length);
    expect(video?.type).toBe("video/mp4");
    expect(await readFile(video!.path)).toEqual(VIDEO);
    expect(calls).toEqual([
      "bytes=0-",
      "bytes=4-",
      "bytes=8-",
      "bytes=12-",
      "bytes=16-",
    ]);
    calls = [];
    expect((await getCachedVideo(id(1)))?.size).toBe(VIDEO.length);
    expect(calls).toEqual([]);
  });

  it("lädt bei gleichzeitigen Abrufen nur einmal", async () => {
    const { getCachedVideo } = await import("./video-cache");
    const [a, b] = await Promise.all([
      getCachedVideo(id(2)),
      getCachedVideo(id(2)),
    ]);
    expect(a?.size).toBe(VIDEO.length);
    expect(b?.size).toBe(VIDEO.length);
    expect(calls.filter((c) => c === "bytes=0-")).toHaveLength(1);
  });

  it("liefert nichts, wenn die Gegenseite das Video nicht herausgibt", async () => {
    upstream = () => new Response(null, { status: 404 });
    const { getCachedVideo } = await import("./video-cache");
    expect(await getCachedVideo(id(3))).toBeNull();
  });

  it("verwirft ein zurückgezogenes Video bei der nächsten Nachfrage", async () => {
    const { getCachedVideo } = await import("./video-cache");
    const video = await getCachedVideo(id(4));
    // Datei künstlich altern lassen: älter als die Frist zur Nachfrage
    const old = new Date(Date.now() - 2 * 3600000);
    await utimes(video!.path, old, old);
    upstream = () => new Response(null, { status: 404 });
    expect(await getCachedVideo(id(4))).toBeNull();
    await expect(readFile(video!.path)).rejects.toThrow();
  });

  it("liefert weiter aus, wenn die Gegenseite gerade nicht erreichbar ist", async () => {
    const { getCachedVideo } = await import("./video-cache");
    const video = await getCachedVideo(id(5));
    const old = new Date(Date.now() - 2 * 3600000);
    await utimes(video!.path, old, old);
    upstream = () => {
      throw new Error("Zeitüberschreitung");
    };
    expect((await getCachedVideo(id(5)))?.size).toBe(VIDEO.length);
  });

  it("nimmt nur Videos an", async () => {
    upstream = () =>
      new Response("<html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    const { getCachedVideo } = await import("./video-cache");
    expect(await getCachedVideo(id(6))).toBeNull();
  });
});
