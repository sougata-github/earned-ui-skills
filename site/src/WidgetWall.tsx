import { useEffect, useRef, useState, type ComponentType } from "react"

import * as W from "./widgets"
import type { WidgetProps } from "./widgets"

// The widget-bento-web lab's opening: a masonry wall of launch day widgets.
// Columns drift in alternating directions, slow on a critically damped
// spring and settle into one composed screen, then a conductor wakes the
// widgets one at a time, in a fixed order, so neighbours never change
// together. Nothing is random: speeds, phases and the order are fixed.
//
// Keys: Space plays the opening again, D switches the theme.
// ?autoplay plays it on load.

type Tile = {
  id: string
  Widget: ComponentType<WidgetProps>
  /** Height in px. Columns are balanced to about the same total. */
  h: number
  dark?: boolean
}

const COLUMNS: Tile[][] = [
  [
    { id: "calendar", Widget: W.Calendar, h: 352 },
    { id: "segmented", Widget: W.Segmented, h: 112 },
    { id: "signups", Widget: W.Signups, h: 248 },
    { id: "search", Widget: W.Search, h: 112 },
    { id: "seats", Widget: W.Seats, h: 196 },
  ],
  [
    { id: "deploy", Widget: W.Deploy, h: 136 },
    { id: "pipeline", Widget: W.Pipeline, h: 268 },
    { id: "uptime", Widget: W.Uptime, h: 252, dark: true },
    { id: "upload", Widget: W.Upload, h: 180 },
    { id: "crew", Widget: W.Crew, h: 184 },
  ],
  [
    { id: "invoice", Widget: W.Invoice, h: 360 },
    { id: "flag", Widget: W.Flag, h: 112 },
    { id: "voice", Widget: W.Voice, h: 200, dark: true },
    { id: "reviews", Widget: W.Reviews, h: 176 },
    { id: "composer", Widget: W.Composer, h: 112 },
  ],
  [
    { id: "countdown", Widget: W.Countdown, h: 196, dark: true },
    { id: "flags", Widget: W.Flags, h: 236 },
    { id: "chat", Widget: W.Chat, h: 336 },
    { id: "platforms", Widget: W.Platforms, h: 156 },
    { id: "allgo", Widget: W.AllGo, h: 112 },
  ],
  [
    { id: "revenue", Widget: W.Revenue, h: 248 },
    { id: "notifications", Widget: W.Notifications, h: 344 },
    { id: "rollout", Widget: W.Rollout, h: 136 },
    { id: "inbox", Widget: W.Inbox, h: 260 },
  ],
]

const GAP = 16
const PAD = 24
const COPIES = 4

// Cruise speed (px/s) and starting phase (share of a column's height) per
// column. Even columns drift up, odd ones down.
const SPEED = [34, 46, 38, 52, 42]
const PHASE = [0.42, 0.18, 0.66, 0.31, 0.54]
const RAMP = 0.9 // s to reach cruise speed
const SETTLE_AT = 4.6 // s
const STIFFNESS = 3.2 // spring rate (1/s), critically damped
const ALIVE_AFTER = 1.9 // s after the settle begins
const BEAT = 480 // ms between two state changes on the wall

const setHeight = (col: Tile[]) => col.reduce((sum, t) => sum + t.h + GAP, 0)

// The conductor's fixed order: rows across, skipping a column each time,
// so two changes in a row are never neighbours.
const ORDER = (() => {
  const ids: string[] = []
  const rows = Math.max(...COLUMNS.map((c) => c.length))
  for (let r = 0; r < rows; r++) {
    for (const c of [0, 2, 4, 1, 3]) {
      const tile = COLUMNS[c][(r + c) % COLUMNS[c].length]
      if (!ids.includes(tile.id)) ids.push(tile.id)
    }
  }
  for (const col of COLUMNS) for (const t of col) if (!ids.includes(t.id)) ids.push(t.id)
  return ids
})()

type Alive = { steps: Record<string, number>; t: number }

