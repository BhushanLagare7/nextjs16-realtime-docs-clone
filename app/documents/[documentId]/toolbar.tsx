"use client"

import { useRef, useState } from "react"

import { type Level } from "@tiptap/extension-heading"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  type LucideIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SearchIcon,
  SpellCheckIcon,
  UnderlineIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react"

import { ColorPicker } from "@/components/color-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "@/extensions/font-size"
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
          className="flex h-7 w-30 shrink-0 items-center justify-between overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
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

/**
 * Control for adjusting font size of selected text via decrement/increment
 * buttons or direct numerical input.
 */
function FontSizeButton() {
  const { editor } = useEditorStore()

  const currentFontSize =
    (
      editor?.getAttributes("textStyle")?.fontSize as string | undefined
    )?.replace("px", "") || "16"

  const [fontSize, setFontSize] = useState(currentFontSize)
  const [inputValue, setInputValue] = useState(fontSize)
  const [isEditing, setIsEditing] = useState(false)

  // Keep internal state in sync with editor when not actively editing
  if (!isEditing && fontSize !== currentFontSize) {
    setFontSize(currentFontSize)
    setInputValue(currentFontSize)
  }

  const updateFontSize = (newSize: string) => {
    const trimmed = newSize.trim()
    if (!/^\d+$/.test(trimmed)) {
      setInputValue(fontSize)
      setIsEditing(false)
      return
    }

    const size = parseInt(trimmed, 10)
    if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
      editor?.chain().focus().setFontSize(`${size}px`).run()
      setFontSize(size.toString())
      setInputValue(size.toString())
      setIsEditing(false)
    } else {
      setInputValue(fontSize)
      setIsEditing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    updateFontSize(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      updateFontSize(inputValue)
      editor?.commands.focus()
    }
  }

  const increment = () => {
    const newSize = parseInt(fontSize, 10) + 1
    if (newSize <= MAX_FONT_SIZE) {
      updateFontSize(newSize.toString())
    }
  }

  const decrement = () => {
    const newSize = parseInt(fontSize, 10) - 1
    if (newSize >= MIN_FONT_SIZE) {
      updateFontSize(newSize.toString())
    }
  }

  return (
    <div className="flex items-center gap-x-0.5">
      <button
        aria-label="Decrease font size"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        type="button"
        onClick={decrement}
      >
        <MinusIcon className="size-4" />
      </button>
      {isEditing ? (
        <input
          aria-label="Font size value"
          autoFocus
          className="h-7 w-10 rounded-sm border border-input bg-transparent text-center text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          type="text"
          value={inputValue}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <button
          aria-label="Font size"
          className="flex h-7 w-10 shrink-0 items-center justify-center rounded-sm border border-input text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
          type="button"
          onClick={() => {
            setIsEditing(true)
            setFontSize(currentFontSize)
            setInputValue(currentFontSize)
          }}
        >
          {currentFontSize}
        </button>
      )}
      <button
        aria-label="Increase font size"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        type="button"
        onClick={increment}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
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
 * Button and popover dialog for inserting images into the document,
 * either by uploading a local file or by providing an image URL.
 */
function ImageButton() {
  const { editor } = useEditorStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const imageButtonRef = useRef<HTMLButtonElement | null>(null)

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run()
  }

  const onUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        onChange(imageUrl)
      }
    }

    input.click()
  }

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl)
      setImageUrl("")
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={imageButtonRef}
            aria-label="Insert image"
            className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
          >
            <ImageIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15"
            onClick={onUpload}
          >
            <UploadIcon className="size-4" />
            <span className="text-sm whitespace-nowrap">Upload</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15"
            onClick={() => setIsDialogOpen(true)}
          >
            <SearchIcon className="size-4" />
            <span className="text-sm whitespace-nowrap">Paste image URL</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setImageUrl("")
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            imageButtonRef.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>Insert image URL</DialogTitle>
            <DialogDescription className="sr-only">
              Enter the URL of the image to insert into the document.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleImageUrlSubmit()
              }
            }}
          />
          <DialogFooter>
            <Button onClick={handleImageUrlSubmit}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Dropdown popover for setting or unsetting a hyperlink on selected text.
 */
