/**
 * Resolves the canonical base URL of the application.
 *
 * Evaluation order:
 * 1. Explicit `NEXT_PUBLIC_APP_URL` environment variable if configured.
 * 2. Vercel production deployment URL (`VERCEL_PROJECT_PRODUCTION_URL`).
 * 3. Production domain: `https://nextjs16-realtime-docs-clone.vercel.app`.
 * 4. Local fallback: `http://localhost:3000`.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.NODE_ENV === "production") {
    return "https://nextjs16-realtime-docs-clone.vercel.app"
  }

  return "http://localhost:3000"
}
