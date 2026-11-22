import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react"

// The wall: a bento of fixed size tiles that stays composed on every screen.
//
// Responsive by arrangement, never by squeezing. Every tile has a fixed
// height and is checked at a narrow range of widths, so a different screen
// gets the same tiles in a different number of columns. Each arrangement (a
// plan) is laid out by hand so its columns end level. A plan is a fixed
// stage zoomed to the window. Where a plan matches the window's shape it
// fits one screen. Where none does, the wall fills the width and scrolls, so
// it never floats between wide empty bands.
//
// Alive by state, not by motion. Each widget takes a `step` and shows the
// state for it. A conductor raises the step of two tiles every beat, in a
// fixed order. Nothing is random.
//
// The opening is optional (pass `title`): a blank canvas, the title coming
// into focus, then every tile flying in from enlarged and pushed out past
// the edges, the centre first, like a home screen on unlock.
//
// Needs `bento.css` beside it. React only, no other dependency.

export type WidgetProps = { step: number }

export type Tile = {
  /** The widget. Leave it out and the tile shows its name and size: the
   *  empty bento, for approving the structure before any content. */
  Widget?: ComponentType<WidgetProps>
  /** What the tile will prove, shown while it is empty. */
  label?: string
  /** Fixed height, px. Design the content to fill it on whole pixels. */
  h: number
  dark?: boolean
  /** Padding inside the tile, px. A tile that is one nested card uses less. */
  pad?: number
}

/** One tile, or several sharing a row. */
export type Cell = string | readonly string[]

export type Plan = {
  name: string
  /** Padding around the wall, px. */
  pad: number
  /** Column widths, px. Each is one the widgets were checked at. */
  widths: readonly number[]
  columns: readonly (readonly Cell[])[]
  /** Extra height for a tile in this plan, so the columns end level. */
  grow?: Readonly<Record<string, number>>
  /** The opening title's size, px. On one screen it scales with the stage. */
  title?: number
}

/** The values a lab tunes by eye and hands back as JSON. */
export type Look = {
  /** Between tiles, px. */
  gap: number
  /** Tile corner radius, px. A nested card's is this less the padding. */
  radius: number
  /** Tile padding, px, unless the tile sets its own. */
  pad: number
  /** Between two wakes of the conductor, ms. */
  beat: number
}
export const LOOK: Look = { gap: 14, radius: 28, pad: 18, beat: 520 }

const idsOf = (cell: Cell): readonly string[] => (typeof cell === "string" ? [cell] : cell)
const heightOf = (plan: Plan, tiles: Record<string, Tile>, id: string) =>
  (tiles[id]?.h ?? 0) + (plan.grow?.[id] ?? 0)

// ------------------------------------------------------------ layout

export type Box = { x: number; y: number; w: number; h: number }
export type Stage = Plan & {
  /** Where each tile rests, stage pixels. */
  boxes: Record<string, Box>
  width: number
  height: number
  /** How far the longest and shortest columns differ, px. Keep it 0. */
  ragged: number
}

/** Lays a plan out from its own numbers, so nothing measures the page. */
export function lay(plan: Plan, tiles: Record<string, Tile>, gap: number): Stage {
  const boxes: Record<string, Box> = {}
  const ends: number[] = []
  let x = plan.pad
  plan.columns.forEach((column, i) => {
    let y = plan.pad
    for (const cell of column) {
      const ids = idsOf(cell)
      const w = (plan.widths[i] - gap * (ids.length - 1)) / ids.length
      const h = heightOf(plan, tiles, ids[0])
      ids.forEach((id, k) => {
        boxes[id] = { x: x + k * (w + gap), y, w, h }
      })
      y += h + gap
    }
    ends.push(y - gap + plan.pad)
    x += plan.widths[i] + gap
  })
  const height = Math.max(...ends)
  return { ...plan, boxes, width: x - gap + plan.pad, height, ragged: height - Math.min(...ends) }
}

