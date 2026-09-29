import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
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
