import { skills as all } from "#site/content"

export type Skill = (typeof all)[number]

/** The skills, in their listed order. */
export const SKILLS: Skill[] = [...all].sort((a, b) => a.order - b.order)

export const skillBySlug = (slug: string) => SKILLS.find((skill) => skill.slug === slug)

/** The part of a skill the structured data needs. */
export const facts = (skill: Skill) => ({
  name: skill.slug,
  title: skill.title,
  description: skill.description,
  href: skill.href,
  updatedAt: skill.updatedAt,
  keywords: skill.keywords,
  faq: skill.faq,
})
