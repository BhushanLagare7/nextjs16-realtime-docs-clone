import type { MetadataRoute } from "next"

import { getBaseUrl } from "@/lib/url"

/**
 * Generates the XML sitemap containing public, indexable canonical URLs.
 * Private authenticated document pages are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()

  return [
    {
      url: baseUrl,
    },
  ]
}
