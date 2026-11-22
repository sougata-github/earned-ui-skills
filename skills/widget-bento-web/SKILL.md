---
name: widget-bento-web
description: Build a bento of live widgets for a website, where every tile proves one thing the page says with real product UI instead of decoration. Use when asked for a bento grid, a widget grid or wall, a features or product section with visuals, Apple style widgets on the web, dashboard style tiles, animated or live cards, or when an existing bento looks generic, empty, busy, or broken on some screens. Covers the workflow that gets a good first result (the content's claims and one story, the empty structure approved in a lab first, then one widget at a time at its real size), choosing a form for each tile, fixed size tiles that rearrange per screen instead of squeezing, widgets that change state on a beat instead of looping motion, an optional opening, a small React wall engine and lab to adapt, and the mistakes that cost the most time.
---

# Widget bento for the web

This skill is a workflow, not a component library. It carries what it took
to get a wall of widgets to look designed in a browser: the order to work
in, how to choose what goes in a tile, the layout rules, a small wall engine
and lab to adapt to the project, and the mistakes worth not repeating.

It is for websites (a features section, a product page, a showcase, a hero),
not for native app widgets.

## The one rule

**A tile is evidence.** Every tile proves one thing the page already says,
in the form that thing already has. A conversation is a chat. A schedule is
a calendar. A rollout is a slider. A trend is a line. If a tile would look
at home on any other site, it is decoration, and a wall of decoration is
what makes a bento read as generated.

## The lab is the method

A bento is judged by eye, at its real size, with its neighbours beside it.
No description of "a bit tighter, that tile is too tall, it feels busy"
survives the round trip through code and reloads. So the work goes through a
lab: one page with the wall at its real sizes, a control for everything that
is judged by eye, and a button that copies the values out.

The lab is used twice. First with every tile empty, a labelled box, so the
structure is approved before any content exists. Then one widget at a time:
each is shown in the lab at its real size, in both themes, and the human
either tweaks and sends the values back as JSON or says the current look is
fine. Either way the agent keeps going.

## Workflow

Copy this checklist into the response and work through it in order:

```
Widget bento progress:
- [ ] 1. Read the content: list the claims, pick one story and one cast
- [ ] 2. Choose the frame, and where each tile's text goes
- [ ] 3. Build the lab and show the empty bento
- [ ] 4. For each tile: pick the form, build it at its real size, show it
         in the lab, take tweaks or keep the current values
- [ ] 5. Make it alive: a few states per tile, one conductor
- [ ] 6. Arrange the tiles for every screen shape
- [ ] 7. Wire it into the page
- [ ] 8. Verify against the checklist at the end
```

### 1. Claims, one story, one cast

Read the site's copy and list what it claims: features, outcomes, the
product's parts. Each claim becomes one tile. No claim, no tile.

Then pick **one story** that runs through every tile (a launch day, a
customer's first week, a month of a team's work) and **one cast** (a product
name, four or five people, one customer). Put every name, number and date in
one file and have every tile read from it. The same people show up in the
chat, the calendar, the invoice and the avatars. That is what makes twenty
tiles read as one product and not a sticker sheet.

Nothing is random and nothing is invented as fact. Demo data is a fixed,
believable sample. Never present it as the product's real metrics, and ask
the human for real numbers before anything reads as a claim.

### 2. The frame, and where the text goes

| Frame | Looks like | Use for |
| --- | --- | --- |
| **Mosaic** | Rounded tiles on a soft canvas with gaps, white cards nested in the tiles, the title inside the tile | A showcase wall, a hero, a product page. `assets/wall.tsx` builds this |
| **Ruled** | Square cells divided by hairlines that run end to end, each widget on its own rounded surface in its cell, a title and a line of description under it | A features section inside a page of body copy |

Per tile, the text sits in one of three places: under the widget (ruled),
inside at the top (mosaic), or laid over a calm corner of full bleed content
(a map, an image). Recipes for both frames: `references/layout.md`.

### 3. The lab, and the empty bento

Build the lab once and keep it (`references/lab.md`). `assets/WidgetLab.tsx`
is a working starting point on top of `assets/wall.tsx`.

Start with every tile empty: a name, what it will prove, and a height. A
tile's shape follows its content. Things that spread (a trend, a week of
bars, a thread) get a wide or tall tile. One number or one ring gets a small
one. A compact idea in a wide box never lands.

