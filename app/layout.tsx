import "./globals.css"
import "@liveblocks/react-tiptap/styles.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"

import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import { ConvexClientProvider } from "@/components/convex-client-provider"
import { JsonLd } from "@/components/seo/json-ld"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getBaseUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

const appUrl = getBaseUrl()

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

// SEO and social sharing metadata for the app
export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Scribe",
    template: "%s | Scribe",
  },
  description: "Real-time collaborative documentation platform",
  applicationName: "Scribe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Scribe",
    title: "Scribe",
    description: "Real-time collaborative documentation platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scribe",
    description: "Real-time collaborative documentation platform",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${appUrl}/#website`,
      url: appUrl,
      name: "Scribe",
      description: "Real-time collaborative documentation platform",
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      "@id": `${appUrl}/#webapp`,
      url: appUrl,
      name: "Scribe",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      description:
        "Real-time collaborative documentation platform with rich text editing, presence, and comments.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
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
        <JsonLd data={jsonLdData} />
        <ThemeProvider>
          <NuqsAdapter>
            <ConvexClientProvider>
              <Toaster />
              {children}
            </ConvexClientProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
