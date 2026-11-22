"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

/** An install command with a copy button. The command scrolls sideways on a
 *  narrow screen and never wraps, so it is always one line to copy. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // No clipboard access: the text is selectable.
    }
  }
  return (
    <div className="flex h-12 max-w-full items-center gap-1 rounded-full bg-tile pr-1.5 pl-5">
      <span aria-hidden className="font-mono text-[13px] text-ink-soft select-none">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto px-2 font-mono text-[13px] whitespace-nowrap [scrollbar-width:none]">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy the command"}
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-tile-inner text-ink shadow-(--lift) transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={copied ? 2.5 : 2}
          className="size-4"
        />
      </button>
    </div>
  )
}
