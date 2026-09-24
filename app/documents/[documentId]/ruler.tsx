"use client"

import { useRef, useState } from "react"
import { FaCaretDown } from "react-icons/fa"

import { cn } from "@/lib/utils"

/**
 * Total width of the page/document in pixels.
 * This represents the standard width used for margin calculations (e.g., 8.5" at 96 DPI).
 */
const PAGE_WIDTH = 816

/**
 * Minimum space (in pixels) that must remain between the left and right margins.
 * Prevents the margins from overlapping or crossing each other.
 */
const MINIMUM_SPACE = 100

/**
 * Default margin size (in pixels) applied to both left and right sides
 * on initial render and when a margin marker is double-clicked (reset).
 */
const DEFAULT_MARGIN = 56

/**
 * Array of marker indices used to render ruler tick marks.
 * 83 markers are generated to create fine-grained (minor) and
 * coarse-grained (major, every 10th) tick marks across the ruler.
 */
const markers = Array.from({ length: 83 }, (_, i) => i)

/**
 * Props for the `Marker` component, representing a draggable margin indicator.
 */
interface MarkerProps {
  /** Current pixel offset of the marker from the edge of the ruler. */
  position: number
  /** Whether this marker represents the left margin (true) or right margin (false). */
  isLeft: boolean
  /** Whether the marker is currently being dragged by the user. */
  isDragging: boolean
  /** Callback fired when the user presses the mouse down on the marker (starts drag). */
  onMouseDown: () => void
  /** Callback fired when the user double-clicks the marker (resets to default position). */
  onDoubleClick: () => void
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
  position,
  isLeft,
  isDragging,
  onMouseDown,
  onDoubleClick,
}: MarkerProps) {
  return (
    <div
      className={cn(
        "group absolute top-0 z-5 h-full w-4 cursor-ew-resize",
        isLeft ? "-ml-2" : "-mr-2"
      )}
      style={{ [isLeft ? "left" : "right"]: `${position}px` }}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
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
 * - Displays major tick marks (every 10 units, with numeric labels) and
 *   minor tick marks (every 5 units and every unit) for fine measurement.
 * - Hidden when printing (`print:hidden`).
 *
 * @remarks
 * Margin state is currently local to this component. The `TODO` comment
 * in `handleMouseMove` indicates that left margin updates should eventually
 * be synced for collaborative editing.
 */
export function Ruler() {
  /** Current left margin offset, in pixels, from the left edge of the page. */
  const [leftMargin, setLeftMargin] = useState(DEFAULT_MARGIN)

  /** Current right margin offset, in pixels, from the right edge of the page. */
  const [rightMargin, setRightMargin] = useState(DEFAULT_MARGIN)

  /** Whether the left margin marker is currently being dragged. */
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)

  /** Whether the right margin marker is currently being dragged. */
  const [isDraggingRight, setIsDraggingRight] = useState(false)

  /** Ref to the root ruler container, used to calculate relative mouse positions. */
  const rulerRef = useRef<HTMLDivElement | null>(null)

  /**
   * Begins a drag operation for the left margin marker.
   */
  const handleLeftMouseDown = () => {
    setIsDraggingLeft(true)
  }

  /**
   * Begins a drag operation for the right margin marker.
   */
  const handleRightMouseDown = () => {
    setIsDraggingRight(true)
  }

  /**
   * Handles mouse movement over the ruler while a margin marker is being dragged.
   *
   * Calculates the mouse position relative to the ruler container, clamps it
   * within valid bounds (respecting `MINIMUM_SPACE` between margins), and
   * updates the corresponding margin state (`leftMargin` or `rightMargin`).
   *
   * @param e - The React mouse event triggered by moving the pointer over the ruler.
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if ((isDraggingLeft || isDraggingRight) && rulerRef.current) {
      const container = rulerRef.current.querySelector("#ruler-container")
      if (container) {
        const containerRect = container.getBoundingClientRect()

        // Mouse X position relative to the left edge of the ruler container.
        const relativeX = e.clientX - containerRect.left

        // Clamp the raw position within the page bounds [0, PAGE_WIDTH].
        const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX))

        if (isDraggingLeft) {
          // Ensure the left margin doesn't cross into the right margin's minimum space.
          const maxLeftPosition = PAGE_WIDTH - rightMargin - MINIMUM_SPACE
          const newLeftPosition = Math.min(rawPosition, maxLeftPosition)
          setLeftMargin(newLeftPosition) // TODO: Make collaborative
        } else if (isDraggingRight) {
          // Ensure the right margin doesn't cross into the left margin's minimum space.
          const maxRightPosition = PAGE_WIDTH - (leftMargin + MINIMUM_SPACE)

          // Convert the raw (left-relative) position into a right-margin offset.
          const newRightPosition = Math.max(PAGE_WIDTH - rawPosition, 0)
          const constrainedRightPosition = Math.min(
            newRightPosition,
            maxRightPosition
          )
          setRightMargin(constrainedRightPosition)
        }
      }
    }
  }

  /**
   * Ends any active drag operation, whether for the left or right margin marker.
   * Triggered on mouse up or when the pointer leaves the ruler area.
   */
  const handleMouseUp = () => {
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
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative h-full w-full" id="ruler-container">
        {/* Left margin draggable marker */}
        <Marker
          isDragging={isDraggingLeft}
          isLeft={true}
          position={leftMargin}
          onDoubleClick={handleLeftDoubleClick}
          onMouseDown={handleLeftMouseDown}
        />

        {/* Right margin draggable marker */}
        <Marker
          isDragging={isDraggingRight}
          isLeft={false}
          position={rightMargin}
          onDoubleClick={handleRightDoubleClick}
          onMouseDown={handleRightMouseDown}
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