Show it and ask, in words like these:

> The empty bento is in the lab at `/lab/bento`: 12 tiles, each labelled
> with what it will show and its size. Check the mix, the sizes and which
> tiles are dark. Drag gap, radius and padding until the structure feels
> right, press **Copy as JSON** and paste it here. Or tell me it looks right
> and I'll keep these values.

Do not design content into a structure the human has not seen.

### 4. One tile at a time, through the lab

For each tile:

1. **Pick the form from the data,** not from a list of charts
   (`references/forms.md`). A chart only when the data is a series. Mix
   forms across the wall and never repeat one side by side.
2. **Build it at its real size.** The tile's height is fixed. Lay the
   content out to fill it on whole pixels, on the wall's one anatomy: one
   title size, one meta size, one number size, one pill, one icon family,
   nested radii concentric with the tile (`references/layout.md`).
3. **Show it in the lab and ask** for tweaks or a go ahead:

   > The signups tile is in the lab, in both themes. Click it to step
   > through its three states. Tell me what to change, or that it looks
   > right and I'll move to the next tile.

4. **Keep going either way.** Pasted JSON: check every key of `Look` is
   present and sensible, then lock it in one file as the wall's preset.
   "Looks right": keep the current values. Do not call a tile final until
   the human has seen it.

A change the human asks for on one tile usually applies to the anatomy.
Apply it to every tile that shares the part, not only the one named.

Never change tuned values on your own: changes go through the lab.

### 5. Alive: states on a beat

Alive means a widget **changes state**, not that it moves forever. Each
widget takes a `step` and shows the state for it: Send, Sending, Sent. A
rollout at 25, 50, 100. A number rolling to its next value. Two to four
states each. One conductor raises the step of two tiles every beat (about
520 ms), in a fixed order that never wakes two neighbours together.
`assets/wall.tsx` has the conductor, `assets/pieces.tsx` has the rolling
number and the text swap, and `references/motion.md` has the rest.

Nothing loops for decoration and nothing is random. Under reduced motion the
wall is still.

### 6. Every screen shape

Responsive by arrangement, never by squeezing. Tiles keep their size. A
different screen gets the same tiles in a different number of columns, each
arrangement (a plan) laid out by hand so that every column ends level. The
lab shows whether each plan is level. The wall then picks the plan: one
screen where a plan matches the window's shape, otherwise the widest
readable plan that fills the width and scrolls. It never floats in the
middle of the window between wide empty bands. Details and the arithmetic:
`references/layout.md`.

### 7. Wire it into the page

```tsx
import "./bento.css"
import { Wall, type Plan, type Tile } from "./wall"

const TILES: Record<string, Tile> = {
  signups: { Widget: Signups, h: 222 },
  regions: { Widget: Regions, h: 236, dark: true, pad: 20 },
  // ...
}
const PLANS: Plan[] = [
  { name: "five", pad: 24, widths: [300, 236, 292, 236, 272], columns: [/* ... */] },
  { name: "three", pad: 24, widths: [290, 290, 290], columns: [/* ... */] },
  { name: "one", pad: 16, widths: [302], columns: [/* ... */] },
]

<Wall tiles={TILES} plans={PLANS} look={BENTO} title="Launch Day" />
```

`title` adds the opening: a blank canvas, the words coming into focus, then
every tile landing from enlarged and pushed out past the edges, the way a
home screen arrives on unlock. Use it for a hero or a showcase. Leave it out
for a section in the middle of a page.

`wall.tsx` fills the window. For a section inside a page, keep its layout
arithmetic and drop the zoom (`references/layout.md`, a section in a page).

