"use client"

import { useRef, useState } from "react"
import { FaCaretDown } from "react-icons/fa"

import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

/**
 * Total width of the page/document in pixels.
 * This represents the standard width used for margin calculations (e.g., 8.5" at 96 DPI).
 */
export const PAGE_WIDTH = 816

/**
 * Minimum space (in pixels) that must remain between the left and right margins.
 * Prevents the margins from overlapping or crossing each other.
 */
export const MINIMUM_SPACE = 100

/**
 * Default margin size (in pixels) applied to both left and right sides
 * on initial render and when a margin marker is double-clicked (reset).
 */
export const DEFAULT_MARGIN = 56

/**
 * Array of marker indices used to render ruler tick marks.
 * 83 markers are generated to create fine-grained (minor) and
 * coarse-grained (major, every 10th) tick marks across the ruler.
 */
const markers = Array.from({ length: 83 }, (_, i) => i)

/**
 * Props for the `Ruler` component.
 */
interface RulerProps {
  /** Current left margin offset in pixels. Defaults to value from useEditorStore. */
  leftMargin?: number
  /** Current right margin offset in pixels. Defaults to value from useEditorStore. */
  rightMargin?: number
  /** Sets/updates the left margin offset. */
  setLeftMargin?: (value: number) => void
  /** Sets/updates the right margin offset. */
  setRightMargin?: (value: number) => void
}

/**
 * Props for the `Marker` component, representing a draggable margin indicator.
 */
