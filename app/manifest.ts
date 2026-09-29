import type { MetadataRoute } from "next"

/**
 * Web Application Manifest for PWA capabilities and mobile installation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scribe",
    short_name: "Scribe",
    description: "Real-time collaborative documentation platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
