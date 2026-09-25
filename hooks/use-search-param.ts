import { parseAsString, useQueryState } from "nuqs"

/**
 * Custom hook to manage the "search" query parameter in the URL state.
 * Configured with an empty string default and clearOnDefault to keep URLs clean.
 */
export function useSearchParam() {
  return useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  )
}