### 8. Verify

```
- [ ] Every tile proves a claim from the page, in a form that fits it
- [ ] Every name, number and date comes from the one story file
- [ ] No two neighbours share a form, no decoration, no status dots
- [ ] One anatomy: type sizes, pill, icon family, radii concentric
- [ ] Every plan ends level, at every window shape from phone to desktop
- [ ] No wide empty bands around the wall at any window shape
- [ ] Both themes: text contrast, and raised parts still read in dark
- [ ] States change without anything beside them moving
- [ ] No row or card travels outside its list as it leaves
- [ ] Blur never above 3px, and no text that shifts when a move ends
- [ ] Reduced motion: no opening, no conductor, everything readable
- [ ] Nothing random: reload twice and it is the same wall
```

Say plainly what was not seen in a browser.

## The look

`Look` in `assets/wall.tsx`. These are what the lab tunes and hands back.

| Value | What it is | Start |
| --- | --- | --- |
| `gap` | Space between tiles, px | 14 |
| `radius` | Tile corner radius, px. A nested card's is this less the padding around it | 28 |
| `pad` | Tile padding, px, unless a tile sets its own | 18 |
| `beat` | Between two wakes of the conductor, ms | 520 |

Colour is in `assets/bento.css`: neutral surfaces (a canvas, a tile, a card
nested in the tile, a few dark tiles) and a small set of colours that each
mean one thing across the whole wall.

## Lessons that cost the most time

Each one is something that looked wrong on screen. All of them, with the
fix: `references/lessons.md`.

1. A compact idea in a wide box never lands. Fit the form to the box.
2. A wall of charts reads as a dashboard template. Most tiles are product
   UI: a thread, a calendar, a toggle list, a player.
3. Twenty unrelated tiles read as a sticker sheet. One story, one cast.
4. A control alone in a tile means nothing. It lives with what it changes.
5. Random data and random timing cannot be reviewed. Everything is fixed.
6. Squeezing a tile for a small screen breaks it. Rearrange the tiles.
7. A wall scaled into a window of another shape floats between empty bands
   and reads as broken. Keep an arrangement per shape.
8. One accent on twenty tiles is flat, and a colour per tile is noise. A
   few colours, each with one meaning.
9. Everything moving at once is noise. State changes on a beat, two tiles
   at a time, never neighbours.
10. Blur as an effect reads as smeared. It is a 2px mask on a crossfade.
11. A row that glides out of its list flashes over whatever is beside it.
    It leaves inside the list.
12. Gliding text shifts by a fraction of a pixel when the move ends. Keep
    those rows on their own layer, and only those rows.
13. Small status dots are filler. The state is already in the words.
14. A state said twice (a tick beside "Sent") is noise. Say it once.

## Related skills and sources

- `liquid-glass-web` in this repo, when a tile or a panel over it is glass.
- Emil Kowalski's `animate` and `review-animations` skills, for the easing
  and timing of any motion added around the wall:
  `npx skills add emilkowalski/skills`.
- Apple's Human Interface Guidelines on
  [widgets](https://developer.apple.com/design/human-interface-guidelines/widgets),
  for what belongs in a small glanceable surface.

## Files

- `assets/wall.tsx`: the wall. Plans and the level check, the fit to any
  window, the conductor, the optional opening. React only.
- `assets/pieces.tsx`: a number that rolls to its value, text that
  crossfades to its value. The swap uses `motion`.
- `assets/bento.css`: tokens for both themes, the wall, the opening, the
  pieces. Plain CSS.
- `assets/WidgetLab.tsx`: the lab. Controls, empty tiles, the level check,
  click a tile to step it, Copy as JSON.
- `references/forms.md`: the forms a tile can take, when to use each.
- `references/layout.md`: anatomy, whole pixels, both frames, plans, the
  fit rule, a section in a page.
- `references/motion.md`: states, the conductor, gliding rows, the opening.
- `references/lab.md`: building and running a lab session.
- `references/lessons.md`: every pitfall with its cause and fix.
