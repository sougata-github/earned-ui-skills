"use client"

import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowBigUpDashIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CodeIcon,
  CreditCardIcon,
  GitBranchIcon,
  Globe02Icon,
  Invoice01Icon,
  Loading03Icon,
  MinusSignIcon,
  PauseIcon,
  PlayIcon,
  Search01Icon,
  SmartPhone01Icon,
  StarIcon,
  Tick02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"

import {
  CHAT,
  CREW,
  CUSTOMER,
  INBOX,
  LATENCY,
  LAUNCH,
  MRR,
  NOTIFICATIONS,
  PIPELINE,
  PRODUCT,
  REGIONS,
  ROLLOUT,
  SEARCH,
  SIGNUP_RANGES,
  UPLOAD,
  type CrewId,
} from "./story"
import { Digits, Swap } from "@/skill/widget/pieces"
import type { WidgetProps } from "@/skill/widget/wall"

// The launch day wall's widgets. Each one tells one part of the story, is
// laid out to fill its tile exactly, and steps through a few states when
// the conductor reaches it (`step` counts its turns).
//
// One anatomy everywhere: a 14px semibold title, 12px soft meta, a 34px
// number, white cards nested in the grey tile (their radius concentric with
// the tile's), round 28px controls, Hugeicons for every glyph. Colour has a
// meaning: green is live or done, blue is people and traffic, orange is the
// launch itself, violet is files and search, amber is praise.
//
// State changes are explicit and smooth: digits turn like an odometer, text
// crossfades (a 2px blur only where the old and new text overlap), rows
// glide to their new slot. `Digits` and `Swap` are the skill's own pieces.

const TITLE = "text-[14px] leading-none font-semibold tracking-[-0.01em]"
const META = "text-[12px] leading-none text-ink-soft"
const NUM = "text-[34px] leading-none font-semibold tracking-[-0.035em]"
const CARD = "bg-tile-inner shadow-(--lift)"
const PILL =
  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] leading-none font-semibold"
const GLIDE = "duration-600 ease-out-quint"

const at = <T,>(list: readonly T[], step: number) => list[step % list.length]

// ------------------------------------------------------------ pieces

function Icon({
  icon,
  className = "size-4",
  stroke = 2,
}: {
  icon: IconSvgElement
  className?: string
  stroke?: number
}) {
  return <HugeiconsIcon icon={icon} strokeWidth={stroke} className={className} />
}

function Avatar({ who, size = "size-7 text-[11px]" }: { who: CrewId; size?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${size} ${CREW[who].tone}`}
    >
      {who}
    </span>
  )
}

function Spinner({ className = "size-4" }: { className?: string }) {
  return <HugeiconsIcon icon={Loading03Icon} strokeWidth={2.5} className={`spin ${className}`} />
}

/** A green disc with a tick: done. */
function Check({ className = "size-[22px]" }: { className?: string }) {
  return (
    <span
      className={`pop grid shrink-0 place-items-center rounded-full bg-green text-ink-fixed ${className}`}
    >
      <Icon icon={Tick02Icon} className="size-[55%]" stroke={3.5} />
    </span>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${GLIDE} ${on ? "bg-green" : "bg-ink-faint"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-on-dark shadow-(--lift) transition-transform ${GLIDE} ${on ? "translate-x-4" : ""}`}
      />
    </span>
  )
}

function RoundButton({ children }: { children: ReactNode }) {
  return <span className="grid size-7 place-items-center rounded-full bg-ink-faint">{children}</span>
}

/** Types `text` a key at a time while `on`, at a steady hand. */
function useTyped(text: string, on: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!on) {
      setCount(0)
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) window.clearInterval(id)
    }, 62)
    return () => window.clearInterval(id)
  }, [text, on])
  return text.slice(0, count)
}

// ------------------------------------------------------------ column 1

