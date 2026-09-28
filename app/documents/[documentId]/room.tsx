"use client"

import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
import "@liveblocks/react-tiptap/styles.css"

import type { ReactNode } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useClient,
} from "@liveblocks/react/suspense"
import { toast } from "sonner"

import type { Id } from "@/convex/_generated/dataModel"

import { getDocuments, getUsers, type User } from "./actions"

export { ClientSideSuspense }

interface RoomProps {
  children: ReactNode
  roomId?: string
}

function DirectoryCacheInvalidator({ users }: { users: User[] }) {
  const client = useClient()

  useEffect(() => {
    if (users.length > 0) {
      client.resolvers.invalidateUsers()
      client.resolvers.invalidateMentionSuggestions?.()
    }
  }, [client, users])

  return null
}

/**
 * Liveblocks room wrapper for the document editor.
 * Fetches organization users for presence, mentions, and collaborator identification.
 */
export function Room({ children, roomId }: RoomProps) {
  const params = useParams<{ documentId: string }>()
  const id = roomId ?? params?.documentId ?? ""

  const [users, setUsers] = useState<User[]>([])
  const usersPromiseRef = useRef<Promise<User[]> | null>(null)

  const fetchUsers = useCallback((docId: string) => {
    if (!usersPromiseRef.current) {
      usersPromiseRef.current = getUsers(docId)
    }
    return usersPromiseRef.current
  }, [])

  useEffect(() => {
    let isMounted = true

    fetchUsers(id)
      .then((list) => {
        if (isMounted) {
          setUsers(list)
        }
      })
      .catch(() => {
        toast.error("Failed to fetch users")
      })

    return () => {
      isMounted = false
    }
  }, [id, fetchUsers])

  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const endpoint = "/api/liveblocks-auth"

        const response = await fetch(endpoint, {
          body: JSON.stringify({ room }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        })

        return await response.json()
      }}
      resolveMentionSuggestions={async ({ text }) => {
        let currentUsers = users
        if (currentUsers.length === 0 && id) {
          try {
            currentUsers = await fetchUsers(id)
          } catch {
            currentUsers = []
          }
        }

        let filteredUsers = currentUsers

        if (text) {
          filteredUsers = currentUsers.filter((user) =>
            user.name.toLowerCase().includes(text.toLowerCase())
          )
        }

        return filteredUsers.map((user) => user.id)
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        const documents = await getDocuments(roomIds as Id<"documents">[])
        return documents.map((document) => ({
          id: document.id,
          name: document.name,
          ...(document.name !== "[Removed]" && {
            url: `/documents/${document.id}`,
          }),
        }))
      }}
      resolveUsers={async ({ userIds }) => {
        let currentUsers = users
        if (currentUsers.length === 0 && id) {
          try {
            currentUsers = await fetchUsers(id)
          } catch {
            currentUsers = []
          }
        }

        return userIds.map((userId) => {
          const user = currentUsers.find((u) => u.id === userId)
          if (!user) return undefined
          return {
            name: user.name,
            avatar: user.avatar,
          }
        })
      }}
      throttle={16}
    >
      <DirectoryCacheInvalidator users={users} />
      <RoomProvider id={id} initialPresence={{ cursor: null }}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  )
}
