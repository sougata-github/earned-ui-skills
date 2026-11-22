// The site runs on the skill's own assets, so what ships in the skill is
// what is seen here. This copies them into src/skill (not committed) before
// every dev, build and typecheck.
import { cpSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const from = join(here, "../../skills/widget-bento-web/assets")
const to = join(here, "../src/skill")

rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
