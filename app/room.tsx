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

interface RoomProps {
  children: ReactNode
  roomId?: string
}

export function Room({ children, roomId }: RoomProps) {
  const params = useParams<{ documentId: string }>()
  const id = roomId ?? params?.documentId ?? ""

  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}
    >
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
