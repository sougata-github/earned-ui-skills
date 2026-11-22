// The site runs on the skills' own assets, so what ships in a skill is what
// is seen here. This copies them into src/skill (not committed) before every
// dev, build and typecheck. Edit the assets in skills/, never the copies.
import { cpSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const skills = join(here, "../../skills")
const to = join(here, "../src/skill")

rmSync(to, { recursive: true, force: true })
mkdirSync(join(to, "glass"), { recursive: true })
cpSync(join(skills, "widget-bento-web/assets"), join(to, "widget"), { recursive: true })
cpSync(join(skills, "liquid-glass-web/assets/glass.ts"), join(to, "glass/glass.ts"))
