"use client"

import { useRef, useState } from "react"
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs"

import { useStatus } from "@liveblocks/react"
import { useMutation } from "convex/react"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useDebounce } from "@/hooks/use-debounce"

interface DocumentInputProps {
  id: Id<"documents">
  title: string
}

/**
 * Header input component displaying and editing the document title.
 * Provides real-time debounced updates and Liveblocks connection status indicators.
 */
export function DocumentInput({ id, title }: DocumentInputProps) {
  const status = useStatus()

  const [value, setValue] = useState(title)
  const [isPending, setIsPending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const mutate = useMutation(api.documents.updateById)

  const { debounced: debouncedUpdate, flush } = useDebounce(
    (newValue: string) => {
      if (newValue === title) return

      setIsPending(true)
      mutate({ id, title: newValue })
        .then(() => toast.success("Document updated"))
        .catch(() => toast.error("Something went wrong"))
        .finally(() => setIsPending(false))
    }
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedUpdate(newValue)
  }

  const handleBlur = () => {
    flush()
    setIsEditing(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    flush()
    setIsEditing(false)
  }

  const showLoader =
    isPending || status === "connecting" || status === "reconnecting"
  const showError = status === "disconnected"

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <form className="relative w-fit max-w-[50ch]" onSubmit={handleSubmit}>
          <span className="invisible px-1.5 text-lg whitespace-pre">
            {value || " "}
          </span>
          <input
            ref={inputRef}
            className="absolute inset-0 truncate bg-transparent px-1.5 text-lg text-foreground"
            value={value}
            onBlur={handleBlur}
            onChange={onChange}
          />
        </form>
      ) : (
        <span
          className="cursor-pointer truncate px-1.5 text-lg"
          onClick={() => {
            setValue(title)
            setIsEditing(true)
            setTimeout(() => {
              inputRef.current?.focus()
            }, 0)
          }}
        >
          {title}
        </span>
      )}
      {showError && <BsCloudSlash className="size-4" />}
      {!showError && !showLoader && <BsCloudCheck className="size-4" />}
      {showLoader && (
        <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
