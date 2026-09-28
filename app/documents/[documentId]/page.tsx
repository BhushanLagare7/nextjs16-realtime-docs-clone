import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

import { Document } from "./document"

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

  const preloadedDocument = await preloadQuery(
    api.documents.getById,
    { id: documentId },
    { token }
  )

  return <Document preloadedDocument={preloadedDocument} />
}
