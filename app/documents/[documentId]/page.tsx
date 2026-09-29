import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import { ConvexError } from "convex/values"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

import { Document } from "./document"

export const metadata: Metadata = {
  title: "Document",
  robots: {
    index: false,
    follow: false,
  },
}

interface DocumentIdPageProps {
  /** Next.js dynamic route params, resolved asynchronously */
  params: Promise<{ documentId: Id<"documents"> }>
}

/**
 * Page component for viewing/editing a single document.
 * Preloads document data on the server using an authenticated Convex token,
 * then renders the collaborative Document client interface.
 */
export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params

  const { getToken } = await auth()
  const token = (await getToken({ template: "convex" })) ?? undefined

  if (!token) {
    throw new Error("Unauthorized")
  }

  let preloadedDocument
  try {
    preloadedDocument = await preloadQuery(
      api.documents.getById,
      { id: documentId },
      { token }
    )
  } catch (error) {
    if (
      error instanceof ConvexError &&
      (error.data === "Document not found" ||
        error.message === "Document not found")
    ) {
      notFound()
    }

    throw error
  }

  return <Document preloadedDocument={preloadedDocument} />
}
