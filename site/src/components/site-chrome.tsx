import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { LICENSE_NAME, LICENSE_URL, MAKER_NAME, MAKER_URL, REPO_URL, SITE_NAME, SKILLS_SH_URL } from "@/lib/site"

export const SHELL = "mx-auto w-full max-w-[76rem] px-5 sm:px-8"

export function SiteHeader() {
  return (
    <header className={`${SHELL} flex h-16 items-center justify-between`}>
      <Link href="/" className="font-heading text-[17px] font-semibold tracking-[-0.02em]">
        {SITE_NAME}
      </Link>
      <nav className="flex items-center gap-1 text-[14px] font-medium">
        <Link
          href="/#skills"
          className="hidden h-9 items-center rounded-full px-3 text-ink-soft transition-colors duration-150 hover:bg-ink-faint hover:text-ink sm:flex"
        >
          Skills
        </Link>
        <a
          href={REPO_URL}
          className="flex h-9 items-center rounded-full px-3 text-ink-soft transition-colors duration-150 hover:bg-ink-faint hover:text-ink"
        >
          GitHub
        </a>
        <ThemeToggle />
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className={`${SHELL} mt-24 pb-10`}>
      <div className="flex flex-col gap-4 border-t border-ink-faint pt-6 text-[13px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          {SITE_NAME}. Free and{" "}
          <a href={LICENSE_URL} className="underline underline-offset-3">
            {LICENSE_NAME} licensed
          </a>
          . Made by{" "}
          <a href={MAKER_URL} className="underline underline-offset-3">
            {MAKER_NAME}
          </a>
          .
        </p>
        <p className="flex gap-5">
          <a href={REPO_URL} className="hover:text-ink">
            GitHub
          </a>
          <a href={SKILLS_SH_URL} className="hover:text-ink">
            skills.sh
          </a>
          <a href="/llms.txt" className="hover:text-ink">
            llms.txt
          </a>
        </p>
      </div>
    </footer>
  )
}
