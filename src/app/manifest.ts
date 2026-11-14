import type { MetadataRoute } from "next";

/** Damit sich die Seite sauber auf dem Startbildschirm ablegen lässt. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mona Roses",
    short_name: "Mona Roses",
    description:
      "Zimmervermietung mit Bar und Tabledance in Berlin-Steglitz. Rund um die Uhr geöffnet.",
    lang: "de",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0908",
    theme_color: "#0b0908",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Jetzt da", url: "/jetzt-da" },
      { name: "Mieterinnen", url: "/mieterinnen" },
    ],
  };
}
