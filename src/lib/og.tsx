import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Open-Graph-Bilder (1200×630), gerendert mit next/og: Logo bzw. Name auf
 * warmem Schwarz, feine Linien in Champagner.
 * Schriften liegen lokal unter src/assets/fonts – keine externen Requests.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = join(process.cwd(), "src/assets/fonts");
const fonts = Promise.all([
  readFile(join(fontDir, "CormorantGaramond-MediumItalic.ttf")),
  readFile(join(fontDir, "Jost-Medium.ttf")),
]);
// Bildmarke als Data-URL (2075 × 698 im Original, hier 1600 px breit)
const logo = readFile(join(process.cwd(), "public/logo/mona-roses.png")).then(
  (b) => `data:image/png;base64,${b.toString("base64")}`,
);
const LOGO_RATIO = 2075 / 698;

// Werte wie die Design-Tokens in globals.css
const C = {
  night: "#0b0908",
  ink: "#f5eee8",
  muted: "#b3a399",
  red: "#ad1230",
  gold: "#cdb088",
};

export async function ogImage({
  script = "Mona Roses",
  eyebrow,
  title,
  footer,
  badge,
}: {
  /** "Mona Roses" zeigt das Logo; jeder andere Text (Name) steht in Antiqua */
  script?: string;
  eyebrow?: string;
  title?: string;
  footer?: string;
  badge?: string;
}) {
  const [cormorant, jost] = await fonts;
  const isBrand = script === "Mona Roses";
  const logoWidth = 700;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `linear-gradient(180deg, ${C.night} 0%, #140c0c 60%, #24090f 100%)`,
        fontFamily: "Cormorant",
        color: C.ink,
      }}
    >
      {/* feiner Rahmen in Champagner */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 28,
          width: OG_SIZE.width - 56,
          height: OG_SIZE.height - 56,
          border: `1px solid ${C.gold}55`,
          display: "flex",
        }}
      />

      {/* Inhalt */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: footer ? 30 : 0,
        }}
      >
        {eyebrow && (
          <div
            style={{
              fontFamily: "Jost",
              fontSize: 20,
              letterSpacing: 9,
              color: C.gold,
              textTransform: "uppercase",
              display: "flex",
              marginBottom: 22,
            }}
          >
            {eyebrow}
          </div>
        )}
        {isBrand ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/og rendert nur <img>
          <img
            src={await logo}
            alt=""
            width={logoWidth}
            height={Math.round(logoWidth / LOGO_RATIO)}
          />
        ) : (
          <div
            style={{
              fontSize: script.length > 12 ? 120 : 150,
              fontStyle: "italic",
              lineHeight: 1,
              color: C.ink,
              display: "flex",
            }}
          >
            {script}
          </div>
        )}
        {title && (
          <div
            style={{
              fontSize: isBrand ? 50 : 40,
              fontStyle: "italic",
              marginTop: 22,
              color: isBrand ? C.ink : C.gold,
              display: "flex",
            }}
          >
            {title}
          </div>
        )}
        {badge && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "Jost",
              fontSize: 24,
              color: C.gold,
              border: `1px solid ${C.gold}99`,
              padding: "6px 20px",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: "#86d3a6",
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
            bottom: 52,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            fontFamily: "Jost",
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
        { name: "Cormorant", data: cormorant, weight: 500, style: "italic" },
        { name: "Jost", data: jost, weight: 500, style: "normal" },
      ],
    },
  );
}
