import type { CSSProperties, ReactNode } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  Calendar03Icon,
  Cancel01Icon,
  CodeIcon,
  File02Icon,
  Globe02Icon,
  MinusSignIcon,
  PlayIcon,
  Search01Icon,
  SmartPhone01Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import {
  CHAT,
  CREW,
  CUSTOMER,
  INBOX,
  LAUNCH,
  MESSAGE,
  MRR,
  NOTIFICATIONS,
  PIPELINE,
  PRODUCT,
  ROLLOUT,
  SEARCH,
  SIGNUP_HOURS,
  SIGNUPS,
  UPTIME,
} from "./story"

// The launch day wall's widgets. Each one tells one part of the story and
// steps through a few states when the conductor reaches it (`step` counts
// its turns). State changes animate briefly: a value rolls, a row arrives,
// a toggle slides. Nothing loops on its own.

export type WidgetProps = { step: number; t: number }

const at = <T,>(list: readonly T[], step: number) => list[step % list.length]

function Icon({
  icon,
  className = "size-4.5",
  stroke = 2,
}: {
  icon: IconSvgElement
  className?: string
  stroke?: number
}) {
  return <HugeiconsIcon icon={icon} strokeWidth={stroke} className={className} />
}

/** A value that rolls in from below whenever it changes. */
function Roll({ value }: { value: ReactNode }) {
  return (
    <span key={String(value)} className="roll">
      {value}
    </span>
  )
}

