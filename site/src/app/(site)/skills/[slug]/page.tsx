import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CopyCommand } from "@/components/copy-command"
import { DemoFrame } from "@/components/demo-frame"
import { FaqList } from "@/components/faq-list"
import { JsonLd } from "@/components/json-ld"
import { Mdx } from "@/components/mdx"
import { SHELL } from "@/components/site-chrome"
import { pageMetadata, skillStructuredData } from "@/lib/seo"
import { MAKER_NAME, MAKER_URL, REPO_URL, SKILLS_SH_URL } from "@/lib/site"
import { SKILLS, facts, skillBySlug } from "@/lib/skills"

export const dynamicParams = false
export const generateStaticParams = () => SKILLS.map((skill) => ({ slug: skill.slug }))

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skill = skillBySlug((await params).slug)
  if (!skill) return {}
  return pageMetadata({
    title: skill.seoTitle,
    description: skill.seoDescription,
    path: skill.href,
    keywords: skill.keywords,
    image: `/og/${skill.slug}.png`,
    imageAlt: skill.title,
  })
}

const H2 = "font-heading text-[clamp(1.625rem,3.2vw,2.125rem)] leading-[1.1] font-medium tracking-tighter text-balance"
const LINK =
  "flex h-10 items-center rounded-full bg-tile px-4 text-[14px] font-medium transition-colors duration-150 hover:bg-ink-faint"

const updated = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })

export default async function SkillPage({ params }: Props) {
  const skill = skillBySlug((await params).slug)
  if (!skill) notFound()
  const others = SKILLS.filter((other) => other.slug !== skill.slug)

  return (
    <article>
      <JsonLd data={skillStructuredData(facts(skill))} />

      <header className={`${SHELL} pt-10 pb-10 sm:pt-16 sm:pb-12`}>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[12px] text-ink-soft">
          <Link href="/#skills" className="hover:text-ink">
            skills
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{skill.slug}</span>
        </nav>
        <h1 className="mt-6 max-w-[20ch] font-heading text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] font-medium tracking-tighter text-balance">
          {skill.title}
        </h1>
        {/* The answer under the heading, written to be quoted on its own. */}
        <p className="mt-6 max-w-[44rem] text-[17px] leading-relaxed text-ink-soft sm:text-[18px]">
          {skill.description}
        </p>
        <p className="mt-4 text-[13px] text-ink-soft">
          By{" "}
          <a href={MAKER_URL} className="underline underline-offset-3">
            {MAKER_NAME}
          </a>
          . Updated <time dateTime={skill.updatedAt}>{updated(skill.updatedAt)}</time>.
        </p>
        <div className="mt-8 flex max-w-full flex-col gap-3 lg:flex-row lg:items-center">
          <CopyCommand command={skill.install} />
          <div className="flex flex-wrap gap-2">
            <a href={`${REPO_URL}/tree/main/skills/${skill.slug}`} className={LINK}>
              Source on GitHub
            </a>
            <a href={`${SKILLS_SH_URL}/${skill.slug}`} className={LINK}>
              skills.sh
            </a>
            <a href={skill.markdownHref} className={LINK}>
              Read as Markdown
            </a>
          </div>
        </div>
      </header>

      <section className={SHELL} aria-label="Live demo">
        <DemoFrame slug={skill.slug} href={skill.demoHref} title={`${skill.slug} live demo`} />
      </section>

      <section className={`${SHELL} mt-20`}>
        <h2 className={H2}>The workflow your agent follows</h2>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skill.steps.map((step, i) => (
            <li key={step.title} className="rounded-[24px] bg-tile p-5">
              <span className="font-mono text-[12px] text-ink-soft tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[16px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${SHELL} mt-20`}>
        <div className="max-w-[46rem]">
          <Mdx code={skill.body} />
        </div>
      </section>

      <section className={`${SHELL} mt-20`}>
        <h2 className={H2}>Questions about {skill.slug}</h2>
        <div className="mt-8">
          <FaqList faqs={skill.faq} />
        </div>
      </section>

      {others.length > 0 && (
        <section className={`${SHELL} mt-20`}>
          <h2 className={H2}>More skills</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={other.href} className="group block overflow-hidden rounded-[28px] bg-tile">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={other.poster}
                      alt={other.posterAlt}
                      width={1600}
                      height={900}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-quint group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-6">
                    <p className="font-mono text-[12px] text-ink-soft">{other.slug}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{other.builds}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
