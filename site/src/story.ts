// One story, one cast: launch day for Relay 2.0, a small product team
// shipping a release. Every name, number and date on the wall comes from
// here, so thirty tiles read as one product, not a sticker sheet. Fixed
// values, nothing random.

export const PRODUCT = { name: "Relay", version: "2.0" }

export const LAUNCH = {
  day: 24,
  month: "November 2026",
  /** Nov 1, 2026 is a Sunday. */
  firstWeekday: 0,
  days: 30,
  slot: "Tue 9:00 AM",
}

export const CREW = [
  { initial: "A", name: "Ana", role: "Engineering" },
  { initial: "B", name: "Ben", role: "Design" },
  { initial: "K", name: "Kai", role: "Support" },
  { initial: "M", name: "Mira", role: "Founder" },
  { initial: "T", name: "Theo", role: "Growth" },
] as const

export const CUSTOMER = {
  name: "Northwind",
  plan: "Relay Pro, annual",
  amount: "$2,400.00",
  due: "Dec 1",
}

/** Each widget's values, one per state it steps through. */
export const SIGNUPS = [1204, 1318, 1402, 1467]
export const SIGNUP_HOURS = [22, 30, 41, 58, 74, 96, 120]
export const MRR = [
  { label: "$18.4k", points: [11, 12, 12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4] },
  { label: "$19.1k", points: [12, 12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4, 19.1] },
  { label: "$19.6k", points: [12.6, 13.4, 14.1, 15.2, 16.4, 17.1, 18.4, 19.1, 19.6] },
]
export const INBOX = [12, 9, 7]
export const ROLLOUT = [25, 50, 100]
export const UPTIME = ["99.96%", "99.98%"]

export const PIPELINE = ["Build", "Tests", "Deploy", "Smoke test"]

export const CHAT = [
  { who: "A", text: "Deploy is green" },
  { who: "M", text: "We're live. Thank you all" },
  { who: "T", text: "Northwind just upgraded to annual" },
  { who: "K", text: "Inbox down to 7, all calm" },
]

export const NOTIFICATIONS = [
  { title: "Build passed", body: "main #482 in 3m 12s" },
  { title: "Payment received", body: "Northwind, $2,400.00" },
  { title: "New signups", body: "1,402 today, a record" },
  { title: "Review", body: "5 stars from Lena at Oakline" },
]

export const MESSAGE = "Ship it"
export const SEARCH = "refund"
