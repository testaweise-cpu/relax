import { ImageResponse } from "next/og";
import { ROSE_PATH, ROSE_VIEWBOX } from "@/assets/rose-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Homescreen-Icon: die Rose aus dem Logo auf warmem Schwarz. */
export default function AppleIcon() {
  const width = 124;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0908",
      }}
    >
      <svg
        width={width}
        height={Math.round((width * ROSE_VIEWBOX.height) / ROSE_VIEWBOX.width)}
        viewBox={`0 0 ${ROSE_VIEWBOX.width} ${ROSE_VIEWBOX.height}`}
      >
        <path fill="#b3132f" fillRule="evenodd" d={ROSE_PATH} />
      </svg>
    </div>,
    size,
  );
}