// Which plan, and how far to zoom it. Plans are given widest first.
//
//   1. One screen: the plan whose shape is closest to the window's, when it
//      fits at a readable size and leaves little of the window empty.
//   2. Otherwise scroll: the plan with the most columns that stays readable
//      at the window's width and is taller than the window.
//   3. Failing both (a very wide window): the closest one screen fit.
export type Fit = { index: number; zoom: number; single: boolean }
const SMALLEST = 0.72 // one screen is never zoomed below this
const READABLE = 0.78 // nor a scrolling plan below this
const LARGEST = 1.3 // nor a scrolling plan above this
const EMPTY = 0.15 // the share of the window one screen may leave empty

export function pickFit(stages: readonly Stage[], w: number, h: number, forced?: string): Fit {
  const only = stages.findIndex((stage) => stage.name === forced)
  if (only >= 0) {
    const { width, height } = stages[only]
    const zoom = Math.min(w / width, h / height)
    if (zoom >= SMALLEST) return { index: only, zoom, single: true }
    return { index: only, zoom: Math.min(w / width, LARGEST), single: false }
  }

  let best: (Fit & { empty: number }) | null = null
  stages.forEach(({ width, height }, index) => {
    const zoom = Math.min(w / width, h / height)
    if (zoom < SMALLEST) return
    const empty = 1 - (width * height * zoom * zoom) / (w * h)
    if (!best || empty < best.empty) best = { index, zoom, single: true, empty }
  })
  const one = best as (Fit & { empty: number }) | null
  if (one && one.empty <= EMPTY) return one

  for (let index = 0; index < stages.length; index++) {
    const { width, height } = stages[index]
    if (w / width < READABLE) continue
    const zoom = Math.min(w / width, LARGEST)
    if (width * zoom >= 0.9 * w && height * zoom >= h) return { index, zoom, single: false }
  }
  if (one) return one
  const index = stages.length - 1
  return { index, zoom: Math.min(w / stages[index].width, LARGEST), single: false }
}

/** The conductor's order, from a plan: row by row across the columns with a
 *  column skipped each time, so two changes in a row are never neighbours. */
export function wakeOrder(plan: Plan): string[] {
  const ids: string[] = []
  const across = [
    ...plan.columns.map((_, i) => i).filter((i) => i % 2 === 0),
    ...plan.columns.map((_, i) => i).filter((i) => i % 2 === 1),
  ]
  const depth = Math.max(...plan.columns.map((column) => column.length))
  for (let r = 0; r < depth; r++) {
    for (const c of across) {
      const cell = plan.columns[c][r]
      if (cell) ids.push(...idsOf(cell))
    }
  }
  return ids
}

// ------------------------------------------------------------ timeline

// The opening, ms.
const TITLE_IN = 400
const TITLE_OUT = 2400
const LAND_AT = 2750 // the title is nearly gone before the first tile shows
const LAND_FOR = 1200 // one tile's flight
const RIPPLE = 150 // the farthest tile leaves this long after the centre one

// The flight: how far out a tile starts (a share of its distance from the
// centre of the screen), how enlarged, and the curve it lands on. Fast at
// first, then a long soft settle, no overshoot.
const PUSH = 0.9
const SCALE = 1.5
const LAND = "cubic-bezier(0.2, 0.9, 0.2, 1)"
const SOFT = "cubic-bezier(0.33, 1, 0.68, 1)"

type Phase = "blank" | "title" | "out" | "wall" | "live"

// ------------------------------------------------------------ the wall

