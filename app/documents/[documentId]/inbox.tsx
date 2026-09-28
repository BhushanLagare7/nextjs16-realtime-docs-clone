"use client"

import {
  ClientSideSuspense,
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense"
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui"
import { BellIcon, LoaderIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

function InboxMenu() {
  const { fetchMore, hasFetchedAll, inboxNotifications, isFetchingMore } =
    useInboxNotifications()
  const { count } = useUnreadInboxNotificationsCount()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Notifications"
            className="relative"
            size="icon"
            variant="ghost"
          >
            <BellIcon className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          {inboxNotifications.length > 0 ? (
            <>
              <InboxNotificationList>
                {inboxNotifications.map((inboxNotification) => (
                  <InboxNotification
                    key={inboxNotification.id}
                    inboxNotification={inboxNotification}
                  />
                ))}
              </InboxNotificationList>
              {!hasFetchedAll && (
                <div className="border-t border-border p-2 text-center">
                  <Button
                    className="w-full text-xs"
                    disabled={isFetchingMore}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      fetchMore()
                    }}
                  >
                    {isFetchingMore ? (
                      <>
                        <LoaderIcon className="size-3.5 animate-spin" />
                        <span>Loading more…</span>
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="w-100 p-2 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator className="h-6" orientation="vertical" />
    </>
  )
}

/**
 * Inbox notification popover button displaying unread Liveblocks notifications.
 */
export function Inbox() {
  return (
    <ClientSideSuspense
      fallback={
        <>
          <Button
            aria-label="Notifications"
            className="relative"
            disabled
            size="icon"
            variant="ghost"
          >
            <BellIcon className="size-5" />
          </Button>
          <Separator className="h-6" orientation="vertical" />
        </>
      }
    >
      <InboxMenu />
    </ClientSideSuspense>
  )
}
