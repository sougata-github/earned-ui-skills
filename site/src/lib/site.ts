// The site's facts, in one place. Every page, the sitemap, robots.txt,
// llms.txt and the structured data read from here.

/** The public origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL for a
 *  real build: the fallback is a placeholder on a reserved domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://earned-ui-skills.example").replace(
  /\/$/,
  ""
)

export const SITE_NAME = "Earned UI Skills"
export const SITE_TITLE = "Earned UI Skills: agent skills for Claude Code, Codex and Cursor"
export const SITE_DESCRIPTION =
  "Free, open source UI skills for coding agents. Each skill folds a real build into a workflow that Claude Code, Codex or Cursor can follow: Liquid Glass with real refraction, and a bento of live widgets."

/** For search results: under 160 characters. */
export const SITE_SEO_DESCRIPTION =
  "Free, open source agent skills for Claude Code, Codex and Cursor: Liquid Glass with real refraction, and a bento of live widgets. Each one built in a lab."

export const REPO = "sougata-github/earned-ui-skills"
export const REPO_URL = `https://github.com/${REPO}`
export const SKILLS_SH_URL = `https://skills.sh/${REPO}`
export const INSTALL_ALL = `npx skills add ${REPO}`
export const installOne = (skill: string) => `${INSTALL_ALL} --skill ${skill}`

export const MAKER_NAME = "Sougata"
export const MAKER_URL = "https://github.com/sougata-github"
export const LICENSE_NAME = "MIT"
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`

/** An absolute URL for a site path. Pages end in a slash, files do not. */
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
