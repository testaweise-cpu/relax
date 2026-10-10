import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Homescreen-Icon: rotes Neon-„M“ in der Logo-Schrift. */
export default async function AppleIcon() {
  const dafoe = await readFile(
    join(process.cwd(), "src/assets/fonts/MrDafoe-Regular.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 60%, #3a0a18 0%, #0e0709 70%)",
      }}
    >
      <div
        style={{
          fontFamily: "Dafoe",
          fontSize: 150,
          lineHeight: 1,
          marginTop: 10,
          color: "#ffe3ea",
          textShadow:
            "0 0 2px #fff, 0 0 8px #ff2d55, 0 0 20px #ff2d55, 0 0 40px #ff2d55",
          transform: "rotate(-6deg)",
          display: "flex",
        }}
      >
        M
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Dafoe", data: dafoe, weight: 400, style: "normal" }],
    },
  );
}
