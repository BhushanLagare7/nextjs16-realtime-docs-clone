/**
 * Default left margin for the document page in pixels (56px = 7 / 8 inch at 96 DPI).
 */
export const LEFT_MARGIN_DEFAULT = 56

/**
 * Default right margin for the document page in pixels (56px = 7 / 8 inch at 96 DPI).
 */
export const RIGHT_MARGIN_DEFAULT = 56

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
export const DEFAULT_MARGIN = LEFT_MARGIN_DEFAULT

/**
 * Array of marker indices used to render ruler tick marks.
 * 83 markers are generated to create fine-grained (minor) and
 * coarse-grained (major, every 10th) tick marks across the ruler.
 */
export const markers = Array.from({ length: 83 }, (_, i) => i)