const TileView = memo(function TileView({
  id,
  tile,
  box,
  radius,
  pad,
  step,
  onWake,
}: {
  id: string
  tile: Tile
  box: Box
  radius: number
  pad: number
  step: number
  onWake?: (id: string) => void
}) {
  return (
    <section
      data-tile={id}
      data-dark={tile.dark ? "" : undefined}
      className="tile"
      style={{
        height: box.h,
        borderRadius: radius,
        padding: tile.pad ?? pad,
        cursor: onWake ? "pointer" : undefined,
      }}
      onClick={onWake ? () => onWake(id) : undefined}
    >
      {tile.Widget ? (
        <tile.Widget step={step} />
      ) : (
        <div className="tile-empty">
          <strong>{tile.label ?? id}</strong>
          <span>
            {Math.round(box.w)} × {box.h}
          </span>
        </div>
      )}
    </section>
  )
})

export type WallProps = {
  tiles: Record<string, Tile>
  /** Arrangements of the same tiles, the one with the most columns first. */
  plans: readonly Plan[]
  look?: Partial<Look>
  /** The opening's words. Leave it out and the wall is simply there. */
  title?: string
  /** The conductor's order. Defaults to `wakeOrder` of the first plan. */
  order?: readonly string[]
  /** The conductor runs. */
  live?: boolean
  /** The step each tile starts at. With `live` off this poses the wall, for
   *  a still capture with nothing caught mid change. */
  start?: Readonly<Record<string, number>>
  /** Show this plan whatever the window (a lab's control). */
  plan?: string
  /** Width taken by a panel on the right, px (a lab's controls). */
  inset?: number
  /** Change it to play the opening again. */
  replay?: number
  /** A click on a tile steps it to its next state. */
  clickToStep?: boolean
}

