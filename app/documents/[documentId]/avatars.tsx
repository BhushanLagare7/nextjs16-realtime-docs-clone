"use client"

import {
  ClientSideSuspense,
  useOthers,
  useSelf,
} from "@liveblocks/react/suspense"

import { Separator } from "@/components/ui/separator"

const AVATAR_SIZE = 36

interface AvatarProps {
  name: string
  src: string
}

function Avatar({ name, src }: AvatarProps) {
  return (
    <div
      className="group relative -ml-2 flex size-9 shrink-0 place-content-center rounded-full border-4 border-background bg-muted"
      style={{ height: AVATAR_SIZE, width: AVATAR_SIZE }}
    >
      <div className="pointer-events-none absolute top-full z-10 mt-2.5 rounded-lg bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
        {name}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={name}
        className="size-full rounded-full object-cover"
        src={src}
      />
    </div>
  )
}

function AvatarStack() {
  const users = useOthers()
  const currentUser = useSelf()

  const hasCollaborators = users.length > 0

  if (!currentUser && !hasCollaborators) return null

  return (
    <>
      <div className="flex items-center">
        {currentUser && (
          <div className="relative ml-2">
            <Avatar name="You" src={currentUser.info.avatar} />
          </div>
        )}
        <div className="flex">
          {users.map(({ connectionId, info }) => {
            return (
              <Avatar key={connectionId} name={info.name} src={info.avatar} />
            )
          })}
        </div>
      </div>
      {hasCollaborators && <Separator className="h-6" orientation="vertical" />}
    </>
  )
}

export function Avatars() {
  return (
    <ClientSideSuspense fallback={null}>
      <AvatarStack />
    </ClientSideSuspense>
  )
}
