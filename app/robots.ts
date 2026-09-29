import type { MetadataRoute } from "next"

import { getBaseUrl } from "@/lib/url"

/**
 * Generates the robots.txt configuration for search engine crawlers.
 * Disallows crawling on preview environments, and restricts private/API routes on production.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  // Prevent crawlers from indexing Vercel preview environments
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/documents/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
