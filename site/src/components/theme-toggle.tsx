"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"

/** Switches the theme and remembers it. The demos in frames follow. */
export function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("theme", dark ? "dark" : "light")
    } catch {
      // Private mode: the switch still works for this page.
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark"
      className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-ink-faint hover:text-ink"
    >
      <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} className="size-[18px] dark:hidden" />
      <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} className="hidden size-[18px] dark:block" />
    </button>
  )
}
