import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Breite/Höhe eines JPEG/PNG/WebP aus /public lesen (nur Header), damit Raster
 * das richtige Seitenverhältnis bekommen – ohne Layout-Sprung.
 */
const cache = new Map<string, { width: number; height: number }>();

export function imageSize(publicPath: string): {
  width: number;
  height: number;
} {
  const hit = cache.get(publicPath);
  if (hit) return hit;
  let size = { width: 4, height: 3 };
  try {
    const buf = readFileSync(join(process.cwd(), "public", publicPath));
    size = parse(buf) ?? size;
  } catch {
    /* Standard 4:3 */
  }
  cache.set(publicPath, size);
  return size;
}

function parse(b: Buffer): { width: number; height: number } | null {
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47)
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  // WebP (VP8X / VP8 / VP8L)
  if (
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X")
      return {
        width: 1 + b.readUIntLE(24, 3),
        height: 1 + b.readUIntLE(27, 3),
      };
    if (chunk === "VP8 ")
      return {
        width: b.readUInt16LE(26) & 0x3fff,
        height: b.readUInt16LE(28) & 0x3fff,
      };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }
  // JPEG: SOFn-Marker suchen
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      ) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return null;
}