export function Wall({
  tiles,
  plans,
  look,
  title,
  order,
  live = true,
  start,
  plan: forced,
  inset = 0,
  replay = 0,
  clickToStep = false,
}: WallProps) {
  const { gap, radius, pad, beat } = { ...LOOK, ...look }
  const stageEl = useRef<HTMLDivElement>(null)
  const [view, setView] = useState(() => viewport(inset))
  const [phase, setPhase] = useState<Phase>("blank")
  const [steps, setSteps] = useState<Record<string, number>>(() => ({ ...start }))
  const turn = useRef(0)

  const stages = useMemo(() => plans.map((p) => lay(p, tiles, gap)), [plans, tiles, gap])
  const fit = useMemo(() => pickFit(stages, view.w, view.h, forced), [stages, view, forced])
  const stage = stages[fit.index]
  const wakes = useMemo(() => order ?? wakeOrder(plans[0]), [order, plans])

  // What the entrance reads when it runs, kept current.
  const now = useRef({ stage, zoom: fit.zoom, opens: title !== undefined, start })
  useEffect(() => {
    now.current = { stage, zoom: fit.zoom, opens: title !== undefined, start }
  }, [stage, fit.zoom, title, start])

  // Refit when the window changes. The observer also catches a scrollbar
  // arriving, which changes the width without a resize event.
  useEffect(() => {
    const refit = () => {
      const next = viewport(inset)
      setView((was) => (was.w === next.w && was.h === next.h ? was : next))
    }
    refit()
    const observer = new ResizeObserver(refit)
    observer.observe(document.documentElement)
    window.addEventListener("resize", refit)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", refit)
    }
  }, [inset])

  // The opening.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let flights: Animation[] = []
    const timers: number[] = []

    const stop = () => {
      flights.forEach((flight) => flight.cancel())
      flights = []
      timers.splice(0).forEach((t) => window.clearTimeout(t))
    }
    const land = () => {
      setPhase("wall")
      const { stage, zoom } = now.current
      const { boxes, width, height } = stage
      // The part of the stage on screen, in the stage's own pixels. The
      // tiles fly in around its centre, and only the ones in it fly.
      const viewH = window.innerHeight / zoom
      const viewTop = (window.scrollY - Math.max(0, (window.innerHeight - height * zoom) / 2)) / zoom
      const cx = width / 2
      const cy = viewTop + viewH / 2
      const far = Math.hypot(width / 2, Math.min(viewH, height) / 2)
      const els = stageEl.current?.querySelectorAll<HTMLElement>("[data-tile]") ?? []
      for (const el of els) {
        const box = boxes[el.dataset.tile ?? ""]
        if (!box || box.y + box.h < viewTop || box.y > viewTop + viewH) continue
        const dx = box.x + box.w / 2 - cx
        const dy = box.y + box.h / 2 - cy
        // The centre leaves first: the wall opens outward as it lands.
        const delay = Math.min(1, Math.hypot(dx, dy) / far) * RIPPLE
        const timing = { delay, fill: "backwards" } as const
        flights.push(
          el.animate(
            [
              { transform: `translate(${dx * PUSH}px, ${dy * PUSH}px) scale(${SCALE})` },
              { transform: "translate(0px, 0px) scale(1)" },
            ],
            { ...timing, duration: LAND_FOR, easing: LAND }
          ),
          // Seen and sharp well before it comes to rest. The blur is a
          // trace, only there to soften the first frames of the fade.
          el.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: 420, easing: SOFT }),
          el.animate([{ filter: "blur(3px)" }, { filter: "blur(0px)" }], {
            ...timing,
            duration: 320,
            easing: SOFT,
          })
        )
      }
    }
    const play = () => {
      stop()
      turn.current = 0
      setSteps({ ...now.current.start })
      if (reduced || !now.current.opens) {
        setPhase("live")
        return
      }
      setPhase("blank")
      timers.push(window.setTimeout(() => setPhase("title"), TITLE_IN))
      timers.push(window.setTimeout(() => setPhase("out"), TITLE_OUT))
      timers.push(window.setTimeout(land, LAND_AT))
      timers.push(window.setTimeout(() => setPhase("live"), LAND_AT + LAND_FOR + RIPPLE + 200))
    }

    // Wait for the fonts, so the title never swaps face mid entrance.
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) play()
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [replay])

  // The conductor: every beat, one tile and the one half the list away.
  useEffect(() => {
    if (phase !== "live" || !live || wakes.length === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      const n = turn.current++
      const a = wakes[n % wakes.length]
      const b = wakes[(n + Math.floor(wakes.length / 2)) % wakes.length]
      setSteps((s) => ({ ...s, [a]: (s[a] ?? 0) + 1, [b]: (s[b] ?? 0) + 1 }))
    }, beat)
    return () => window.clearInterval(id)
  }, [phase, live, wakes, beat])

  const wake = useMemo(
    () =>
      clickToStep
        ? (id: string) => setSteps((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }))
        : undefined,
    [clickToStep]
  )

  return (
    // Clipped, so a tile flying in from past the edge never adds a scrollbar.
    <main className="bento" data-phase={phase} style={{ marginRight: inset }}>
      {title !== undefined && (
        <h1
          className="title"
          style={{ right: inset, fontSize: (stage.title ?? 64) * (fit.single ? fit.zoom : 1) }}
        >
          <span>
            {title.split(" ").map((word, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span className="title-word" style={{ "--i": i } as CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </span>
        </h1>
      )}

      <div
        ref={stageEl}
        className="bento-stage"
        style={{ width: stage.width, height: stage.height, padding: stage.pad, gap, zoom: fit.zoom }}
      >
        {stage.columns.map((column, i) => (
          <div key={i} className="bento-column" style={{ width: stage.widths[i], gap }}>
            {column.map((cell) => {
              const ids = idsOf(cell)
              return (
                <div key={ids[0]} className="bento-row" style={{ gap, height: stage.boxes[ids[0]].h }}>
                  {ids.map((id) => (
                    <TileView
                      key={id}
                      id={id}
                      tile={tiles[id]}
                      box={stage.boxes[id]}
                      radius={radius}
                      pad={pad}
                      step={steps[id] ?? 0}
                      onWake={wake}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </main>
  )
}

function viewport(inset: number) {
  return { w: document.documentElement.clientWidth - inset, h: window.innerHeight }
}
