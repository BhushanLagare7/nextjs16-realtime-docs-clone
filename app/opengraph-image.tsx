import { ImageResponse } from "next/og"

export const alt = "Scribe — Real-time collaborative documentation platform"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

/**
 * Generates an Open Graph social card image at 1200x630 resolution.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        color: "#fafafa",
        fontFamily: "sans-serif",
        padding: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <svg
          fill="none"
          height="80"
          viewBox="0 0 36 36"
          width="80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#2563eb" height="36" rx="8" width="36" />
          <path
            d="M10 12h16M10 18h16M10 24h10"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            marginLeft: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Scribe
        </span>
      </div>
      <p
        style={{
          fontSize: 28,
          color: "#a1a1aa",
          textAlign: "center",
          maxWidth: 800,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        Real-time collaborative documentation platform
      </p>
    </div>,
    {
      ...size,
    }
  )
}