interface MarkerProps {
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
function Marker({
  isDragging,
  isLeft,
  position,
  onDoubleClick,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
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

/**
 * `Ruler` component.
 *
 * Renders a horizontal document ruler (similar to those found in word processors)
 * with draggable left and right margin markers and tick marks for measurement.
 *
 * Features:
 * - Drag left/right margin markers to adjust document margins.
 * - Double-click a marker to reset it to the default margin.
 * - Pointer events are captured on the marker to allow dragging outside ruler bounds.
 * - Synchronizes margins with the active editor surface padding.
 * - Displays major tick marks (every 10 units, with numeric labels) and
 *   minor tick marks (every 5 units and every unit) for fine measurement.
 * - Hidden when printing (`print:hidden`).
 */
export function Ruler({
  leftMargin: controlledLeftMargin,
  rightMargin: controlledRightMargin,
  setLeftMargin: controlledSetLeftMargin,
  setRightMargin: controlledSetRightMargin,
}: RulerProps = {}) {
  const store = useEditorStore()

  const leftMargin = controlledLeftMargin ?? store.leftMargin
  const setLeftMargin = controlledSetLeftMargin ?? store.setLeftMargin
  const rightMargin = controlledRightMargin ?? store.rightMargin
  const setRightMargin = controlledSetRightMargin ?? store.setRightMargin

  /** Whether the left margin marker is currently being dragged. */
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)

  /** Whether the right margin marker is currently being dragged. */
  const [isDraggingRight, setIsDraggingRight] = useState(false)

  /** Ref to the root ruler container, used to calculate relative mouse positions. */
  const rulerRef = useRef<HTMLDivElement | null>(null)

  /**
   * Begins a drag operation for the left margin marker.
   */
  const handleLeftPointerDown = () => {
    setIsDraggingLeft(true)
  }

  /**
   * Begins a drag operation for the right margin marker.
   */
  const handleRightPointerDown = () => {
    setIsDraggingRight(true)
  }

  /**
   * Handles pointer movement over the left marker while dragging.
   *
   * Calculates pointer position relative to the ruler container, clamps it
   * within valid bounds (respecting `MINIMUM_SPACE` between margins), and
   * updates the left margin state.
   *
   * @param e - The React pointer event triggered by moving the captured pointer.
   */
  const handleLeftPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingLeft || !rulerRef.current) return

    const container = rulerRef.current.querySelector("#ruler-container")
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const relativeX = e.clientX - containerRect.left
    const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX))
    const maxLeftPosition = PAGE_WIDTH - rightMargin - MINIMUM_SPACE
    const newLeftPosition = Math.min(rawPosition, maxLeftPosition)
    setLeftMargin(newLeftPosition)
  }

  /**
   * Handles pointer movement over the right marker while dragging.
   *
   * Calculates pointer position relative to the ruler container, clamps it
   * within valid bounds (respecting `MINIMUM_SPACE` between margins), and
   * updates the right margin state.
   *
   * @param e - The React pointer event triggered by moving the captured pointer.
   */
  const handleRightPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRight || !rulerRef.current) return

    const container = rulerRef.current.querySelector("#ruler-container")
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const relativeX = e.clientX - containerRect.left
    const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX))
    const maxRightPosition = PAGE_WIDTH - (leftMargin + MINIMUM_SPACE)
    const newRightPosition = Math.max(PAGE_WIDTH - rawPosition, 0)
    const constrainedRightPosition = Math.min(
      newRightPosition,
      maxRightPosition
    )
    setRightMargin(constrainedRightPosition)
  }

  /**
   * Ends any active drag operation, whether for the left or right margin marker.
   * Triggered on pointer up or cancellation.
   */
  const handlePointerUp = () => {
    setIsDraggingLeft(false)
    setIsDraggingRight(false)
  }

  /**
   * Resets the left margin to its default value.
   * Triggered by double-clicking the left margin marker.
   */
  const handleLeftDoubleClick = () => {
    setLeftMargin(DEFAULT_MARGIN)
  }

  /**
   * Resets the right margin to its default value.
   * Triggered by double-clicking the right margin marker.
   */
  const handleRightDoubleClick = () => {
    setRightMargin(DEFAULT_MARGIN)
  }

  return (
    <div
      ref={rulerRef}
      className="relative mx-auto flex h-6 w-204 items-end border-b border-border bg-background select-none print:hidden"
    >
      <div className="relative h-full w-full" id="ruler-container">
        {/* Left margin draggable marker */}
        <Marker
          isDragging={isDraggingLeft}
          isLeft={true}
          position={leftMargin}
          onDoubleClick={handleLeftDoubleClick}
          onPointerCancel={handlePointerUp}
          onPointerDown={handleLeftPointerDown}
          onPointerMove={handleLeftPointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Right margin draggable marker */}
        <Marker
          isDragging={isDraggingRight}
          isLeft={false}
          position={rightMargin}
          onDoubleClick={handleRightDoubleClick}
          onPointerCancel={handlePointerUp}
          onPointerDown={handleRightPointerDown}
          onPointerMove={handleRightPointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Tick mark scale rendered along the bottom of the ruler */}
        <div className="absolute inset-x-0 bottom-0 h-full">
          <div className="relative h-full w-full">
            {markers.map((marker) => {
              // Distribute 83 markers evenly across the full page width.
              const position = (marker * 816) / 82

              return (
                <div
                  key={marker}
                  className="absolute bottom-0"
                  style={{ left: `${position}px` }}
                >
                  {/* Major tick every 10th marker, with a numeric label */}
                  {marker % 10 === 0 && (
                    <>
                      <div className="absolute bottom-0 h-2 w-px bg-muted-foreground/70" />
                      <span className="absolute bottom-2 -translate-x-1/2 text-[10px] text-muted-foreground/70">
                        {marker / 10 + 1}
                      </span>
                    </>
                  )}

                  {/* Medium tick every 5th marker (excluding major ticks) */}
                  {marker % 5 === 0 && marker % 10 !== 0 && (
                    <div className="absolute bottom-0 h-1.5 w-px bg-muted-foreground/70" />
                  )}

                  {/* Minor tick for all remaining markers */}
                  {marker % 5 !== 0 && (
                    <div className="absolute bottom-0 h-1 w-px bg-muted-foreground/40" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
