"use client"

import { useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import type { Faq } from "@/lib/faq"

/** Questions and answers. Every answer is in the page's HTML whether it is
 *  open or not, for search engines and agents, and the same list goes out
 *  as FAQPage structured data (lib/seo.ts).
 *
 *  An answer opens and closes smoothly: its row grows from 0fr to 1fr, so
 *  the height is the answer's own with nothing measured, and the text fades
 *  in a little behind the row and out a little ahead of it. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq, i) => (
        <FaqItem key={faq.question} faq={faq} startOpen={i === 0} />
      ))}
    </div>
  )
}

function FaqItem({ faq, startOpen }: { faq: Faq; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  const id = useId()
  return (
    <div data-open={open} className="faq rounded-[20px] bg-tile">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((was) => !was)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[20px] px-5 py-4 text-left text-[15px] leading-snug font-semibold sm:px-6 sm:text-[16px]"
        >
          {faq.question}
          <span className="faq-mark grid size-7 shrink-0 place-items-center rounded-full bg-ink-faint">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="size-3.5" />
          </span>
        </button>
      </h3>
      <div id={id} role="region" aria-hidden={!open} className="faq-row">
        <div className="faq-clip">
          <div className="faq-answer flex max-w-[44rem] flex-col gap-3 px-5 pb-5 text-[15px] leading-relaxed text-ink-soft sm:px-6">
            {faq.answer.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
