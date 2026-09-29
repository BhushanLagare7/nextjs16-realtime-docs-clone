import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
}

interface HomeLayoutProps {
  children: React.ReactNode
}

/**
 * Layout wrapper for the home route group, applying the canonical URL for the root page.
 */
export default function HomeLayout({ children }: HomeLayoutProps) {
  return children
}
