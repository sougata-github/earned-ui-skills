import type { Metadata } from "next"

import type { Faq } from "@/lib/faq"
import {
  LICENSE_URL,
  MAKER_NAME,
  MAKER_URL,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  abs,
} from "@/lib/site"

// Metadata and structured data, built the same way for every page.

export const OG_SIZE = { width: 1200, height: 630 }

/** A page's metadata: an absolute canonical with a trailing slash, and a
 *  full Open Graph object (a page's openGraph replaces the layout's, so the
 *  shared fields are repeated here). */
export function pageMetadata(page: {
  title: string
  description: string
  path: string
  keywords?: string[]
  image: string
  imageAlt: string
}): Metadata {
  const url = abs(page.path)
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    authors: [{ name: MAKER_NAME, url: MAKER_URL }],
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: abs(page.image), ...OG_SIZE, alt: page.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [abs(page.image)],
    },
  }
}

const ID = {
  site: `${SITE_URL}/#website`,
  maker: `${SITE_URL}/#maker`,
}

const maker = {
  "@type": "Person",
  "@id": ID.maker,
  name: MAKER_NAME,
  url: MAKER_URL,
  sameAs: [MAKER_URL],
}

export const faqEntity = (faqs: Faq[]) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") },
  })),
})

const crumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
})

type SkillFacts = {
  name: string
  title: string
  description: string
  href: string
  updatedAt: string
  keywords: string[]
  faq: Faq[]
}

/** One skill as source code: free, MIT, in the repository. */
const skillEntity = (skill: SkillFacts) => ({
  "@type": "SoftwareSourceCode",
  "@id": `${abs(skill.href)}#skill`,
  name: skill.name,
  description: skill.description,
  url: abs(skill.href),
  codeRepository: REPO_URL,
  programmingLanguage: ["TypeScript", "Markdown"],
  runtimePlatform: "Claude Code, Codex, Cursor",
  license: LICENSE_URL,
  isAccessibleForFree: true,
  keywords: skill.keywords.join(", "),
  dateModified: skill.updatedAt,
  author: { "@id": ID.maker },
})

/** The home page: the site, its maker, the list of skills, the FAQ. */
export function homeStructuredData(skills: SkillFacts[], faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ID.site,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": ID.maker },
      },
      maker,
      {
        "@type": "ItemList",
        name: "Agent skills in Earned UI Skills",
        itemListElement: skills.map((skill, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: abs(skill.href),
          name: skill.name,
        })),
      },
      ...skills.map(skillEntity),
      faqEntity(faqs),
    ],
  }
}

/** A skill page: the page, its trail, the skill and its FAQ. */
export function skillStructuredData(skill: SkillFacts) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${abs(skill.href)}#page`,
        url: abs(skill.href),
        name: skill.title,
        description: skill.description,
        dateModified: skill.updatedAt,
        isPartOf: { "@id": ID.site },
        about: { "@id": `${abs(skill.href)}#skill` },
        author: { "@id": ID.maker },
      },
      maker,
      crumbs([
        { name: SITE_NAME, path: "/" },
        { name: skill.name, path: skill.href },
      ]),
      skillEntity(skill),
      ...(skill.faq.length ? [faqEntity(skill.faq)] : []),
    ],
  }
}
