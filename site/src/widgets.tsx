import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CodeIcon,
  File02Icon,
  Globe02Icon,
  MinusSignIcon,
  PauseIcon,
  PlayIcon,
  Search01Icon,
  SmartPhone01Icon,
  Tick02Icon,
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

// The launch day wall's widgets. Each one tells one part of the story, is
// laid out to fill its tile exactly, and steps through a few states when
// the conductor reaches it (`step` counts its turns).
//
// One anatomy everywhere: a 14px semibold title, 12px soft meta, a 34px
// number, white cards nested in the grey tile, round 28px controls. State
// changes are explicit and smooth: digits turn like an odometer, text
// crossfades through a blur, rows glide to their new slot.

export type WidgetProps = { step: number }

const TITLE = "text-[14px] leading-none font-semibold tracking-[-0.01em]"
const META = "text-[12px] leading-none text-ink-soft"
const NUM = "text-[34px] leading-none font-semibold tracking-[-0.035em]"
const CARD = "bg-tile-inner shadow-(--lift)"
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

const REEL = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

/** A number whose digits turn to their new value, like an odometer. */
function Digits({ value }: { value: string | number }) {
  const chars = String(value).split("")
  return (
    <span className="digits" role="img" aria-label={String(value)}>
      {chars.map((ch, i) => {
        // Keyed from the right, so a digit keeps its reel as the number grows.
        const k = chars.length - i
        return /\d/.test(ch) ? (
          <span key={k} className="digit" aria-hidden>
            <span className="digit-reel" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
              {REEL.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
            <span className="invisible">8</span>
          </span>
        ) : (
          <span key={`${k}${ch}`} aria-hidden>
            {ch}
          </span>
        )
      })}
    </span>
  )
}

/** Text that crossfades to its new value through a short blur. */
function Swap({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="whitespace-nowrap"
          initial={{ opacity: 0, y: "0.45em", filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-0.45em", filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
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

function Spinner({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`spin ${className}`} aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Check({ className = "size-[22px]" }: { className?: string }) {
  return (
    <span
      className={`pop grid shrink-0 place-items-center rounded-full bg-accent text-accent-ink ${className}`}
    >
      <Icon icon={Tick02Icon} className="size-3" stroke={3.5} />
    </span>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${GLIDE} ${on ? "bg-accent" : "bg-ink-faint"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-tile-inner shadow-(--lift) transition-transform ${GLIDE} ${on ? "translate-x-4" : ""}`}
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
  const launch = step % 2 === 1
  const day = launch ? LAUNCH.day : LAUNCH.day - 1
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
          {/* The selection glides from the dry run to launch day. */}
          <span
            className={`absolute top-0 left-0 grid h-8 w-[calc(100%/7)] place-items-center transition-transform ${GLIDE}`}
            style={{
              transform: `translate(${(index % 7) * 100}%, ${Math.floor(index / 7) * 32}px)`,
            }}
          >
            <span
              className={`size-[30px] rounded-full transition-colors ${GLIDE} ${launch ? "bg-accent" : "bg-ink-faint"}`}
            />
          </span>
          {cells.map((d, i) => (
            <span
              key={i}
              className={`relative grid h-8 place-items-center transition-colors ${GLIDE} ${
                d === day
                  ? launch
                    ? "font-semibold text-accent-ink"
                    : "font-semibold"
                  : d && d < LAUNCH.day - 1
                    ? "text-ink-soft"
                    : ""
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 rounded-[14px] bg-ink-faint px-3 text-[12px] font-medium">
        <Icon icon={Calendar03Icon} className="size-4 shrink-0" />
        <Swap
          value={
            launch
              ? `${PRODUCT.name} ${PRODUCT.version} launch, Tue 9:00 AM`
              : "Dry run, Mon 4:00 PM"
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
        {/* The range switch belongs to this number: it changes it. */}
        <div className="relative grid h-7 w-[108px] grid-cols-3 rounded-full bg-ink-faint p-0.5 text-[11px] font-medium">
          <span
            className={`absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full bg-tile-inner shadow-(--lift) transition-transform ${GLIDE}`}
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
        <span className="rounded-full bg-accent-soft px-2 py-1.5 text-[11px] leading-none font-semibold text-accent-ink">
          <Swap value={range.delta} />
        </span>
      </div>

      <div className="flex h-24 items-end gap-1.5">
        {range.bars.map((v, j) => (
          <span
            key={j}
            className={`flex-1 rounded-[7px] transition-[height] duration-700 ease-out-quint ${j === range.bars.length - 1 ? "bg-accent" : "bg-ink-faint"}`}
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
          <span className="caret ml-px inline-block h-[1.05em] w-[1.5px] translate-y-[2px] bg-ink" />
        )}
      </span>
      <span
        className={`rounded-full bg-accent px-2.5 py-1.5 text-[11px] leading-none font-semibold text-accent-ink transition-[opacity,scale,filter] ${GLIDE} ${found ? "" : "scale-90 opacity-0 blur-[3px]"}`}
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
        <RoundButton>
          <Icon icon={Add01Icon} className="size-3.5" stroke={2.5} />
        </RoundButton>
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
        className={`flex h-10 w-[188px] items-center justify-center gap-2 rounded-full text-[13px] font-semibold transition-colors ${GLIDE} ${live ? "bg-accent text-accent-ink" : "bg-ink text-canvas"}`}
      >
        <span key={String(live)} className="pop grid place-items-center">
          {live ? <Icon icon={Tick02Icon} className="size-3.5" stroke={3.5} /> : <Spinner />}
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
                <span key="run" className="pop text-ink-soft">
                  <Spinner className="size-4" />
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
  // Four arcs with small gaps: one lights up per region.
  const r = 44
  const c = 2 * Math.PI * r
  const arc = c / 4 - 9
  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="relative size-[132px]">
        <svg viewBox="0 0 104 104" className="size-full -rotate-90">
          {REGIONS.map((name, i) => (
            <circle
              key={name}
              cx="52"
              cy="52"
              r={r}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${c - arc}`}
              strokeDashoffset={-(i * (c / 4)) - 4.5}
              className={`transition-[stroke] ${GLIDE} ${i < live ? "stroke-accent" : "stroke-on-dark-faint"}`}
            />
          ))}
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
      <span className={`grid size-9 place-items-center rounded-[12px] ${CARD}`}>
        <span key={String(done)} className="pop grid place-items-center">
          {done ? <Check className="size-5" /> : <Icon icon={File02Icon} className="size-4.5" />}
        </span>
      </span>
      <div className="flex flex-col gap-2">
        <p className={TITLE}>{UPLOAD.file}</p>
        <Swap value={s.note} className={META} />
      </div>
      <div className="h-1.5 rounded-full bg-ink-faint">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-900 ease-out-quint"
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
    <div className={`flex h-full flex-col justify-between rounded-[20px] p-4 ${CARD}`}>
      <div className="flex items-center justify-between">
        <p className={TITLE}>Invoice to {CUSTOMER.name}</p>
        <RoundButton>
          <Icon icon={Cancel01Icon} className="size-3" stroke={2.5} />
        </RoundButton>
      </div>
      <p className="flex h-[34px] items-center gap-2 rounded-[12px] bg-ink-faint px-3 text-[12px] font-medium">
        <span key={s} className="pop grid size-4 place-items-center">
          {s === 2 ? (
            <Check className="size-4" />
          ) : s === 1 ? (
            <Spinner className="size-3.5" />
          ) : (
            <span className="size-2 rounded-full bg-ink-soft" />
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
          className={`flex h-10 items-center justify-center gap-2 rounded-full transition-colors ${GLIDE} ${s === 2 ? "bg-accent text-accent-ink" : "bg-ink text-canvas"}`}
        >
          {s > 0 && (
            <span key={s} className="pop grid place-items-center">
              {s === 1 ? <Spinner /> : <Icon icon={Tick02Icon} className="size-3.5" stroke={3.5} />}
            </span>
          )}
          <Swap value={["Send", "Sending", "Sent"][s]} />
        </span>
      </div>
    </div>
  )
}

const WAVE = [5, 9, 14, 8, 18, 12, 22, 16, 10, 20, 14, 8, 16, 24, 12, 18, 10, 14, 20, 8, 12, 16, 10, 6, 12, 8]

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
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-on-dark text-tile-dark">
          <span key={String(playing)} className="pop grid place-items-center">
            <Icon icon={playing ? PauseIcon : PlayIcon} className="size-4" />
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
            <Wave tone="bg-accent" />
          </span>
        </span>
        <span className="ml-auto text-[11px] text-on-dark-soft tabular-nums">0:24</span>
      </div>
    </div>
  )
}

const CHAT_ROWS = 4
const CHAT_SLOT = 44

export function Chat({ step }: WidgetProps) {
  const n = CHAT.length
  const message = (k: number) => CHAT[((k % n) + n) % n]
  // One above and one below the window stay mounted, unseen, so a line
  // glides in from where it already is.
  const keys = Array.from({ length: CHAT_ROWS + 2 }, (_, o) => step - 1 + o)
  const typing = message(step + CHAT_ROWS).who
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>#launch</p>
        <span className={META}>5 online</span>
      </div>

      <div className="relative" style={{ height: CHAT_ROWS * CHAT_SLOT - 10 }}>
        {keys.map((k) => {
          const m = message(k)
          const slot = k - step
          const seen = slot >= 0 && slot < CHAT_ROWS
          const mine = m.who === "A"
          return (
            <div
              key={k}
              className={`absolute inset-x-0 top-0 flex h-[34px] items-center gap-2 transition-[transform,opacity,filter] ${GLIDE} ${mine ? "flex-row-reverse" : ""}`}
              style={{
                transform: `translateY(${slot * CHAT_SLOT}px)`,
                opacity: seen ? 1 : 0,
                filter: seen ? "blur(0px)" : "blur(4px)",
              }}
            >
              {!mine && <Avatar who={m.who} size="size-6 text-[10px]" />}
              <p
                className={`rounded-[17px] px-3 py-2 text-[13px] leading-[18px] whitespace-nowrap ${mine ? "bg-ink text-canvas" : CARD}`}
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

export function Countdown() {
  const [left, setLeft] = useState(41 * 60 + 58)
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 41 * 60 + 58)), 1000)
    return () => window.clearInterval(id)
  }, [])
  const two = (v: number) => String(v).padStart(2, "0")
  return (
    <div className="flex h-full flex-col justify-between">
      <p className="text-[12px] leading-none text-on-dark-soft">Launch in</p>
      <p className="text-[38px] leading-none font-semibold tracking-[-0.03em]">
        <Digits value={`00:${two(Math.floor(left / 60))}:${two(left % 60)}`} />
      </p>
      <p className="flex items-center gap-2 text-[12px] leading-none text-on-dark-soft">
        <span className="size-1.5 rounded-full bg-accent" />
        All checks green
      </p>
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
    <div className={`flex h-full flex-col divide-y divide-ink-faint rounded-[18px] px-3.5 ${CARD}`}>
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

export function Platforms({ step }: WidgetProps) {
  const ios = step % 2 === 1
  const chips = [
    { name: "Web", icon: Globe02Icon, done: true },
    { name: "API", icon: CodeIcon, done: true },
    { name: "iOS", icon: SmartPhone01Icon, done: ios },
  ]
  return (
    <div className="flex h-full flex-col justify-between">
      <p className={TITLE}>Shipping to</p>
      <div className="flex gap-1.5">
        {chips.map((c) => (
          <span
            key={c.name}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition-colors ${GLIDE} ${c.done ? "bg-accent-soft text-accent-ink" : "bg-ink-faint text-ink-soft"}`}
          >
            <span key={String(c.done)} className="pop grid place-items-center">
              <Icon
                icon={c.done ? Tick02Icon : c.icon}
                className="size-3.5"
                stroke={c.done ? 3.5 : 2}
              />
            </span>
            {c.name}
          </span>
        ))}
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
              className={`${i === 4 && on ? "pop" : ""} ${on ? "text-accent" : "text-ink-faint"}`}
            >
              <svg viewBox="0 0 24 24" className="size-[26px] fill-current" aria-hidden>
                <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" />
              </svg>
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
      <span className="w-fit rounded-full bg-accent-soft px-2 py-1.5 text-[11px] leading-none font-semibold text-accent-ink">
        <Swap value={s.delta} />
      </span>
    </div>
  )
}

// ------------------------------------------------------------ column 5

export function Revenue({ step }: WidgetProps) {
  const s = at(MRR, step)
  const W = 200
  const H = 80
  const min = 10
  const max = 20.4
  const pts = s.points.map(
    (v, i) => [(i / (s.points.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const
  )
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("")
  const [, ly] = pts[pts.length - 1]
  const morph = "transition-[d] duration-700 ease-out-quint"
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Monthly revenue</p>
        <span className="rounded-full bg-accent-soft px-2 py-1.5 text-[11px] leading-none font-semibold text-accent-ink">
          +12%
        </span>
      </div>
      <p className={NUM}>
        $<Digits value={s.value} />k
      </p>
      <div className="relative h-[92px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          fill="none"
        >
          <defs>
            <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* The path as CSS, so the line glides to its new shape (every
              state has the same number of points). */}
          <path
            fill="url(#mrr-fill)"
            className={morph}
            style={{ d: `path("${line}L${W} ${H}L0 ${H}Z")` } as CSSProperties}
          />
          <path
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={morph}
            style={{ d: `path("${line}")` } as CSSProperties}
          />
        </svg>
        <span
          className="absolute right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-accent bg-tile transition-[top] duration-700 ease-out-quint"
          style={{ top: `${(ly / H) * 100}%` }}
        />
      </div>
    </div>
  )
}

const NOTE_SLOT = 62

export function Notifications({ step }: WidgetProps) {
  const n = NOTIFICATIONS.length
  // Newest first. One waits above, unseen, and one fades out below.
  const keys = [1, 0, -1, -2, -3].map((o) => step + o)
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className={TITLE}>Notifications</p>
        <span className="rounded-full bg-ink-faint px-2 py-1.5 text-[11px] leading-none font-semibold">
          <Digits value={step + 3} />
        </span>
      </div>
      <div className="relative" style={{ height: 3 * NOTE_SLOT - 8 }}>
        {keys.map((k) => {
          const note = NOTIFICATIONS[((k % n) + n) % n]
          const slot = step - k
          const seen = slot >= 0 && slot < 3
          return (
            <div
              key={k}
              className={`absolute inset-x-0 top-0 flex h-[54px] items-center gap-2.5 rounded-[16px] px-2.5 transition-[transform,opacity,filter] ${GLIDE} ${CARD}`}
              style={{
                transform: `translateY(${slot * NOTE_SLOT}px) scale(${slot < 0 ? 0.94 : 1})`,
                opacity: seen ? [1, 0.8, 0.55][slot] : 0,
                filter: seen ? "blur(0px)" : "blur(4px)",
              }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent-ink">
                <Icon icon={Tick02Icon} className="size-3.5" stroke={3} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="text-[13px] leading-none font-semibold">{note.title}</p>
                <p className="truncate text-[11px] leading-none text-ink-soft">{note.body}</p>
              </div>
              <span className="text-[11px] text-ink-soft tabular-nums">
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
      <div className="relative mx-2.5 mb-2 h-1.5 rounded-full bg-ink-faint">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-900 ease-out-quint"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-5 -translate-1/2 rounded-full bg-tile-inner shadow-(--lift) ring-1 ring-ink-faint transition-[left] duration-900 ease-out-quint"
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
            className="rounded-full bg-accent transition-[flex-grow] duration-900 ease-out-quint"
            style={{ flexGrow: solved }}
          />
          <span
            className="rounded-full bg-ink-faint transition-[flex-grow] duration-900 ease-out-quint"
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
