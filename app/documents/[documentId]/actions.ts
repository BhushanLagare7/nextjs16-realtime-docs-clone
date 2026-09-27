"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export interface User {
  id: string
  name: string
  avatar: string
}

/**
 * Server action to fetch all users within the current Clerk organization.
 * Used by Liveblocks to resolve user mentions and collaborator identities.
 */
export async function getUsers(): Promise<User[]> {
  const { orgId, sessionClaims } = await auth()
  const clerk = await clerkClient()

  const targetOrgId =
    orgId ??
    ((sessionClaims as Record<string, unknown> | null)?.org_id as
      string | undefined)

  if (!targetOrgId) {
    return []
  }

  const response = await clerk.users.getUserList({
    organizationId: [targetOrgId],
  })

  return response.data.map((user) => ({
    id: user.id,
    name:
      user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
    avatar: user.imageUrl,
  }))
}
