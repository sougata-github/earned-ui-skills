import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import type { Faq } from "@/lib/faq"

/** Questions and answers. Native disclosure, so a closed answer is still in
 *  the page's HTML for search engines and agents, and find in page opens
 *  it. The same list goes out as FAQPage structured data (lib/seo.ts). */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq, i) => (
        <details key={faq.question} open={i === 0} className="faq rounded-[20px] bg-tile">
          <summary className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <h3 className="text-[15px] leading-snug font-semibold sm:text-[16px]">{faq.question}</h3>
            <span className="faq-mark grid size-7 shrink-0 place-items-center rounded-full bg-ink-faint">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="size-3.5" />
            </span>
          </summary>
          <div className="flex max-w-[44rem] flex-col gap-3 px-5 pb-5 text-[15px] leading-relaxed text-ink-soft sm:px-6">
            {faq.answer.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
