import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"

import { CopyCommand } from "@/components/copy-command"
import { FaqList } from "@/components/faq-list"
import { JsonLd } from "@/components/json-ld"
import { SHELL } from "@/components/site-chrome"
import { HOME_FAQ } from "@/lib/faq"
import { homeStructuredData, pageMetadata } from "@/lib/seo"
import { INSTALL_ALL, SITE_SEO_DESCRIPTION, SITE_TITLE } from "@/lib/site"
import { SKILLS, facts } from "@/lib/skills"

// Keywords from OpenSEO search volumes (docs/seo.md).
export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_SEO_DESCRIPTION,
  path: "/",
  image: "/og/home.png",
  imageAlt: "Earned UI Skills: agent skills for Claude Code, Codex and Cursor",
  keywords: [
    "claude skills",
    "claude code skills",
    "agent skills",
    "codex skills",
    "cursor skills",
    "ui skills",
    "frontend design skill",
    "claude code design skill",
    "claude code frontend design",
    "best claude code skills",
    "npx skills",
    "how to install claude skills",
    "what are agent skills",
    "claude skills vs mcp",
    "liquid glass",
    "bento grid",
  ],
})

const H2 = "font-heading text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.08] font-medium tracking-tighter text-balance"

const INSTALL_STEPS = [
  {
    title: "Run one command",
    text: "In your project, run the install command. The skills CLI copies each skill into the folder your agent reads. Nothing is added to your dependencies.",
  },
  {
    title: "Ask for what you want",
    text: "Ask your agent for a liquid glass player, or a features section with live widgets. It loads the skill whose description matches the request.",
  },
  {
    title: "Tune it in the lab",
    text: "The agent builds a lab first. You judge the result by eye at its real size and paste the values back, or say it looks right.",
  },
]

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeStructuredData(SKILLS.map(facts), HOME_FAQ)} />

      <section className={`${SHELL} pt-14 pb-14 sm:pt-24 sm:pb-20`}>
        <p className="text-[14px] font-medium text-ink-soft">
          Open source agent skills for Claude Code, Codex and Cursor
        </p>
        <h1 className="mt-5 max-w-[18ch] font-heading text-[clamp(2.5rem,7.2vw,5rem)] leading-[1] font-medium tracking-tighter text-balance">
          UI skills for coding agents, earned the hard way.
        </h1>
        <p className="mt-6 max-w-[40rem] text-[17px] leading-relaxed text-ink-soft sm:text-[18px]">
          Each skill folds a real build into a workflow your agent can follow: the order to work in,
          the rules, a small reference implementation to adapt, and the mistakes worth not repeating.
          Free and MIT licensed.
        </p>
        <div className="mt-8 flex max-w-full">
          <CopyCommand command={INSTALL_ALL} />
        </div>
      </section>

      <section id="skills" className={`${SHELL} scroll-mt-6`}>
        <h2 className="sr-only">The skills</h2>
        <ul className="flex flex-col gap-4">
          {SKILLS.map((skill) => (
            <li key={skill.slug}>
              <Link
                href={skill.href}
                className="group grid overflow-hidden rounded-[28px] bg-tile lg:grid-cols-[1.4fr_1fr]"
              >
                <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-[23rem]">
                  <img
                    src={skill.poster}
                    alt={skill.posterAlt}
                    width={1600}
                    height={900}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-quint group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-col justify-between gap-10 p-6 sm:p-8">
                  <div>
                    <p className="font-mono text-[12px] text-ink-soft">{skill.slug}</p>
                    <h3 className="mt-4 font-heading text-[26px] leading-[1.1] font-medium tracking-tighter text-balance sm:text-[30px]">
                      {skill.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{skill.builds}</p>
                  </div>
                  <span className="flex items-center gap-2 text-[14px] font-semibold">
                    See it live
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      strokeWidth={2.5}
                      className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${SHELL} mt-24 grid gap-10 lg:grid-cols-2 lg:gap-16`}>
        <div>
          <h2 className={H2}>What is an agent skill?</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
            An agent skill is a folder of instructions that a coding agent loads when a task calls for
            it. It has a SKILL.md with a name, a description of when to use it and a workflow, plus
            reference notes and code to adapt. The agent reads only the short description until your
            request matches, then loads the rest.
          </p>
        </div>
        <div>
          <h2 className={H2}>How is a skill different from a library?</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
            A library gives you a fixed set of components. A skill gives your agent the workflow to
            build its own, in your stack, with your content. That is why every skill here starts with
            a lab: a page where you judge the result by eye and send the values back, so the agent
            never tunes a look blind.
          </p>
        </div>
      </section>

      <section className={`${SHELL} mt-24`}>
        <h2 className={H2}>How do you install the skills?</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {INSTALL_STEPS.map((step, i) => (
            <li key={step.title} className="rounded-[28px] bg-tile p-6">
              <span className="grid size-7 place-items-center rounded-full bg-ink text-[12px] font-semibold text-canvas tabular-nums">
                {i + 1}
              </span>
              <h3 className="mt-5 text-[16px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${SHELL} mt-24`}>
        <h2 className={H2}>Questions, answered</h2>
        <div className="mt-8">
          <FaqList faqs={HOME_FAQ} />
        </div>
      </section>
    </>
  )
}
