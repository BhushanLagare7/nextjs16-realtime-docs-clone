type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * Renders JSON-LD structured data with XSS prevention by escaping opening angle brackets.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  )
}
