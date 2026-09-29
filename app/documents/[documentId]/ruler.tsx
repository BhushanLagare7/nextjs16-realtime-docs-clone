"use client"

import { useRef, useState } from "react"

import { useMutation, useStorage } from "@liveblocks/react/suspense"

import {
  DEFAULT_MARGIN,
  LEFT_MARGIN_DEFAULT,
  markers,
  MINIMUM_SPACE,
  PAGE_WIDTH,
  RIGHT_MARGIN_DEFAULT,
} from "@/constants/margins"

import { Marker } from "./ruler/marker"

// Re-export constants for backward compatibility
export { DEFAULT_MARGIN, MINIMUM_SPACE, PAGE_WIDTH }

/**
 * Props for the `Ruler` component.
 */
interface RulerProps {
  /** Optional controlled left margin offset in pixels. Defaults to Liveblocks storage value. */
  leftMargin?: number
  /** Optional controlled right margin offset in pixels. Defaults to Liveblocks storage value. */
  rightMargin?: number
  /** Sets/updates the left margin offset. Defaults to Liveblocks mutation. */
  setLeftMargin?: (value: number) => void
  /** Sets/updates the right margin offset. Defaults to Liveblocks mutation. */
  setRightMargin?: (value: number) => void
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
  const storageLeftMargin = useStorage((root) => root.leftMargin)
  const setStorageLeftMargin = useMutation(({ storage }, position: number) => {
    storage.set("leftMargin", position)
  }, [])

  const storageRightMargin = useStorage((root) => root.rightMargin)
  const setStorageRightMargin = useMutation(({ storage }, position: number) => {
    storage.set("rightMargin", position)
  }, [])

  const leftMargin =
    controlledLeftMargin ?? storageLeftMargin ?? LEFT_MARGIN_DEFAULT
  const setLeftMargin = controlledSetLeftMargin ?? setStorageLeftMargin
  const rightMargin =
    controlledRightMargin ?? storageRightMargin ?? RIGHT_MARGIN_DEFAULT
  const setRightMargin = controlledSetRightMargin ?? setStorageRightMargin

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
    setLeftMargin(LEFT_MARGIN_DEFAULT)
  }

  /**
   * Resets the right margin to its default value.
   * Triggered by double-clicking the right margin marker.
   */
  const handleRightDoubleClick = () => {
    setRightMargin(RIGHT_MARGIN_DEFAULT)
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
