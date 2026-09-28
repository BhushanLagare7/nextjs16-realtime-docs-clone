import { useCallback, useEffect, useRef } from "react"

export interface UseDebounceReturn<Args extends unknown[]> {
  debounced: (...args: Args) => void
  cancel: () => void
  flush: () => void
}

/**
 * Custom hook to debounce function execution.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns Object containing the debounced callback, flush, and cancel functions
 */
export function useDebounce<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number = 500
): UseDebounceReturn<Args> {
  const callbackRef = useRef<(...args: Args) => Return>(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const argsRef = useRef<Args | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  })

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    argsRef.current = null
  }, [])

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      const args = argsRef.current
      argsRef.current = null
      callbackRef.current(...args)
    }
  }, [])

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  const debounced = useCallback(
    (...args: Args) => {
      argsRef.current = args
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        const currentArgs = argsRef.current ?? args
        argsRef.current = null
        callbackRef.current(...currentArgs)
      }, delay)
    },
    [delay]
  )

  return {
    debounced,
    cancel,
    flush,
  }
}
