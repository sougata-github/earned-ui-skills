// One story, one cast: launch day for Relay 2.0, a small product team
// shipping a release. Every name, number and date on the wall comes from
// here, so twenty tiles read as one product, not a sticker sheet. Fixed
// values, nothing random.

export const PRODUCT = { name: "Relay", version: "2.0" }

export const LAUNCH = {
  day: 24,
  month: "November 2026",
  /** Nov 1, 2026 is a Sunday. */
  firstWeekday: 0,
  days: 30,
}

export const CREW = {
  A: { name: "Ana", tone: "bg-av-violet text-on-dark" },
  B: { name: "Ben", tone: "bg-av-amber text-on-dark" },
  K: { name: "Kai", tone: "bg-av-sky text-on-dark" },
  M: { name: "Mira", tone: "bg-av-rose text-on-dark" },
  T: { name: "Theo", tone: "bg-ink text-canvas" },
} as const
export type CrewId = keyof typeof CREW

export const CUSTOMER = {
  name: "Northwind",
  plan: "Relay Pro, annual",
  amount: "$2,400.00",
  due: "Dec 1",
}

/** Signups by range: the tile's own switch picks one. */
export const SIGNUP_RANGES = [
  { key: "1D", total: 1467, delta: "+18%", bars: [22, 30, 41, 58, 74, 96, 120] },
  { key: "1W", total: 8930, delta: "+9%", bars: [84, 96, 88, 104, 112, 120, 128] },
  { key: "1M", total: 31204, delta: "+24%", bars: [40, 52, 61, 70, 86, 102, 131] },
] as const

export const MRR = [
  { value: "18.4", points: [11, 12, 12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4] },
  { value: "19.1", points: [12, 12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4, 19.1] },
  { value: "19.6", points: [12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4, 19.1, 19.6] },
] as const

export const INBOX = { total: 31, open: [12, 9, 7] } as const
export const ROLLOUT = [25, 50, 100] as const
export const LATENCY = [
  { ms: 182, delta: "4 ms faster" },
  { ms: 176, delta: "10 ms faster" },
  { ms: 171, delta: "15 ms faster" },
] as const

export const PIPELINE = [
  { stage: "Build", time: "0:48" },
  { stage: "Tests", time: "1:36" },
  { stage: "Deploy", time: "0:41" },
  { stage: "Smoke test", time: "0:07" },
] as const

export const REGIONS = ["US East", "EU West", "Asia Pacific", "South America"] as const

export const UPLOAD = {
  file: "changelog-2.0.pdf",
  states: [
    { share: 0.35, note: "0.8 of 2.4 MB" },
    { share: 0.72, note: "1.7 of 2.4 MB" },
    { share: 1, note: "Uploaded" },
  ],
} as const

/** The #launch channel, in order. Every line fits one row. */
export const CHAT: readonly { who: CrewId; text: string }[] = [
  { who: "A", text: "Deploy is green" },
  { who: "M", text: "We're live. Thank you all" },
  { who: "T", text: "Northwind went annual" },
  { who: "K", text: "Inbox is down to 7" },
  { who: "B", text: "Changelog is posted" },
  { who: "A", text: "EU West is live too" },
  { who: "M", text: "Signups just passed 1,400" },
  { who: "T", text: "First 5 star review is in" },
]

export const NOTIFICATIONS = [
  { title: "Build passed", body: "main #482 in 3m 12s" },
  { title: "Payment received", body: "Northwind, $2,400.00" },
  { title: "Signups record", body: "1,467 today" },
  { title: "New review", body: "5 stars from Lena at Oakline" },
  { title: "Region live", body: "EU West is serving traffic" },
] as const

export const SEARCH = "refund policy"
