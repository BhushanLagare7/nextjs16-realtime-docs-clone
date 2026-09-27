"use client"

import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
import "@liveblocks/react-tiptap/styles.css"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { toast } from "sonner"

import { FullscreenLoader } from "@/components/fullscreen-loader"

import { getUsers, type User } from "./actions"

interface RoomProps {
  children: ReactNode
  roomId?: string
}

/**
 * Liveblocks room wrapper for the document editor.
 * Fetches organization users for presence, mentions, and collaborator identification.
 */
export function Room({ children, roomId }: RoomProps) {
  const params = useParams<{ documentId: string }>()
  const id = roomId ?? params?.documentId ?? ""

  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    let isMounted = true

    getUsers()
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
  }, [])

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveMentionSuggestions={({ text }) => {
        let filteredUsers = users

        if (text) {
          filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(text.toLowerCase())
          )
        }

        return filteredUsers.map((user) => user.id)
      }}
      resolveRoomsInfo={() => []}
      resolveUsers={({ userIds }) => {
        return userIds.map((userId) => {
          const user = users.find((u) => u.id === userId)
          if (!user) return undefined
          return {
            name: user.name,
            avatar: user.avatar,
          }
        })
      }}
      throttle={16}
    >
      <RoomProvider id={id} initialPresence={{ cursor: null }}>
        <ClientSideSuspense
          fallback={<FullscreenLoader label="Room loading…" />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
