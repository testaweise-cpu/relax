import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Open-Graph-Bilder im Neon-Stil (1200×630), gerendert mit next/og.
 * Schriften liegen lokal unter src/assets/fonts – keine externen Requests.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), "src/assets/fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "MrDafoe-Regular.ttf")),
  readFile(join(fontDir, "BigShoulders-SemiBold.ttf")),
  readFile(join(fontDir, "IBMPlexMono-Medium.ttf")),
]);

const C = {
  night: "#0d0b1e",
  night2: "#15122e",
  ink: "#ece8ff",
  muted: "#a39dc9",
  pink: "#ff2e97",
  cyan: "#22e4ff",
  sunset: "#ff8a3d",
  violet: "#8a5cff",
  sun: "#ffd84d",
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
  const horizon = 168; // Höhe des Bodens
  const sun = 300;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `linear-gradient(180deg, ${C.night} 0%, ${C.night2} 55%, #2a1550 100%)`,
        fontFamily: "Shoulders",
        color: C.ink,
      }}
    >
      {/* Sonne mit Streifen (Streifen = Balken in Himmelfarbe) */}
      <div
        style={{
          position: "absolute",
          left: 600 - sun / 2,
          top: 630 - horizon - sun * 0.78,
          width: sun,
          height: sun,
          borderRadius: sun,
          background: `linear-gradient(180deg, ${C.sun} 0%, ${C.sunset} 45%, ${C.pink} 80%)`,
          boxShadow: `0 0 80px ${C.pink}`,
          opacity: 0.9,
          display: "flex",
        }}
      />
      {[0.48, 0.58, 0.67, 0.75].map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 600 - sun / 2 - 10,
            top: 630 - horizon - sun * 0.78 + sun * t,
            width: sun + 20,
            height: 6 + i * 3,
            background: "#22164a",
            display: "flex",
          }}
        />
      ))}
      {/* Boden mit Fluchtlinien */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: horizon,
          background: `linear-gradient(180deg, #1f1240, ${C.night})`,
          display: "flex",
        }}
      />
      {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: 600,
            top: 630 - horizon,
            width: 2,
            height: horizon * 1.9,
            background: `${C.cyan}66`,
            transformOrigin: "top center",
            transform: `rotate(${k * 13}deg)`,
            display: "flex",
          }}
        />
      ))}
      {[22, 52, 92, 145].map((y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 0,
            top: 630 - horizon + y,
            width: "100%",
            height: 2,
            background: `${C.pink}88`,
            display: "flex",
          }}
        />
      ))}
      {/* Horizont */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 630 - horizon,
          width: "100%",
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.pink} 20%, #fff 50%, ${C.pink} 80%, transparent)`,
          boxShadow: `0 0 18px ${C.pink}`,
          display: "flex",
        }}
      />

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
              color: C.cyan,
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
            color: "#ffe9f4",
            textShadow: neon(C.pink),
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
              color: C.cyan,
              border: `2px solid ${C.cyan}88`,
              borderRadius: 999,
              padding: "6px 20px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 12,
                background: C.cyan,
                boxShadow: `0 0 10px ${C.cyan}`,
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
