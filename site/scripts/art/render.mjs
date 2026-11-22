// Renders the liquid glass demo's backgrounds: wallpaper.html in headless
// Chrome, one capture per palette, then AVIF and WebP in public/glass.
// A one off (`pnpm art`): the outputs are committed.
import { execFileSync } from "node:child_process"
import { mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import sharp from "sharp"

const here = dirname(fileURLToPath(import.meta.url))
const raw = join(here, "raw")
const out = join(here, "../../public/glass")
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const page = pathToFileURL(join(here, "wallpaper.html")).href

mkdirSync(raw, { recursive: true })
mkdirSync(out, { recursive: true })

for (const name of ["dusk", "tide", "grove"]) {
  const shot = join(raw, `${name}.png`)
  // The window is taller than the canvas: a headless window's page is a
  // little shorter than its window. The capture is cropped to the canvas.
  execFileSync(chrome, [
    "--headless=new", "--hide-scrollbars", "--enable-unsafe-swiftshader",
    "--window-size=2560,1800", "--force-device-scale-factor=1",
    `--user-data-dir=${join(raw, "profile")}`, `--screenshot=${shot}`, `${page}#${name}`,
  ], { stdio: "ignore" })
  const image = sharp(shot).extract({ left: 0, top: 0, width: 2560, height: 1600 })
  await image.clone().avif({ quality: 62, effort: 6 }).toFile(join(out, `${name}.avif`))
  await image.clone().webp({ quality: 84 }).toFile(join(out, `${name}.webp`))
  console.log("rendered", name)
}
rmSync(join(raw, "profile"), { recursive: true, force: true })