function LinkButton() {
  const { editor } = useEditorStore()
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)

  const onChange = (href: string) => {
    const trimmedHref = href.trim()

    if (trimmedHref === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      let normalizedHref = trimmedHref
      const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedHref)
      const isRelative =
        trimmedHref.startsWith("/") ||
        trimmedHref.startsWith("#") ||
        trimmedHref.startsWith(".") ||
        trimmedHref.startsWith("?") ||
        trimmedHref.startsWith("//")

      if (!hasProtocol && !isRelative) {
        normalizedHref = `https://${trimmedHref}`
      }

      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalizedHref })
        .run()
    }
    setValue("")
    setOpen(false)
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) {
          setValue(
            (editor?.getAttributes("link")?.href as string | undefined) || ""
          )
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Insert link"
          className={cn(
            "flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
            editor?.isActive("link") && "bg-muted-foreground/20"
          )}
        >
          <Link2Icon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-80 items-center gap-x-2 p-2.5">
        <Input
          className="flex-1"
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter") {
              onChange(value)
            }
          }}
        />
        <Button onClick={() => onChange(value)}>Apply</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Dropdown selector for setting text alignment (left, center, right, justify)
 * on block-level nodes (paragraph, heading).
 */
function AlignButton() {
  const { editor } = useEditorStore()

  const alignments = [
    {
      icon: AlignLeftIcon,
      label: "Align Left",
      value: "left",
    },
    {
      icon: AlignCenterIcon,
      label: "Align Center",
      value: "center",
    },
    {
      icon: AlignRightIcon,
      label: "Align Right",
      value: "right",
    },
    {
      icon: AlignJustifyIcon,
      label: "Align Justify",
      value: "justify",
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Text alignment"
          className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        >
          <AlignLeftIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {alignments.map(({ icon: Icon, label, value }) => {
          const isAlignActive = editor?.isActive({ textAlign: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isAlignActive && "bg-muted-foreground/20"
              )}
              onClick={() => editor?.chain().focus().setTextAlign(value).run()}
            >
              <Icon className="size-4" />
              <span className="text-sm whitespace-nowrap">{label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Dropdown selector for setting line height / spacing
 * on block-level nodes (paragraph, heading).
 */
function LineHeightButton() {
  const { editor } = useEditorStore()

  const lineHeights = [
    { label: "Default", value: "normal" },
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
  ]

  const currentLineHeight =
    (editor?.getAttributes("paragraph")?.lineHeight as string | undefined) ||
    (editor?.getAttributes("heading")?.lineHeight as string | undefined) ||
    "normal"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Line spacing"
          className="flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50"
        >
          <ListCollapseIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {lineHeights.map(({ label, value }) => {
          const isLineHeightActive =
            currentLineHeight === value ||
            editor?.isActive({ lineHeight: value })

          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
                isLineHeightActive && "bg-muted-foreground/20"
              )}
              onClick={() => editor?.chain().focus().setLineHeight(value).run()}
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
 * Dropdown selector for toggling bullet or ordered lists.
 */
function ListButton() {
  const { editor } = useEditorStore()

  const lists = [
    {
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      label: "Bullet List",
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      label: "Ordered List",
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ]

  const isAnyListActive =
    editor?.isActive("bulletList") || editor?.isActive("orderedList")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="List options"
          className={cn(
            "flex h-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm px-1.5 text-sm text-foreground transition-colors hover:bg-muted-foreground/15 focus-visible:outline-ring/50",
            isAnyListActive && "bg-muted-foreground/20"
          )}
        >
          <ListIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex w-auto min-w-48 flex-col gap-y-1 p-1">
        {lists.map(({ icon: Icon, isActive, label, onClick }) => (
          <DropdownMenuItem
            key={label}
            className={cn(
              "flex cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 text-foreground transition-colors hover:bg-muted-foreground/15",
              isActive() && "bg-muted-foreground/20"
            )}
            onClick={onClick}
          >
            <Icon className="size-4" />
            <span className="text-sm whitespace-nowrap">{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
      <FontSizeButton />
      <Separator className="h-6" orientation="vertical" />
      {sections[1].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
      <TextColorButton />
      <HighlightColorButton />
      <Separator className="h-6" orientation="vertical" />
      <LinkButton />
      <ImageButton />
      <AlignButton />
      <LineHeightButton />
      <ListButton />
      {sections[2].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </div>
  )
}
