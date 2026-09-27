"use client"

import Link from "next/link"

import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Props for {@link ErrorPage}. */
interface ErrorPageProps {
  /** The error thrown by a descendant component/segment. */
  error: Error & { digest?: string }
  /** Attempts to re-render the segment that threw the error. */
  reset: () => void
}

/**
 * Root error boundary page rendered when an unhandled runtime error occurs.
 */
export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-background text-foreground"
      role="alert"
    >
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangleIcon className="size-10 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <Button className="px-6 font-medium" onClick={reset}>
          Try again
        </Button>
        <Button asChild className="font-medium" variant="ghost">
          <Link href="/">Go back</Link>
        </Button>
      </div>
    </div>
  )
}
