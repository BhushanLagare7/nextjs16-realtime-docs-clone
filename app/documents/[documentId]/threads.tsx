"use client"

import { useState } from "react"

import {
  ClientSideSuspense,
  useStatus,
  useThreads,
} from "@liveblocks/react/suspense"
import {
  AnchoredThreads,
  FloatingComposer,
  FloatingThreads,
} from "@liveblocks/react-tiptap"
import type { Editor } from "@tiptap/react"

interface ThreadsProps {
  editor: Editor | null
}

function ThreadsList({ editor }: ThreadsProps) {
  const { threads } = useThreads({ query: { resolved: false } })

  return (
    <>
      <div className="anchored-threads">
        <AnchoredThreads editor={editor} threads={threads} />
      </div>
      <FloatingThreads
        className="floating-threads"
        editor={editor}
        threads={threads}
      />
    </>
  )
}

export function Threads({ editor }: ThreadsProps) {
  const status = useStatus()
  const [hasConnected, setHasConnected] = useState(false)

  if (status === "connected" && !hasConnected) {
    setHasConnected(true)
  }

  return (
    <ClientSideSuspense fallback={null}>
      {status === "connected" ? <ThreadsList editor={editor} /> : null}
      {hasConnected ? (
        <FloatingComposer className="floating-composer" editor={editor} />
      ) : null}
    </ClientSideSuspense>
  )
}
