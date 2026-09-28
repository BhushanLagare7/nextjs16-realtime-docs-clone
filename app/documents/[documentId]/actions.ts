"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export interface User {
  id: string
  name: string
  avatar: string
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

/**
 * Server action to fetch document summaries by ID for Liveblocks room info resolution.
 */
export async function getDocuments(ids: Id<"documents">[]) {
  const { getToken } = await auth()
  const token = await getToken({ template: "convex" })
  if (!token) {
    throw new Error("Unauthorized")
  }

  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  client.setAuth(token)
  return await client.query(api.documents.getByIds, { ids })
}

/**
 * Server action to fetch all users within the authorized document's organization.
 * Used by Liveblocks to resolve user mentions and collaborator identities.
 */
export async function getUsers(documentId?: string): Promise<User[]> {
  const { orgId, sessionClaims, getToken } = await auth()

  let targetOrgId: string | undefined

  if (documentId) {
    const token = await getToken({ template: "convex" })
    if (!token) {
      return []
    }

    try {
      convex.setAuth(token)
      const document = await convex.query(api.documents.getById, {
        id: documentId as Id<"documents">,
      })

      if (!document) {
        return []
      }

      targetOrgId = document.organizationId
    } catch {
      return []
    }
  } else {
    targetOrgId =
      orgId ??
      ((sessionClaims as Record<string, unknown> | null)?.org_id as
        string | undefined)
  }

  if (!targetOrgId) {
    return []
  }

  const clerk = await clerkClient()
  const users: User[] = []
  const limit = 100
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const response = await clerk.users.getUserList({
      organizationId: [targetOrgId],
      limit,
      offset,
    })

    for (const user of response.data) {
      users.push({
        id: user.id,
        name:
          user.fullName ??
          user.primaryEmailAddress?.emailAddress ??
          "Anonymous",
        avatar: user.imageUrl,
      })
    }

    offset += response.data.length
    hasMore = offset < response.totalCount && response.data.length > 0
  }

  return users
}
