import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Open-Graph-Bilder im Rotlicht-Neon-Stil (1200×630), gerendert mit next/og.
 * Schriften liegen lokal unter src/assets/fonts – keine externen Requests.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), "src/assets/fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "MrDafoe-Regular.ttf")),
  readFile(join(fontDir, "BigShoulders-SemiBold.ttf")),
  readFile(join(fontDir, "IBMPlexMono-Medium.ttf")),
]);

// Werte wie die Design-Tokens in globals.css
const C = {
  ink: "#fbeef1",
  muted: "#c9a5ae",
  red: "#ff2d55",
  gold: "#ffc46b",
  sunset: "#ff8a3d",
};

const neon = (color: string) =>
  `0 0 2px #fff, 0 0 10px ${color}, 0 0 24px ${color}, 0 0 48px ${color}`;

export async function ogImage({
  script = "Mona Roses",
  eyebrow,
  title,
  footer,
  badge,
}: {
  script?: string;
  eyebrow?: string;
  title?: string;
  footer?: string;
  badge?: string;
}) {
  const [dafoe, shoulders, mono] = await fonts;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background:
          "linear-gradient(180deg, #0b0610 0%, #16070f 55%, #2a0614 100%)",
        fontFamily: "Shoulders",
        color: C.ink,
      }}
    >
      {/* Rotlicht: Schein von unten, unscharfe Lichtpunkte */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(150,10,40,0.6) 78%, rgba(255,31,61,0.55) 100%)",
          display: "flex",
        }}
      />
      {[
        [90, 150, 140, C.red],
        [1060, 120, 180, C.red],
        [980, 420, 120, C.sunset],
        [230, 450, 110, C.red],
      ].map(([x, y, d, c], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (x as number) - (d as number) / 2,
            top: (y as number) - (d as number) / 2,
            width: d as number,
            height: d as number,
            borderRadius: d as number,
            background: `radial-gradient(circle, ${c}77 0%, transparent 70%)`,
            display: "flex",
          }}
        />
      ))}

      {/* Inhalt */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 46,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {eyebrow && (
          <div
            style={{
              fontFamily: "Mono",
              fontSize: 24,
              letterSpacing: 8,
              color: C.gold,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontFamily: "Dafoe",
            fontSize: script.length > 12 ? 130 : 150,
            color: "#ffe3ea",
            textShadow: neon(C.red),
            transform: "rotate(-4deg)",
            marginTop: 6,
            display: "flex",
          }}
        >
          {script}
        </div>
        {title && (
          <div
            style={{
              fontSize: 44,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginTop: 4,
              display: "flex",
            }}
          >
            {title}
          </div>
        )}
        {badge && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "Mono",
              fontSize: 24,
              color: C.gold,
              border: `2px solid ${C.gold}88`,
              borderRadius: 999,
              padding: "6px 20px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: C.gold,
                boxShadow: `0 0 10px ${C.gold}`,
                display: "flex",
              }}
            />
            {badge}
          </div>
        )}
      </div>
      {footer && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            fontFamily: "Mono",
            fontSize: 22,
            letterSpacing: 4,
            color: C.muted,
          }}
        >
          {footer}
        </div>
      )}
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Dafoe", data: dafoe, weight: 400, style: "normal" },
        { name: "Shoulders", data: shoulders, weight: 600, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
