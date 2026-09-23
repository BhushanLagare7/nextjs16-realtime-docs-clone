import "./globals.css"

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// SEO and social sharing metadata for the app
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Scribe",
    template: "%s | Scribe",
  },
  description: "Real-time collaborative documentation platform",
  applicationName: "Scribe",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Scribe",
    description: "Real-time collaborative documentation platform",
    siteName: "Scribe",
    images: [
      {
        url: "/logo.svg",
        width: 100,
        height: 100,
        alt: "Scribe Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Scribe",
    description: "Real-time collaborative documentation platform",
    images: ["/logo.svg"],
  },
}

// App fonts: sans-serif for body text, monospace for code
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

/**
 * Root layout that wraps every page.
 * Sets up global fonts, theming, and the base HTML/body structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
      lang="en"
      suppressHydrationWarning // Avoids mismatch warnings from next-themes
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
