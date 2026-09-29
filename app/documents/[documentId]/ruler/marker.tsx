"use client"

import { FaCaretDown } from "react-icons/fa"

import { cn } from "@/lib/utils"

/**
 * Props for the `Marker` component, representing a draggable margin indicator.
 */
export interface MarkerProps {
  /** Whether the marker is currently being dragged by the user. */
  isDragging: boolean
  /** Whether this marker represents the left margin (true) or right margin (false). */
  isLeft: boolean
  /** Current pixel offset of the marker from the edge of the ruler. */
  position: number
  /** Callback fired when the user double-clicks the marker (resets to default position). */
  onDoubleClick: () => void
  /** Callback fired when pointer is canceled (ends drag and releases capture). */
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void
  /** Callback fired when pointer goes down on marker (starts drag and captures pointer). */
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  /** Callback fired when pointer moves while dragging. */
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  /** Callback fired when pointer is released (ends drag and releases capture). */
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

/**
 * Renders a single draggable margin marker on the ruler.
 *
 * Displays a caret icon indicating the margin boundary, and (while dragging)
 * a vertical guide line extending down the page to help visually align content.
 *
 * @param props - See {@link MarkerProps}.
 */
export function Marker({
  isDragging,
  isLeft,
  onDoubleClick,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  position,
}: MarkerProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    onPointerDown(e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    onPointerUp(e)
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    onPointerCancel(e)
  }

  return (
    <div
      className={cn(
        "group absolute top-0 z-5 h-full w-4 cursor-ew-resize",
        isLeft ? "-ml-2" : "-mr-2"
      )}
      style={{ [isLeft ? "left" : "right"]: `${position}px` }}
      onDoubleClick={onDoubleClick}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Caret icon indicating the draggable margin handle */}
      <FaCaretDown className="absolute top-0 left-1/2 h-full -translate-x-1/2 fill-primary hover:fill-primary/80" />

      {/* Vertical guide line shown only while actively dragging this marker */}
      <div
        className={cn(
          "absolute top-4 left-1/2 h-screen w-px -translate-x-1/2 scale-x-50 bg-primary",
          isDragging ? "block" : "hidden"
        )}
      />
    </div>
  )
}