export function Calendar({ step }: WidgetProps) {
  // Launch day stays marked. Only the note under the month changes, between
  // the day's two events.
  const day = LAUNCH.day
  const index = LAUNCH.firstWeekday + day - 1
  const cells = [
    ...Array.from({ length: LAUNCH.firstWeekday }, () => null),
    ...Array.from({ length: LAUNCH.days }, (_, i) => i + 1),
  ]
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>{LAUNCH.month}</p>
        <div className="flex gap-1.5">
          <RoundButton>
            <Icon icon={ArrowLeft01Icon} className="size-3.5" stroke={2.5} />
          </RoundButton>
          <RoundButton>
            <Icon icon={ArrowRight01Icon} className="size-3.5" stroke={2.5} />
          </RoundButton>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 text-center text-[11px] leading-4 text-ink-soft">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="relative mt-1.5 grid grid-cols-7 text-center text-[13px] tabular-nums">
          <span
            className="absolute top-0 left-0 grid h-8 w-[calc(100%/7)] place-items-center"
            style={{
              transform: `translate(${(index % 7) * 100}%, ${Math.floor(index / 7) * 32}px)`,
            }}
          >
            <span className="size-[30px] rounded-full bg-orange" />
          </span>
          {cells.map((d, i) => (
            <span
              key={i}
              className={`relative grid h-8 place-items-center ${
                d === day ? "font-semibold text-on-dark" : d && d < day ? "text-ink-soft" : ""
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 rounded-[10px] bg-ink-faint px-3 text-[12px] font-medium">
        <span className="grid place-items-center text-orange-ink">
          <Icon icon={Calendar03Icon} className="size-4" />
        </span>
        <Swap
          value={
            step % 2 === 1
              ? "Launch call, 4:00 PM"
              : `${PRODUCT.name} ${PRODUCT.version} launch, 9:00 AM`
          }
        />
      </div>
    </div>
  )
}

export function Signups({ step }: WidgetProps) {
  const i = step % SIGNUP_RANGES.length
  const range = SIGNUP_RANGES[i]
  const peak = 131
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Signups</p>
        {/* The range switch belongs to this number: it changes it. A 32px
            track, the thumb inset 4px on every side, three 40px segments. */}
        <div className="relative grid h-8 w-[128px] grid-cols-3 rounded-full bg-well p-1 text-[11px] leading-none font-semibold">
          <span
            className={`absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-tile-inner shadow-(--lift) transition-transform ${GLIDE}`}
            style={{ transform: `translateX(${i * 100}%)` }}
          />
          {SIGNUP_RANGES.map((r, j) => (
            <span
              key={r.key}
              className={`relative grid place-items-center transition-colors ${GLIDE} ${j === i ? "" : "text-ink-soft"}`}
            >
              {r.key}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <p className={NUM}>
          <Digits value={range.total.toLocaleString("en-US")} />
        </p>
        <span className={`${PILL} bg-blue/14 text-blue-ink`}>
          <Swap value={range.delta} />
        </span>
      </div>

      <div className="flex h-[92px] items-end gap-1.5">
        {range.bars.map((v, j) => (
          <span
            key={j}
            className={`flex-1 rounded-[7px] transition-[height] duration-700 ease-out-quint ${j === range.bars.length - 1 ? "bg-blue" : "bg-blue/18"}`}
            style={{ height: `${(v / peak) * 100}%`, transitionDelay: `${j * 35}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export function Search({ step }: WidgetProps) {
  const on = step % 2 === 1
  const typed = useTyped(SEARCH, on)
  const found = on && typed.length === SEARCH.length
  return (
    <div className={`flex h-full items-center gap-2 rounded-full pr-1.5 pl-3.5 ${CARD}`}>
      <Icon icon={Search01Icon} className="size-4 shrink-0 text-ink-soft" />
      <span className="flex-1 text-[13px] whitespace-nowrap">
        {typed || <span className="text-ink-soft">Search tickets</span>}
        {on && (
          <span className="caret ml-px inline-block h-[1.05em] w-[1.5px] translate-y-[2px] bg-violet" />
        )}
      </span>
      <span
        className={`grid h-8 place-items-center rounded-full bg-violet px-3 text-[11px] leading-none font-semibold text-on-dark transition-[opacity,scale] ${GLIDE} ${found ? "" : "scale-95 opacity-0"}`}
      >
        3 results
      </span>
    </div>
  )
}

export function OnCall({ step }: WidgetProps) {
  const who: CrewId = step % 2 === 1 ? "A" : "K"
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={META}>On call</p>
      <div className="flex items-center gap-2">
        <span key={who} className="pop">
          <Avatar who={who} />
        </span>
        <div className="flex flex-col gap-1.5">
          <Swap value={CREW[who].name} className={TITLE} />
          <Swap
            value={who === "K" ? "Until 6 PM" : "Until 2 AM"}
            className="text-[11px] leading-none text-ink-soft"
          />
        </div>
      </div>
    </div>
  )
}

export function Seats({ step }: WidgetProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={META}>Seats</p>
      <div className="flex items-center justify-between">
        <RoundButton>
          <Icon icon={MinusSignIcon} className="size-3.5" stroke={2.5} />
        </RoundButton>
        <p className="text-[26px] leading-none font-semibold">
          <Digits value={4 + (step % 3)} />
        </p>
        <span className="grid size-7 place-items-center rounded-full bg-ink text-canvas">
          <Icon icon={Add01Icon} className="size-3.5" stroke={2.5} />
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 2

export function Deploy({ step }: WidgetProps) {
  const live = step % 2 === 1
  return (
    <div className="grid h-full place-items-center">
      <span
        className={`flex h-10 w-[188px] items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors ${GLIDE} ${live ? "bg-green text-ink-fixed" : "bg-ink text-canvas"}`}
      >
        <span key={String(live)} className="pop grid place-items-center">
          {live ? <Icon icon={Tick02Icon} className="size-4" stroke={3} /> : <Spinner />}
        </span>
        <Swap value={live ? `${PRODUCT.name} ${PRODUCT.version} is live` : "Deploying"} />
      </span>
    </div>
  )
}

export function Pipeline({ step }: WidgetProps) {
  const done = step % (PIPELINE.length + 1)
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Release</p>
        <span className={`${META} tabular-nums`}>main #482</span>
      </div>
      <ul className="flex flex-col gap-3">
        {PIPELINE.map((p, i) => (
          <li key={p.stage} className="flex h-7 items-center gap-2.5 text-[13px]">
            <span className="grid size-[22px] place-items-center">
              {i < done ? (
                <Check />
              ) : i === done ? (
                <span key="run" className="pop grid place-items-center text-ink-soft">
                  <Spinner className="size-[18px]" />
                </span>
              ) : (
                <span className="size-[18px] rounded-full border-2 border-ink-faint" />
              )}
            </span>
            <span
              className={`font-medium transition-colors ${GLIDE} ${i <= done ? "" : "text-ink-soft"}`}
            >
              {p.stage}
            </span>
            <span
              className={`ml-auto text-[11px] text-ink-soft tabular-nums transition-opacity ${GLIDE} ${i < done ? "" : "opacity-0"}`}
            >
              {p.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Regions({ step }: WidgetProps) {
  const live = 1 + (step % REGIONS.length)
  // One ring: a groove, and a fill inset in it that grows a quarter per
  // region.
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="relative size-[132px]">
        <svg viewBox="0 0 104 104" className="size-full -rotate-90" fill="none">
          <circle cx="52" cy="52" r={r} strokeWidth="12" className="stroke-on-dark-faint" />
          <circle
            cx="52"
            cy="52"
            r={r}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - live / REGIONS.length)}
            className="stroke-blue transition-[stroke-dashoffset] duration-900 ease-out-quint"
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-[28px] leading-none font-semibold tracking-[-0.03em]">
          <span>
            <Digits value={live} />
            <span className="text-on-dark-soft">/4</span>
          </span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Swap value={`${REGIONS[live - 1]} is live`} className={TITLE} />
        <p className="text-[12px] leading-none text-on-dark-soft">Regions rolled out</p>
      </div>
    </div>
  )
}

export function Upload({ step }: WidgetProps) {
  const s = at(UPLOAD.states, step)
  const done = s.share === 1
  return (
    <div className="flex h-full flex-col justify-between">
      <span
        className={`grid size-9 place-items-center rounded-[10px] transition-colors ${GLIDE} ${done ? "bg-green/16 text-green-ink" : "bg-violet/14 text-violet-ink"}`}
      >
        <span key={String(done)} className="pop grid place-items-center">
          <Icon icon={done ? Tick02Icon : ArrowBigUpDashIcon} className="size-[18px]" stroke={done ? 3 : 2} />
        </span>
      </span>
      <div className="flex flex-col gap-2">
        <p className={TITLE}>{UPLOAD.file}</p>
        <Swap value={s.note} className={META} />
      </div>
      <div className="h-1.5 rounded-full bg-ink-faint">
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-900 ease-out-quint ${done ? "bg-green" : "bg-violet"}`}
          style={{ width: `${s.share * 100}%` }}
        />
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 3

export function Invoice({ step }: WidgetProps) {
  const s = step % 3
  return (
    <div className={`flex h-full flex-col justify-between rounded-[16px] p-4 ${CARD}`}>
      <div className="flex items-center justify-between">
        <p className={TITLE}>Invoice to {CUSTOMER.name}</p>
        <RoundButton>
          <Icon icon={Cancel01Icon} className="size-3" stroke={2.5} />
        </RoundButton>
      </div>
      <p className="flex h-[34px] items-center gap-2 rounded-[10px] bg-ink-faint px-2.5 text-[12px] font-medium">
        <span key={s} className="pop grid size-[18px] place-items-center">
          {s === 2 ? (
            <Check className="size-[18px]" />
          ) : s === 1 ? (
            <Spinner />
          ) : (
            <Icon icon={Invoice01Icon} className="size-4 text-ink-soft" />
          )}
        </span>
        <Swap value={["Ready to send", "Sending to Northwind", "Sent, due Dec 1"][s]} />
      </p>
      <dl className="flex flex-col gap-2.5 text-[13px] leading-[18px]">
        {[
          ["Plan", CUSTOMER.plan],
          ["Amount", CUSTOMER.amount],
          ["Due", CUSTOMER.due],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-ink-soft">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-2 gap-2 text-[13px] font-semibold">
        <span className="grid h-10 place-items-center rounded-full bg-ink-faint">Cancel</span>
        <span
          className={`flex h-10 items-center justify-center gap-2 rounded-full transition-colors ${GLIDE} ${s === 2 ? "bg-green text-ink-fixed" : "bg-ink text-canvas"}`}
        >
          {/* Sent is said once, by the word and the colour. No tick as well. */}
          {s === 1 && (
            <span className="pop grid place-items-center">
              <Spinner />
            </span>
          )}
          <Swap value={["Send", "Sending", "Sent"][s]} />
        </span>
      </div>
    </div>
  )
}

const WAVE = [5, 9, 14, 8, 18, 12, 22, 16, 10, 20, 14, 8, 16, 24, 12, 18, 10, 14, 20, 8, 12, 16, 10, 6]

function Wave({ tone }: { tone: string }) {
  return (
    <span className="flex h-7 items-center gap-[3px]">
      {WAVE.map((h, i) => (
        <span key={i} className={`w-[3px] rounded-full ${tone}`} style={{ height: h }} />
      ))}
    </span>
  )
}

export function Voice({ step }: WidgetProps) {
  const s = step % 4
  const played = [0, 0.38, 0.74, 1][s]
  const playing = s === 1 || s === 2
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-2.5">
        <Avatar who="M" size="size-9 text-[13px]" />
        <div className="flex flex-col gap-2">
          <p className={TITLE}>{CREW.M.name}</p>
          <p className="text-[12px] leading-none text-on-dark-soft">Voice note, launch call</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange text-on-dark">
          <span key={String(playing)} className="pop grid place-items-center">
            <Icon icon={playing ? PauseIcon : PlayIcon} className="size-4" stroke={2.5} />
          </span>
        </span>
        {/* Two copies of the wave: the played one is revealed left to right. */}
        <span className="relative block">
          <Wave tone="bg-on-dark-faint" />
          <span
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${(1 - played) * 100}% 0 0)`,
              transition: s === 0 ? "none" : "clip-path 1500ms linear",
            }}
          >
            <Wave tone="bg-orange" />
          </span>
        </span>
        <span className="ml-auto text-[11px] text-on-dark-soft tabular-nums">0:24</span>
      </div>
    </div>
  )
}

const CHAT_ROWS = 5
const CHAT_SLOT = 42
/** How far past the list's edge a row waits or leaves, px, and how fast a
 *  leaving row fades, ms. Short and quick, so it is gone before it reaches
 *  anything beside the list. */
const EDGE = 12
const LEAVE = 220

export function Chat({ step }: WidgetProps) {
  const n = CHAT.length
  const message = (k: number) => CHAT[((k % n) + n) % n]
  // One above and one below the window stay mounted, unseen. A line arrives
  // from just under the last row and leaves just over the first, a short
  // step and a quick fade, so it never crosses the header or the typing row
  // on its way. Each row is `moving-text`: it keeps its own layer for good,
  // so its words never shift as a glide ends.
  const keys = Array.from({ length: CHAT_ROWS + 2 }, (_, o) => step - 1 + o)
  const typing = message(step + CHAT_ROWS).who
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>#launch</p>
        <span className={META}>5 online</span>
      </div>

      <div className="relative" style={{ height: CHAT_ROWS * CHAT_SLOT - 8 }}>
        {keys.map((k) => {
          const m = message(k)
          const slot = k - step
          const seen = slot >= 0 && slot < CHAT_ROWS
          const mine = m.who === "A"
          return (
            <div
              key={k}
              className={`moving-text absolute inset-x-0 top-0 flex h-[34px] items-center gap-2 transition-[transform,opacity] ${GLIDE} ${mine ? "flex-row-reverse" : ""}`}
              style={{
                transform: `translateY(${slot < 0 ? -EDGE : slot < CHAT_ROWS ? slot * CHAT_SLOT : (CHAT_ROWS - 1) * CHAT_SLOT + EDGE}px)`,
                opacity: seen ? 1 : 0,
                zIndex: seen ? 1 : 0,
                // transform, opacity: a row that leaves fades faster than it moves.
                transitionDuration: seen ? undefined : `600ms, ${LEAVE}ms`,
              }}
            >
              {!mine && <Avatar who={m.who} size="size-6 text-[10px]" />}
              <p
                className={`rounded-[17px] px-3 py-2 text-[13px] leading-[18px] whitespace-nowrap ${mine ? "bg-blue text-on-dark" : CARD}`}
              >
                {m.text}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex h-[30px] items-center gap-2">
        <span key={typing} className="pop">
          <Avatar who={typing} size="size-6 text-[10px]" />
        </span>
        <span className={`dots flex h-[30px] items-center gap-1 rounded-full px-3 ${CARD}`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-ink" />
          ))}
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 4

/** The one clock on the wall. Paused with the conductor, so a capture never
 *  catches a digit mid roll. */
export const clock = { paused: false }

export function Countdown() {
  const [left, setLeft] = useState(41 * 60 + 58)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!clock.paused) setLeft((s) => (s > 0 ? s - 1 : 41 * 60 + 58))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])
  const two = (v: number) => String(v).padStart(2, "0")
  return (
    <div className="flex h-full flex-col justify-between">
      <p className="text-[12px] leading-none text-on-dark-soft">Launch in</p>
      <p className="text-[38px] leading-none font-semibold tracking-[-0.03em]">
        <Digits value={`00:${two(Math.floor(left / 60))}:${two(left % 60)}`} />
      </p>
      <p className="text-[12px] leading-none text-on-dark-soft">All checks green</p>
    </div>
  )
}

export function Flags({ step }: WidgetProps) {
  const swap = step % 2 === 1
  const rows = [
    { name: "Usage alerts", note: "Email near the limit", on: !swap },
    { name: "Team dark mode", note: "Follows the system", on: swap },
  ]
  return (
    <div className={`flex h-full flex-col divide-y divide-ink-faint rounded-[16px] px-3.5 ${CARD}`}>
      {rows.map((r) => (
        <div key={r.name} className="flex flex-1 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-[13px] leading-none font-semibold">{r.name}</p>
            <p className="truncate text-[11px] leading-none text-ink-soft">{r.note}</p>
          </div>
          <Toggle on={r.on} />
        </div>
      ))}
    </div>
  )
}

const PLATFORMS = [
  { name: "Web", icon: Globe02Icon, tone: "text-blue-ink" },
  { name: "API", icon: CodeIcon, tone: "text-violet-ink" },
  { name: "iOS", icon: SmartPhone01Icon, tone: "text-orange-ink" },
] as const

export function Platforms({ step }: WidgetProps) {
  const ios = step % 2 === 1
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Shipping to</p>
        <Swap value={ios ? "3 of 3 live" : "2 of 3 live"} className={META} />
      </div>
      {/* Three small cards, one per platform. Live is its glyph in its own
          colour, pending is a spinner in soft ink. No status dot as well. */}
      <div className="grid grid-cols-3 gap-2.5">
        {PLATFORMS.map((p, i) => {
          const live = i < 2 || ios
          return (
            <div
              key={p.name}
              className={`flex h-[52px] flex-col items-center justify-center gap-1.5 rounded-[10px] ${CARD}`}
            >
              <span key={String(live)} className={`pop grid place-items-center ${live ? p.tone : "text-ink-soft"}`}>
                {live ? <Icon icon={p.icon} className="size-[18px]" /> : <Spinner className="size-[18px]" />}
              </span>
              <span
                className={`text-[11px] leading-none font-semibold transition-colors ${GLIDE} ${live ? "" : "text-ink-soft"}`}
              >
                {p.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Reviews({ step }: WidgetProps) {
  const five = step % 2 === 1
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={TITLE}>First reviews</p>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => {
          const on = i < 4 || five
          return (
            <span
              key={`${i}${on}`}
              className={`${i === 4 && on ? "pop" : ""} ${on ? "text-amber" : "text-ink-faint"}`}
            >
              <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="size-[26px] fill-current" />
            </span>
          )
        })}
      </div>
      <Swap value={five ? "4.8 from 37 teams" : "4.7 from 36 teams"} className={META} />
    </div>
  )
}

export function Latency({ step }: WidgetProps) {
  const s = at(LATENCY, step)
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={META}>Response time, p95</p>
      <p className={NUM}>
        <Digits value={s.ms} />
        <span className="ml-1 text-[14px] font-medium tracking-normal text-ink-soft">ms</span>
      </p>
      <span className={`${PILL} w-fit bg-green/16 text-green-ink`}>
        <Swap value={s.delta} />
      </span>
    </div>
  )
}

// ------------------------------------------------------------ column 5

// A smooth curve through the points (Catmull-Rom as cubic Beziers), so the
// line rises and dips the way revenue does, with no corners.
function smooth(points: readonly (readonly [number, number])[]) {
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

export function Revenue({ step }: WidgetProps) {
  const s = at(MRR, step)
  const W = 200
  const H = 80
  const min = 10.5
  const max = 20.6
  const pts = s.points.map(
    (v, i) => [(i / (s.points.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const
  )
  const line = smooth(pts)
  const [, ly] = pts[pts.length - 1]
  const morph = "transition-[d] duration-900 ease-out-quint"
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Monthly revenue</p>
        <span className={`${PILL} bg-green/16 text-green-ink`}>+12%</span>
      </div>
      <p className={NUM}>
        $<Digits value={s.value} />k
      </p>
      <div className="relative mr-1.5 h-[92px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          fill="none"
        >
          <defs>
            <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--green)" stopOpacity="0.32" />
              <stop offset="1" stopColor="var(--green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* The path as CSS too, so the curve glides to its new shape where
              the browser can (every state has the same number of points). */}
          <path
            d={`${line}L${W} ${H}L0 ${H}Z`}
            fill="url(#mrr-fill)"
            className={morph}
            style={{ d: `path("${line}L${W} ${H}L0 ${H}Z")` } as CSSProperties}
          />
          <path
            d={line}
            stroke="var(--green)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={morph}
            style={{ d: `path("${line}")` } as CSSProperties}
          />
        </svg>
        <span
          className="absolute right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-green bg-tile transition-[top] duration-900 ease-out-quint"
          style={{ top: `${(ly / H) * 100}%` }}
        />
      </div>
    </div>
  )
}

const NOTE_SLOT = 62
const NOTE_LOOK = {
  build: { icon: GitBranchIcon, tone: "bg-green/16 text-green-ink" },
  payment: { icon: CreditCardIcon, tone: "bg-blue/14 text-blue-ink" },
  signups: { icon: UserAdd01Icon, tone: "bg-violet/14 text-violet-ink" },
  review: { icon: StarIcon, tone: "bg-amber/20 text-amber-ink" },
  region: { icon: Globe02Icon, tone: "bg-orange/14 text-orange-ink" },
} as const

export function Notifications({ step }: WidgetProps) {
  const n = NOTIFICATIONS.length
  // Newest first. One waits just above, unseen, and the oldest dips a few
  // pixels under the last card and is gone, behind the card taking its
  // place. It never travels past the list.
  const keys = [1, 0, -1, -2, -3].map((o) => step + o)
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Notifications</p>
        <span className={`${PILL} gap-1 bg-rose/14 text-rose-ink`}>
          <Digits value={step + 3} />
          new
        </span>
      </div>
      <div className="relative" style={{ height: 3 * NOTE_SLOT - 8 }}>
        {keys.map((k) => {
          const note = NOTIFICATIONS[((k % n) + n) % n]
          const look = NOTE_LOOK[note.kind]
          const slot = step - k
          const seen = slot >= 0 && slot < 3
          return (
            <div
              key={k}
              className={`absolute inset-x-0 top-0 flex h-[54px] items-center gap-2.5 rounded-[10px] pr-3 pl-2.5 transition-[transform,opacity] ${GLIDE} ${CARD} moving-text`}
              style={{
                transform: `translateY(${slot < 0 ? -EDGE : slot < 3 ? slot * NOTE_SLOT : 2 * NOTE_SLOT + EDGE}px) scale(${seen ? 1 : 0.96})`,
                opacity: seen ? [1, 0.8, 0.55][slot] : 0,
                zIndex: seen ? 1 : 0,
                transitionDuration: seen ? undefined : `600ms, ${LEAVE}ms`,
              }}
            >
              <span className={`grid size-[34px] shrink-0 place-items-center rounded-[8px] ${look.tone}`}>
                <Icon icon={look.icon} className="size-[18px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-[13px] leading-none font-semibold">{note.title}</p>
                <p className="truncate text-[11px] leading-none text-ink-soft">{note.body}</p>
              </div>
              <span className="text-[11px] leading-none text-ink-soft tabular-nums">
                {slot <= 0 ? "now" : `${slot * 2}m`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Rollout({ step }: WidgetProps) {
  const pct = at(ROLLOUT, step)
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Rollout</p>
        <p className={TITLE}>
          <Digits value={pct} />%
        </p>
      </div>
      <div className="relative mx-2.5 mb-[7px] h-1.5 rounded-full bg-ink-faint">
        <div
          className="h-full rounded-full bg-orange transition-[width] duration-900 ease-out-quint"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-5 -translate-1/2 rounded-full bg-on-dark shadow-(--lift) ring-1 ring-ink-faint transition-[left] duration-900 ease-out-quint"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function Inbox({ step }: WidgetProps) {
  const open = at(INBOX.open, step)
  const solved = INBOX.total - open
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={TITLE}>Support inbox</p>
      <p className={NUM}>
        <Digits value={open} />
        <span className="ml-1.5 text-[14px] font-medium tracking-normal text-ink-soft">open</span>
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex h-2 gap-1">
          <span
            className="rounded-full bg-green transition-[flex-grow] duration-900 ease-out-quint"
            style={{ flexGrow: solved }}
          />
          <span
            className="rounded-full bg-rose transition-[flex-grow] duration-900 ease-out-quint"
            style={{ flexGrow: open }}
          />
        </div>
        <p className={`${META} flex items-center gap-1`}>
          <Digits value={solved} /> solved today
        </p>
      </div>
    </div>
  )
}
