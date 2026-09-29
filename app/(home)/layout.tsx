import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Scribe",
    description: "Real-time collaborative documentation platform",
    siteName: "Scribe",
    type: "website",
    locale: "en_US",
    url: "/",
  },
}

interface HomeLayoutProps {
  children: React.ReactNode
}

/**
 * Layout wrapper for the home route group, applying canonical and Open Graph URLs for the root page.
 */
export default function HomeLayout({ children }: HomeLayoutProps) {
  return children
}