export function WidgetWall() {
  const columns = useRef<(HTMLDivElement | null)[]>([])
  const [alive, setAlive] = useState<Alive>({ steps: {}, t: 0 })

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const heights = COLUMNS.map(setHeight)
    const rest = heights.map((H) => PAD - H)
    let raf = 0
    let beat = 0

    const place = (ys: number[]) => {
      columns.current.forEach((el, i) => {
        if (!el) return
        const H = heights[i]
        // Copies are identical, so any whole number of sets is invisible.
        const base = PAD - 2 * H
        const y = base + ((((ys[i] - base) % H) + H) % H)
        el.style.transform = `translate3d(0, ${y}px, 0)`
      })
    }

    const stopAlive = () => {
      window.clearInterval(beat)
      setAlive({ steps: {}, t: 0 })
    }

    const play = () => {
      cancelAnimationFrame(raf)
      stopAlive()
      if (reduced) {
        place(rest)
        return
      }
      const ys = heights.map((H, i) => rest[i] + PHASE[i] * H)
      const vs = SPEED.map((s, i) => (i % 2 === 0 ? -s : s))
      let settle: { T: number; A: number; B: number }[] | null = null
      let start = 0
      let last = 0
      let woke = false

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        if (!start) start = last = now
        const t = (now - start) / 1000
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        if (t < SETTLE_AT) {
          const ramp = Math.min(1, t / RAMP)
          const k = ramp * ramp * (3 - 2 * ramp)
          ys.forEach((_, i) => (ys[i] += vs[i] * k * dt))
        } else {
          if (!settle) {
            // Land on the composed screen ahead of the drift, far enough
            // that a critically damped spring never overshoots.
            settle = ys.map((y, i) => {
              const H = heights[i]
              const v = vs[i]
              const reach = (Math.abs(v) * 1.1) / STIFFNESS
              let T = rest[i] + Math.round((y - rest[i]) / H) * H
              while ((v < 0 ? y - T : T - y) < reach) T += v < 0 ? -H : H
              const A = y - T
              return { T, A, B: v + STIFFNESS * A }
            })
          }
          const tau = t - SETTLE_AT
          settle.forEach((s, i) => {
            ys[i] = s.T + (s.A + s.B * tau) * Math.exp(-STIFFNESS * tau)
          })
          if (tau > ALIVE_AFTER && !woke) {
            woke = true
            const from = performance.now()
            let n = 0
            beat = window.setInterval(() => {
              const id = ORDER[n % ORDER.length]
              n++
              setAlive((a) => ({
                steps: { ...a.steps, [id]: (a.steps[id] ?? 0) + 1 },
                t: (performance.now() - from) / 1000,
              }))
            }, BEAT)
          }
          if (tau > 6) {
            cancelAnimationFrame(raf)
            place(rest)
            return
          }
        }
        place(ys)
      }
      raf = requestAnimationFrame(frame)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        play()
      }
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        document.documentElement.classList.toggle("dark")
      }
    }
    window.addEventListener("keydown", onKey)

    if (new URLSearchParams(window.location.search).has("autoplay")) play()
    else place(rest)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(beat)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <main
      className="fixed inset-0 grid gap-4 overflow-hidden bg-canvas"
      style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(0, 1fr))`, padding: `0 ${PAD}px` }}
    >
      {COLUMNS.map((col, c) => (
        <div key={c} className="relative">
          <div
            ref={(el) => {
              columns.current[c] = el
            }}
            className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
            style={{ gap: GAP }}
          >
            {Array.from({ length: COPIES }, (_, copy) =>
              col.map((tile) => (
                <section
                  key={`${copy}-${tile.id}`}
                  aria-hidden={copy > 0}
                  className={`shrink-0 rounded-[30px] p-5 ${tile.dark ? "bg-tile-dark text-on-dark" : "bg-tile"}`}
                  style={{ height: tile.h }}
                >
                  <tile.Widget step={alive.steps[tile.id] ?? 0} t={alive.t} />
                </section>
              ))
            )}
          </div>
        </div>
      ))}
    </main>
  )
}
