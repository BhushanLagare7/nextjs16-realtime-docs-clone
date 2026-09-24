"use client"

import { type Level } from "@tiptap/extension-heading"
import {
  BoldIcon,
  ChevronDownIcon,
  HighlighterIcon,
  ItalicIcon,
  ListTodoIcon,
  type LucideIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { ColorPicker } from "@/components/color-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/store/use-editor-store"

interface ToolbarButtonProps {
  /** Handler invoked when the button is clicked */
  onClick?: () => void
  /** Whether the button represents an active/enabled editor state */
  isActive?: boolean
  /** Icon component to render inside the button */
  icon: LucideIcon
  "aria-label"?: string
  /** Human-readable label fallback for aria-label */
  label?: string
}

/** Small icon-only button used within the editor toolbar */
function ToolbarButton({
  "aria-label": ariaLabel,
  icon: Icon,
  isActive,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      aria-label={ariaLabel ?? label}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded-sm text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
        isActive && "bg-muted-foreground/20"
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  )
}

interface HeadingOption {
  label: string
  value: 0 | Level
  fontSize: string
}

/**
 * Dropdown selector for setting the document heading level (H1 - H5)
 * or reverting back to normal body text (paragraph).
 */
function HeadingLevelButton() {
  const { editor } = useEditorStore()

  const headings: HeadingOption[] = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ]

  const getCurrentHeading = (): string => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`
      }
    }

    return "Normal text"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Text heading level"
          className="flex h-7 w-28 shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        >
          <span className="truncate">{getCurrentHeading()}</span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {headings.map(({ fontSize, label, value }) => {
          const isHeadingActive =
            (value === 0 && !editor?.isActive("heading")) ||
            editor?.isActive("heading", { level: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isHeadingActive && "bg-muted-foreground/20"
              )}
              style={{ fontSize }}
              onClick={() => {
                if (value === 0) {
                  editor?.chain().focus().setParagraph().run()
                } else {
                  editor?.chain().focus().setHeading({ level: value }).run()
                }
              }}
            >
              <span className="whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface FontOption {
  label: string
  value: string
}

/**
 * Dropdown selector for setting the font family of selected text.
 */
function FontFamilyButton() {
  const { editor } = useEditorStore()

  const fonts: FontOption[] = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Font family"
          className="flex h-7 w-30 shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        >
          <span className="truncate">
            {(editor?.getAttributes("textStyle")?.fontFamily as
              string | undefined) || "Arial"}
          </span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {fonts.map(({ label, value }) => {
          const isFontActive =
            editor?.getAttributes("textStyle")?.fontFamily === value

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isFontActive && "bg-muted-foreground/20"
              )}
              style={{ fontFamily: value }}
              onClick={() => editor?.chain().focus().setFontFamily(value).run()}
            >
              <span className="text-sm whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Dropdown selector for setting text color on selected text using ColorPicker.
 */
function TextColorButton() {
  const { editor } = useEditorStore()

  const currentColor =
    (editor?.getAttributes("textStyle")?.color as string | undefined) ||
    "#000000"

  const hasColor = !!editor?.getAttributes("textStyle")?.color

  const onChange = (color: string) => {
    editor?.chain().focus().setColor(color).run()
  }

  const onReset = () => {
    editor?.chain().focus().unsetColor().run()
  }

  return (
    <ColorPicker
      aria-label="Text color"
      isResetActive={!hasColor}
      resetLabel="Default"
      resetType="default"
      value={currentColor}
      onChange={onChange}
      onReset={onReset}
    >
      <button
        aria-label="Text color"
        className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
      >
        <span className="text-xs">A</span>
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: hasColor ? currentColor : "currentColor" }}
        />
      </button>
    </ColorPicker>
  )
}

/**
 * Dropdown selector for applying highlight color to selected text using ColorPicker.
 */
function HighlightColorButton() {
  const { editor } = useEditorStore()

  const currentColor =
    (editor?.getAttributes("highlight")?.color as string | undefined) ||
    "#ffff00"

  const isHighlighted = !!editor?.isActive("highlight")

  const onChange = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run()
  }

  const onReset = () => {
    editor?.chain().focus().unsetHighlight().run()
  }

  return (
    <ColorPicker
      aria-label="Highlight color"
      isResetActive={!isHighlighted}
      resetLabel="None"
      resetType="none"
      value={isHighlighted ? currentColor : "#ffff00"}
      onChange={onChange}
      onReset={onReset}
    >
      <button
        aria-label="Highlight color"
        className="flex h-7 min-w-7 shrink-0 flex-col items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
      >
        <HighlighterIcon className="size-4" />
        <div
          className="h-0.5 w-full"
          style={{
            backgroundColor: isHighlighted ? currentColor : "transparent",
          }}
        />
      </button>
    </ColorPicker>
  )
}

/**
 * Editor toolbar containing action buttons (e.g. Undo) that operate
 * on the currently active Tiptap editor instance from the global store.
 */
export function Toolbar() {
  const { editor } = useEditorStore()

  // Grouped toolbar buttons; structured as sections for future extensibility
  const sections: {
    label: string
    icon: LucideIcon
    onClick: () => void
    isActive?: boolean
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: "Spell Check",
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck")
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false"
          )
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        isActive: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        isActive: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        isActive: editor?.isActive("underline"),
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ]

  return (
    <div className="flex min-h-10 items-center gap-x-0.5 overflow-x-auto rounded-[24px] bg-muted/70 px-2.5 py-0.5 print:hidden">
      {sections[0].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
      <Separator className="h-6" orientation="vertical" />
      <FontFamilyButton />
      <Separator className="h-6" orientation="vertical" />
      <HeadingLevelButton />
      <Separator className="h-6" orientation="vertical" />
      {/* TODO: Font size */}
      <Separator className="h-6" orientation="vertical" />
      {sections[1].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
      <TextColorButton />
      <HighlightColorButton />
      <Separator className="h-6" orientation="vertical" />
      {/* TODO: Link */}
      {/* TODO: Image */}
      {/* TODO: Align */}
      {/* TODO: Line height */}
      {/* TODO: List */}
      {sections[2].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </div>
  )
}
