import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Homescreen-Icon: gestreifte Sonne über dem Horizont. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0d0b1e",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 50,
          width: 120,
          height: 120,
          borderRadius: 120,
          background:
            "linear-gradient(180deg, #ffd84d 0%, #ff8a3d 45%, #ff2e97 85%)",
          display: "flex",
        }}
      />
      {[92, 106].map((y, i) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 20,
            top: y,
            width: 140,
            height: 6 + i * 2,
            background: "#0d0b1e",
            display: "flex",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 122,
          width: 180,
          height: 58,
          background: "#0d0b1e",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 122,
          width: 160,
          height: 4,
          background: "#ff2e97",
          display: "flex",
        }}
      />
    </div>,
    size,
  );
}
