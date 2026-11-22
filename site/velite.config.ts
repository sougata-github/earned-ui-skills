import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import remarkGfm from "remark-gfm"
import { defineCollection, defineConfig, s } from "velite"

import { HOME_FAQ, type Faq } from "./src/lib/faq"
import {
  INSTALL_ALL,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SKILLS_SH_URL,
  installOne,
} from "./src/lib/site"

// One collection: the skills. Every field feeds a real surface. The title
// and description are the page's heading and the answer under it, written to
// be quoted on their own. The SEO fields, keywords and FAQ feed the metadata
// and the structured data. The body is plain Markdown with question
// headings, so it can also be published as a Markdown twin for agents.
const skills = defineCollection({
  name: "Skill",
  pattern: "skills/*.mdx",
  schema: s
    .object({
      // The skill's name, as installed: `--skill <slug>`.
      slug: s.slug("skills"),
      // The page heading.
      title: s.string().max(120),
      // One line for the card on the home page: what the skill builds.
      builds: s.string().max(160),
      // The answer under the heading, also the llms.txt line.
      description: s.string().max(300),
      seoTitle: s.string().max(60),
      seoDescription: s.string().max(160),
      // From OpenSEO search volumes (docs/seo.md).
      keywords: s.array(s.string()).max(20),
      updatedAt: s.isodate(),
      order: s.number(),
      poster: s.string(),
      posterAlt: s.string(),
      // The workflow, as short steps.
      steps: s.array(s.object({ title: s.string().max(60), text: s.string().max(260) })),
      faq: s.array(s.object({ question: s.string(), answer: s.array(s.string()).min(1) })),
      body: s.mdx(),
      raw: s.raw(),
    })
    .transform((data) => ({
      ...data,
      href: `/skills/${data.slug}/`,
      markdownHref: `/skills/${data.slug}.md`,
      demoHref: `/demo/${data.slug}/`,
      install: installOne(data.slug),
    })),
})

// ------------------------------------------------------------ for agents

const faqMarkdown = (faqs: Faq[]) =>
  faqs.map((f) => `### ${f.question}\n\n${f.answer.join("\n\n")}`).join("\n\n")

/** Site links in Markdown made absolute, so a twin reads anywhere. */
const absolute = (markdown: string) => markdown.replace(/\]\(\//g, `](${SITE_URL}/`)

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { skills },
  mdx: { remarkPlugins: [remarkGfm] },
  // After the content is built: a Markdown twin of every skill page and an
  // llms.txt that lists them, for agents and answer engines that would
  // rather read text than a page. Written to public/, not committed.
  complete: ({ skills }) => {
    const all = [...skills].sort((a, b) => a.order - b.order)
    mkdirSync(join("public", "skills"), { recursive: true })

    for (const skill of all) {
      const twin = [
        `# ${skill.title}`,
        `> ${skill.description}`,
        `Install: \`${skill.install}\``,
        absolute(skill.raw.trim()),
        "## Frequently asked questions",
        faqMarkdown(skill.faq),
        `Read on the site at ${SITE_URL}${skill.href}`,
      ].join("\n\n")
      writeFileSync(join("public", "skills", `${skill.slug}.md`), `${twin}\n`)
    }

    const llms = [
      `# ${SITE_NAME}`,
      `> ${SITE_DESCRIPTION}`,
      `Install every skill with \`${INSTALL_ALL}\`. The skills follow the open agent skills format (a SKILL.md with a name, a description and a workflow) and work with Claude Code, Codex and Cursor. They are free and MIT licensed.`,
      "## Skills",
      all.map((skill) => `- [${skill.slug}](${SITE_URL}${skill.markdownHref}): ${skill.description}`).join("\n"),
      "## Source",
      [`- [GitHub repository](${REPO_URL}): the skills, their assets and this site`, `- [skills.sh listing](${SKILLS_SH_URL})`].join("\n"),
      "## Frequently asked questions",
      faqMarkdown(HOME_FAQ),
    ].join("\n\n")
    writeFileSync(join("public", "llms.txt"), `${llms}\n`)
  },
})
