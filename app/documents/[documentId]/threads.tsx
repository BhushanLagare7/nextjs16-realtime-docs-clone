"use client"

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
      <FloatingComposer className="floating-composer" editor={editor} />
    </>
  )
}

export function Threads({ editor }: ThreadsProps) {
  const status = useStatus()

  return (
    <ClientSideSuspense fallback={null}>
      {status === "connected" ? <ThreadsList editor={editor} /> : null}
    </ClientSideSuspense>
  )
}