function Avatar({
  initial,
  size = "size-8 text-[12px]",
  bg = "bg-ink-faint",
  className = "",
}: {
  initial: string
  size?: string
  bg?: string
  className?: string
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${size} ${bg} ${className}`}
    >
      {initial}
    </span>
  )
}

function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`spin ${className}`} aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Done({ className = "size-6" }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-accent text-accent-ink ${className}`}>
      <Icon icon={Tick02Icon} className="size-3.5" stroke={3} />
    </span>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${on ? "bg-accent" : "bg-ink-faint"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-tile-inner shadow-(--lift) transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "translate-x-5" : ""}`}
      />
    </span>
  )
}

const label = "text-[12px] leading-none text-ink-soft"
const title = "text-[15px] leading-none font-medium"
const big = "text-[40px] leading-none font-semibold tracking-[-0.04em] tabular-nums"

// ------------------------------------------------------------ column 1

export function Calendar({ step }: WidgetProps) {
  const selected = step % 2 === 0 ? LAUNCH.day - 1 : LAUNCH.day
  const cells = [
    ...Array.from({ length: LAUNCH.firstWeekday }, () => null),
    ...Array.from({ length: LAUNCH.days }, (_, i) => i + 1),
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className={title}>{LAUNCH.month}</p>
        <div className="flex gap-1.5">
          {[ArrowLeft01Icon, ArrowRight01Icon].map((icon, i) => (
            <span key={i} className="grid size-7 place-items-center rounded-full bg-ink-faint">
              <Icon icon={icon} className="size-3.5" stroke={2.5} />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center text-[13px] tabular-nums">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="pb-1 text-[11px] text-ink-soft">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span key={i} className="grid place-items-center">
            {day && (
              <span
                className={`grid size-8 place-items-center rounded-full transition-colors duration-300 ${
                  day === selected
                    ? day === LAUNCH.day
                      ? "bg-accent font-semibold text-accent-ink"
                      : "bg-ink-faint font-medium"
                    : day < LAUNCH.day - 1
                      ? "text-ink-soft"
                      : ""
                }`}
              >
                {day}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-ink-faint px-3 py-2.5 text-[12px] font-medium">
        <Icon icon={Calendar03Icon} className="size-4" />
        <Roll
          value={
            step % 2 === 0
              ? "Dry run, Mon 4:00 PM"
              : `${PRODUCT.name} ${PRODUCT.version} launch, ${LAUNCH.slot}`
          }
        />
      </div>
    </div>
  )
}

export function Segmented({ step }: WidgetProps) {
  const options = ["Today", "Week", "Month"]
  const i = step % options.length
  return (
    <div className="flex h-full items-center">
      <div className="relative grid w-full grid-cols-3 rounded-full bg-ink-faint p-1 text-[13px] font-medium">
        <span
          className="absolute inset-y-1 left-1 rounded-full bg-tile-inner shadow-(--lift) transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: "calc((100% - 0.5rem) / 3)", transform: `translateX(${i * 100}%)` }}
        />
        {options.map((o, j) => (
          <span
            key={o}
            className={`relative py-2 text-center transition-colors duration-300 ${j === i ? "" : "text-ink-soft"}`}
          >
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Signups({ step }: WidgetProps) {
  const value = at(SIGNUPS, step)
  const grow = (step % SIGNUPS.length) / (SIGNUPS.length - 1)
  const peak = Math.max(...SIGNUP_HOURS) * 1.25
  return (
    <div className="flex h-full flex-col">
      <p className={label}>Signups today</p>
      <p className={`mt-2.5 ${big}`}>
        <Roll value={value.toLocaleString("en-US")} />
      </p>
      <div className="mt-auto flex h-20 items-end gap-1.5">
        {SIGNUP_HOURS.map((v, i) => {
          const last = i === SIGNUP_HOURS.length - 1
          const h = last ? v * (1 + grow * 0.25) : v
          return (
            <span
              key={i}
              className={`flex-1 rounded-md transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${last ? "bg-accent" : "bg-ink-faint"}`}
              style={{ height: `${(h / peak) * 100}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

export function Search({ step }: WidgetProps) {
  const s = step % 3
  const typed = s === 0 ? "" : s === 1 ? SEARCH.slice(0, 3) : SEARCH
  return (
    <div className="flex h-full items-center">
      <div className="flex h-12 w-full items-center gap-2 rounded-full bg-tile-inner pr-1.5 pl-4 shadow-(--lift)">
        <Icon icon={Search01Icon} className="size-4 text-ink-soft" />
        <span className="flex-1 text-[14px]">
          {typed || <span className="text-ink-soft">Search tickets</span>}
          {typed && <span className="caret ml-px inline-block h-[1em] w-px translate-y-[2px] bg-ink" />}
        </span>
        {s === 2 && (
          <span className="arrive rounded-full bg-accent px-2.5 py-1.5 text-[12px] font-medium text-accent-ink">
            3 results
          </span>
        )}
      </div>
    </div>
  )
}

export function Seats({ step }: WidgetProps) {
  const seats = 4 + (step % 3)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="text-center">
        <p className="text-[14px] font-medium">Seats</p>
        <p className={`mt-1 ${label}`}>{CUSTOMER.name} team</p>
      </div>
      <div className="flex items-center gap-5">
        <span className="grid size-9 place-items-center rounded-full bg-ink-faint">
          <Icon icon={MinusSignIcon} className="size-4" stroke={2.5} />
        </span>
        <span className="w-8 text-center text-[34px] leading-none font-semibold tabular-nums">
          <Roll value={seats} />
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-ink-faint">
          <Icon icon={Add01Icon} className="size-4" stroke={2.5} />
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 2

export function Deploy({ step }: WidgetProps) {
  const live = step % 2 === 1
  return (
    <div className="flex h-full items-center justify-center">
      <span
        className={`flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors duration-300 ${live ? "bg-accent text-accent-ink" : "bg-ink text-canvas"}`}
      >
        {live ? <Icon icon={Tick02Icon} className="size-4" stroke={3} /> : <Spinner />}
        <Roll value={live ? `${PRODUCT.name} ${PRODUCT.version} is live` : "Deploying"} />
      </span>
    </div>
  )
}

export function Pipeline({ step }: WidgetProps) {
  const done = step % (PIPELINE.length + 1)
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className={title}>Release pipeline</p>
        <span className="font-mono text-[11px] text-ink-soft">main #482</span>
      </div>
      <ul className="mt-auto flex flex-col gap-3">
        {PIPELINE.map((stage, i) => (
          <li key={stage} className="flex items-center gap-3 text-[14px]">
            {i < done ? (
              <Done className="size-6" />
            ) : i === done ? (
              <span className="grid size-6 place-items-center text-ink-soft">
                <Spinner />
              </span>
            ) : (
              <span className="size-6 rounded-full border-2 border-ink-faint" />
            )}
            <span className={i <= done ? "" : "text-ink-soft"}>{stage}</span>
            {i < done && <span className="arrive ml-auto font-mono text-[11px] text-ink-soft">{["0:48", "1:36", "0:41", "0:07"][i]}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Uptime({ step }: WidgetProps) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-on-dark-faint" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * 0.04}
            className="stroke-accent"
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center text-[22px] font-semibold tracking-[-0.03em] tabular-nums">
          <Roll value={at(UPTIME, step)} />
        </p>
      </div>
      <p className="text-[12px] text-on-dark-soft">Uptime, last 30 days</p>
    </div>
  )
}

export function Upload({ step }: WidgetProps) {
  const full = step % 2 === 1
  return (
    <div className="flex h-full flex-col justify-center">
      <span className="grid size-9 place-items-center rounded-xl bg-tile-inner shadow-(--lift)">
        <Icon icon={File02Icon} className="size-4.5" />
      </span>
      <p className="mt-3 text-[14px] font-medium">changelog-2.0.pdf</p>
      <p className={`mt-1.5 ${label}`}>
        <Roll value={full ? "2.4 of 2.4 MB, uploaded" : "1.2 of 2.4 MB"} />
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-ink-faint">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: full ? "100%" : "50%" }}
        />
      </div>
    </div>
  )
}

export function Crew({ step }: WidgetProps) {
  const count = step % 2 === 1 ? 5 : 4
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex">
        {CREW.slice(0, count).map((p, i) => (
          <Avatar
            key={p.name}
            initial={p.initial}
            size="size-11 text-[14px]"
            bg={i === 4 ? "bg-accent text-accent-ink" : "bg-tile-inner"}
            className={`-ml-2 ring-4 ring-tile first:ml-0 ${i === 4 ? "arrive" : ""}`}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-[14px] font-medium">Launch crew</p>
        <p className={`mt-1 ${label}`}>
          <Roll value={`${count} people`} />
        </p>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 3

export function Invoice({ step }: WidgetProps) {
  const s = step % 3
  return (
    <div className="flex h-full flex-col justify-center">
      {/* Nested surface: a white card inside the soft tile. */}
      <div className="rounded-[22px] bg-tile-inner p-4 shadow-(--lift)">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium">Invoice to {CUSTOMER.name}</p>
          <span className="grid size-6 place-items-center rounded-full bg-ink-faint">
            <Icon icon={Cancel01Icon} className="size-3" stroke={2.5} />
          </span>
        </div>
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-ink-faint px-3 py-2 text-[12px]">
          <Done className="size-4" />
          Paid by card, no fees
        </p>
        <dl className="mt-3 flex flex-col gap-2.5 text-[13px]">
          {[
            ["Plan", CUSTOMER.plan],
            ["Amount", CUSTOMER.amount],
            ["Due", CUSTOMER.due],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] font-medium">
          <span className="grid h-10 place-items-center rounded-full bg-ink-faint">Cancel</span>
          <span
            className={`flex h-10 items-center justify-center gap-2 rounded-full transition-colors duration-300 ${s === 2 ? "bg-accent text-accent-ink" : "bg-ink text-canvas"}`}
          >
            {s === 1 && <Spinner className="size-3.5" />}
            {s === 2 && <Icon icon={Tick02Icon} className="size-3.5" stroke={3} />}
            <Roll value={["Send", "Sending", "Sent"][s]} />
          </span>
        </div>
      </div>
    </div>
  )
}

export function Flag({ step }: WidgetProps) {
  const on = step % 2 === 1
  return (
    <div className="flex h-full items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">New onboarding</p>
        <p className={`mt-1.5 ${label}`}>
          <Roll value={on ? "On for 50% of users" : "Off, ready to roll"} />
        </p>
      </div>
      <Toggle on={on} />
    </div>
  )
}

export function Voice({ step }: WidgetProps) {
  const bars = [6, 10, 14, 8, 18, 12, 22, 16, 10, 20, 14, 8, 16, 24, 12, 18, 10, 14, 20, 8, 12, 16, 10, 6]
  const played = [0.15, 0.45, 0.75, 1][step % 4]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <Avatar initial="M" bg="bg-on-dark-faint" />
        <div>
          <p className="text-[14px] font-medium">Mira</p>
          <p className="mt-1 text-[12px] text-on-dark-soft">Voice note, launch call</p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-on-dark text-tile-dark">
          <Icon icon={PlayIcon} className="size-4" />
        </span>
        <div className="flex h-7 flex-1 items-center gap-[3px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-colors duration-300 ${i / bars.length < played ? "bg-accent" : "bg-on-dark-faint"}`}
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-on-dark-soft">0:24</span>
      </div>
    </div>
  )
}

export function Reviews({ step }: WidgetProps) {
  const stars = step % 2 === 1 ? 5 : 4
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
      <p className="text-[14px] font-medium">First reviews</p>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`transition-colors duration-300 ${i < stars ? "text-accent" : "text-ink-faint"}`}>
            <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
              <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" />
            </svg>
          </span>
        ))}
      </div>
      <p className={label}>
        <Roll value={stars === 5 ? "4.8 from 37 teams" : "4.7 from 36 teams"} />
      </p>
    </div>
  )
}

export function Composer({ step }: WidgetProps) {
  const s = step % 3
  const typed = s === 0 ? "" : s === 1 ? MESSAGE.slice(0, 5) : MESSAGE
  return (
    <div className="flex h-full items-center">
      <div className="flex h-12 w-full items-center gap-2 rounded-full bg-tile-inner pr-1.5 pl-4 shadow-(--lift)">
        <span className="flex-1 text-[14px]">
          {typed || <span className="text-ink-soft">Message #launch</span>}
          {typed && <span className="caret ml-px inline-block h-[1em] w-px translate-y-[2px] bg-ink" />}
        </span>
        <span
          className={`grid size-9 place-items-center rounded-full transition-colors duration-300 ${s === 2 ? "bg-accent text-accent-ink" : "bg-ink-faint"}`}
        >
          <Icon icon={ArrowUp02Icon} className="size-4" stroke={2.5} />
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 4

export function Countdown({ t }: WidgetProps) {
  const left = Math.max(0, 42 * 60 + 10 - Math.floor(t))
  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <p className="text-[12px] text-on-dark-soft">Launch in</p>
      <p className="font-mono text-[40px] leading-none font-medium tracking-[-0.02em] tabular-nums">
        00:{mm}:<Roll value={ss} />
      </p>
      <p className="mt-1 flex items-center gap-2 text-[12px] text-on-dark-soft">
        <span className="size-1.5 rounded-full bg-accent" />
        {LAUNCH.slot}, all checks green
      </p>
    </div>
  )
}

export function Flags({ step }: WidgetProps) {
  const swap = step % 2 === 1
  const rows = [
    { name: "Usage alerts", note: "Email when a team nears its limit", on: !swap },
    { name: "Dark mode for teams", note: "Follows each member's system", on: swap },
  ]
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex flex-col divide-y divide-ink-faint rounded-[22px] bg-tile-inner px-4 shadow-(--lift)">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{r.name}</p>
              <p className={`mt-1.5 ${label}`}>{r.note}</p>
            </div>
            <Toggle on={r.on} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Chat({ step }: WidgetProps) {
  const shown = 1 + (step % CHAT.length)
  const visible = CHAT.slice(Math.max(0, shown - 3), shown)
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className={title}>#launch</p>
        <span className={label}>5 online</span>
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        {visible.map((m, i) => {
          const mine = m.who === "A"
          return (
            <div
              key={m.text}
              className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${i === visible.length - 1 ? "arrive" : ""}`}
            >
              {!mine && <Avatar initial={m.who} size="size-6 text-[10px]" />}
              <p
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${mine ? "bg-ink text-canvas" : "bg-tile-inner shadow-(--lift)"}`}
              >
                {m.text}
              </p>
            </div>
          )
        })}
        <div className="flex items-center gap-2">
          <Avatar initial="B" size="size-6 text-[10px]" />
          <span className="flex gap-1 rounded-2xl bg-tile-inner px-3 py-2.5 shadow-(--lift)">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 rounded-full bg-ink-soft" style={{ opacity: 0.4 + i * 0.2 }} />
            ))}
          </span>
        </div>
      </div>
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
    <div className="flex h-full flex-col justify-center gap-3">
      <p className="text-[14px] font-medium">Shipping to</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.name}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors duration-300 ${c.done ? "bg-accent-soft text-accent-ink" : "bg-ink-faint text-ink-soft"}`}
          >
            <Icon icon={c.done ? Tick02Icon : c.icon} className="size-3.5" stroke={c.done ? 3 : 2} />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ column 5

export function Revenue({ step }: WidgetProps) {
  const s = at(MRR, step)
  const W = 200
  const H = 70
  const min = 10
  const max = 20.5
  const pts = s.points.map((v, i) => [(i / (s.points.length - 1)) * W, H - ((v - min) / (max - min)) * H])
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("")
  const [lx, ly] = pts[pts.length - 1]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between">
        <div>
          <p className={label}>Monthly revenue</p>
          <p className={`mt-2.5 ${big}`}>
            <Roll value={s.label} />
          </p>
        </div>
        <span className="rounded-full bg-accent-soft px-2.5 py-1.5 text-[12px] font-medium text-accent-ink">+12%</span>
      </div>
      <div className="relative mt-auto h-20">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" fill="none">
          <defs>
            <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* The path as CSS, so it glides between states with the dot
              (every state has the same number of points). */}
          <path
            fill="url(#mrr-fill)"
            className="transition-[d] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ d: `path("${line}L${W} ${H}L0 ${H}Z")` } as CSSProperties}
          />
          <path
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="transition-[d] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ d: `path("${line}")` } as CSSProperties}
          />
        </svg>
        <span
          className="absolute size-3 -translate-1/2 rounded-full border-[2.5px] border-accent bg-tile transition-[top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `${(lx / W) * 100}%`, top: `${(ly / H) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function Notifications({ step }: WidgetProps) {
  const head = step % NOTIFICATIONS.length
  const list = [0, 1, 2].map((k) => NOTIFICATIONS[(head - k + NOTIFICATIONS.length * 4) % NOTIFICATIONS.length])
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className={title}>Notifications</p>
        <span className="rounded-full bg-ink-faint px-2 py-1 font-mono text-[11px]">
          <Roll value={step + 3} />
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        {list.map((n, i) => (
          <div
            key={`${n.title}-${step - i}`}
            className={`flex items-center gap-3 rounded-2xl bg-tile-inner p-3 shadow-(--lift) ${i === 0 ? "arrive" : ""}`}
            style={{ opacity: 1 - i * 0.22 }}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
              <Icon icon={i === 0 ? StarIcon : Tick02Icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">{n.title}</p>
              <p className="mt-1 truncate text-[12px] text-ink-soft">{n.body}</p>
            </div>
            <span className="text-[11px] text-ink-soft">{i === 0 ? "now" : `${i * 2}m`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Rollout({ step }: WidgetProps) {
  const pct = at(ROLLOUT, step)
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[14px] font-medium">Rollout</p>
        <p className="text-[14px] font-medium tabular-nums">
          <Roll value={`${pct}%`} />
        </p>
      </div>
      <div className="relative h-1.5 rounded-full bg-ink-faint">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 size-5 -translate-1/2 rounded-full bg-tile-inner shadow-(--lift) ring-1 ring-ink-faint transition-[left] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function Inbox({ step }: WidgetProps) {
  const open = at(INBOX, step)
  const solved = 31 - open
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className={title}>Support inbox</p>
        <Avatar initial="K" size="size-7 text-[11px]" />
      </div>
      <p className={`mt-4 ${big}`}>
        <Roll value={open} />
        <span className="ml-2 text-[14px] font-normal tracking-normal text-ink-soft">open</span>
      </p>
      <div className="mt-auto">
        <div className="flex h-2.5 gap-1 overflow-hidden rounded-full">
          <span className="rounded-full bg-accent transition-[flex-grow] duration-700" style={{ flexGrow: solved }} />
          <span className="rounded-full bg-ink-faint transition-[flex-grow] duration-700" style={{ flexGrow: open }} />
        </div>
        <div className="mt-2.5 flex justify-between text-[12px] text-ink-soft">
          <span>
            <Roll value={`${solved} solved`} />
          </span>
          <span>Kai on shift</span>
        </div>
      </div>
    </div>
  )
}

export function AllGo({ step }: WidgetProps) {
  const ok = step % 2 === 1
  return (
    <div className="flex h-full items-center justify-center gap-3">
      <span
        className={`grid size-12 place-items-center rounded-full transition-colors duration-300 ${ok ? "bg-accent text-accent-ink" : "bg-ink-faint"}`}
      >
        {ok ? <Icon icon={Tick02Icon} className="size-5" stroke={3} /> : <Spinner className="size-5" />}
      </span>
      <p className="text-[14px] font-medium">
        <Roll value={ok ? "All systems go" : "Checking"} />
      </p>
    </div>
  )
}
