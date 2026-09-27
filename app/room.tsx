"use client"

import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-ui/styles/dark/attributes.css"
import "@liveblocks/react-tiptap/styles.css"

import type { ReactNode } from "react"
import { useParams } from "next/navigation"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"

import { FullscreenLoader } from "@/components/fullscreen-loader"

/** Props for {@link Room}. */
interface RoomProps {
  /** Content rendered once the Liveblocks room has connected. */
  children: ReactNode
  /** Room ID override; falls back to the `documentId` route param. */
  roomId?: string
}

/**
 * Wraps children in a Liveblocks room context, authenticating via
 * `/api/liveblocks-auth` and showing a fullscreen loader until connected.
 */
export function Room({ children, roomId }: RoomProps) {
  // Resolve the room ID from the prop or the current route's documentId param.
  const params = useParams<{ documentId: string }>()
  const id = roomId ?? params?.documentId ?? ""

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider id={id} initialPresence={{ cursor: null }}>
        <ClientSideSuspense
          fallback={<FullscreenLoader label="Document loading…" />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
