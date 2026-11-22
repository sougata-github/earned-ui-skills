"use client"

import { useEffect, useState } from "react"

import * as W from "./widgets"
import { WidgetLab } from "@/skill/widget/WidgetLab"
import { Wall, type Plan, type Tile } from "@/skill/widget/wall"

// The widget-bento-web lab's wall: launch day for Relay 2.0, in 21 tiles.
// This file is only the content: which tiles, how tall, and how they are
// arranged on each screen shape. The engine (the fit, the opening, the
// conductor) is the skill's own `wall.tsx`.
//
// Keys: Space plays the opening again, D switches the theme, P pauses and
// resumes (wait a second after pausing and nothing is mid change).
//
// In the address: ?lab for the bento lab with its controls, ?dark or ?light
// for a theme, ?still for a posed wall with no opening and nothing moving
// (a clean capture), ?embed when it sits in a frame on a page.

type TileId =
  | "calendar"
  | "signups"
  | "search"
  | "oncall"
  | "seats"
  | "deploy"
  | "pipeline"
  | "regions"
  | "upload"
  | "invoice"
  | "voice"
  | "chat"
  | "countdown"
  | "flags"
  | "platforms"
  | "reviews"
  | "latency"
  | "revenue"
  | "notifications"
  | "rollout"
  | "inbox"

// Every tile has a fixed height, and its content is laid out to fill that
// height on whole pixels. A tile that is one nested card uses less padding.
const TILES: Record<TileId, Tile> = {
  calendar: { Widget: W.Calendar, h: 318 },
  signups: { Widget: W.Signups, h: 222 },
  search: { Widget: W.Search, h: 76, pad: 16 },
  oncall: { Widget: W.OnCall, h: 104, pad: 16 },
  seats: { Widget: W.Seats, h: 104, pad: 16 },
  deploy: { Widget: W.Deploy, h: 96 },
  pipeline: { Widget: W.Pipeline, h: 218 },
  regions: { Widget: W.Regions, h: 236, dark: true, pad: 20 },
  upload: { Widget: W.Upload, h: 170 },
  invoice: { Widget: W.Invoice, h: 274, pad: 12 },
  voice: { Widget: W.Voice, h: 150, dark: true },
  chat: { Widget: W.Chat, h: 310 },
  countdown: { Widget: W.Countdown, h: 168, dark: true },
  flags: { Widget: W.Flags, h: 152, pad: 12 },
  platforms: { Widget: W.Platforms, h: 122 },
  reviews: { Widget: W.Reviews, h: 130 },
  latency: { Widget: W.Latency, h: 134 },
  revenue: { Widget: W.Revenue, h: 214 },
  notifications: { Widget: W.Notifications, h: 256 },
  rollout: { Widget: W.Rollout, h: 108 },
  inbox: { Widget: W.Inbox, h: 142 },
}

const PAIR = ["oncall", "seats"] as const
type Cells = readonly (TileId | readonly TileId[])[]

// Five arrangements of the same 21 tiles, the widest first. In each, every
// column's tiles and gaps add up to the same height, and the three dark
// tiles are spread out.
const PLANS = [
  // 1440 x 810, one screen.
  {
    name: "five",
    pad: 24,
    title: 64,
    widths: [300, 236, 292, 236, 272],
    columns: [
      ["calendar", "signups", "search", PAIR],
      ["deploy", "pipeline", "regions", "upload"],
      ["invoice", "voice", "chat"],
      ["countdown", "flags", "platforms", "reviews", "latency"],
      ["revenue", "notifications", "rollout", "inbox"],
    ],
  },
  // 1250 x 1004: windows squarer than a screen, tablets on their side.
  {
    name: "four",
    pad: 24,
    title: 60,
    widths: [290, 290, 290, 290],
    columns: [
      ["calendar", PAIR, "pipeline", "flags", "rollout"],
      ["invoice", "voice", "search", "platforms", "reviews", "latency"],
      ["countdown", "signups", "chat", "revenue"],
      ["deploy", "notifications", "upload", "regions", "inbox"],
    ],
  },
  // 946 x 1328: tablets upright, phones on their side.
  {
    name: "three",
    pad: 24,
    title: 52,
    widths: [290, 290, 290],
    grow: { voice: 2 },
    columns: [
      ["calendar", "search", PAIR, "regions", "revenue", "flags", "deploy"],
      ["countdown", "pipeline", "notifications", "latency", "upload", "rollout", "inbox"],
      ["invoice", "voice", "chat", "signups", "platforms", "reviews"],
    ],
  },
  // 590 wide: large phones and small tablets.
  {
    name: "two",
    pad: 16,
    title: 44,
    widths: [272, 272],
    columns: [
      ["calendar", "voice", "signups", "invoice", "deploy", "chat", "search", PAIR, "rollout", "inbox"],
      ["countdown", "revenue", "pipeline", "notifications", "platforms", "regions", "flags", "upload", "reviews", "latency"],
    ],
  },
  // 334 wide: phones.
  {
    name: "one",
    pad: 16,
    title: 36,
    widths: [302],
    columns: [
      [
        "calendar",
        "countdown",
        "signups",
        "deploy",
        "pipeline",
        "invoice",
        "voice",
        "chat",
        "search",
        PAIR,
        "revenue",
        "notifications",
        "regions",
        "platforms",
        "flags",
        "upload",
        "rollout",
        "reviews",
        "latency",
        "inbox",
      ],
    ],
  },
] satisfies readonly (Plan & { columns: readonly Cells[] })[]

const TITLE = "Launch Day"

// The pose for a still: the end of launch day, every tile on a settled
// state that agrees with the others (the inbox at 7, as the chat says).
const POSE: Partial<Record<TileId, number>> = {
  search: 1,
  seats: 1,
  deploy: 1,
  pipeline: 4,
  regions: 3,
  upload: 2,
  invoice: 2,
  voice: 2,
  platforms: 1,
  reviews: 1,
  latency: 2,
  revenue: 2,
  notifications: 4,
  rollout: 2,
  inbox: 2,
}
const PARAMS = new URLSearchParams(window.location.search)
const STILL = PARAMS.has("still")
// In a frame on a page: a frame wide enough shows the whole five column
// wall, however small. A narrower one shows the top of the wall for its
// width, as a moving preview.
const EMBED = PARAMS.has("embed")
const WHOLE = 700

export function WidgetWall() {
  const [replay, setReplay] = useState(0)
  const [live, setLive] = useState(!STILL)
  const [whole, setWhole] = useState(() => EMBED && window.innerWidth >= WHOLE)

  useEffect(() => {
    if (!EMBED) return
    const fit = () => setWhole(window.innerWidth >= WHOLE)
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])

  useEffect(() => {
    W.clock.paused = !live
  }, [live])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setReplay((n) => n + 1)
      }
      if (e.key === "d" && !e.metaKey && !e.ctrlKey) {
        document.documentElement.classList.toggle("dark")
      }
      if (e.key === "p" && !e.metaKey && !e.ctrlKey) setLive((on) => !on)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <Wall
      tiles={TILES}
      plans={PLANS}
      title={STILL ? undefined : TITLE}
      live={live}
      start={STILL ? POSE : undefined}
      plan={whole ? "five" : undefined}
      replay={replay}
    />
  )
}

/** The same wall in the skill's lab: controls, empty tiles, Copy as JSON. */
export function WidgetWallLab() {
  return <WidgetLab tiles={TILES} plans={PLANS} title={TITLE} />
}

/** The demo page: the wall, or the lab with ?lab. */
export function WidgetDemo() {
  return PARAMS.has("lab") ? <WidgetWallLab /> : <WidgetWall />
}
