import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter, SiteHeader, SHELL } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className={`${SHELL} py-24`}>
        <h1 className="font-heading text-[clamp(2.25rem,6vw,4rem)] leading-[1.02] font-medium tracking-tighter">
          This page does not exist.
        </h1>
        <p className="mt-5 text-[17px] text-ink-soft">
          The skills are on the{" "}
          <Link href="/" className="text-ink underline underline-offset-3">
            home page
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
