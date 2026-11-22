# The bento lab

The lab is where the wall is judged. Build it before any content, and take
every tile through it.

## What the lab holds

- **The wall at its real sizes,** on the real fonts and tokens.
- **Empty tiles:** a switch that shows every tile as a box with its name,
  what it will prove and its size. The structure is approved like this.
- **A slider** for the gap, the tile radius, the tile padding and the beat,
  each with its value printed beside it.
- **The plans:** a choice of plan (or automatic by window), and for each
  plan its size and whether its columns end level.
- **The conductor** on or off.
- **Click a tile** to step it to its next state, so each state is judged
  still.
- **The theme toggle.**
- **Replay opening,** when the wall has one.
- **Copy as JSON:** the look, plus the theme and plan it was judged on.

`assets/WidgetLab.tsx` has all of this in one React file with inline styles,
on top of `assets/wall.tsx` and `assets/bento.css`.

```tsx
<WidgetLab tiles={TILES} plans={PLANS} title="Launch Day" look={BENTO} />
```

## Keep it unlisted

Put the lab at a route like `/lab/bento`: `noindex`, out of the sitemap and
navigation, disallowed in `robots.txt`. It stays after launch for later
changes.

## Two passes

**Pass one, the empty bento.** Tiles have a `label` and a height and no
widget. Give the human this order:

1. **The mix.** Is there a tile for every claim, and nothing that is filler?
2. **Sizes.** Does each tile's shape suit what it will hold?
3. **Dark tiles.** Two or three, spread out.
4. **Gap, radius and padding.** Drag until the structure feels right.
5. **Each plan.** Switch through them and check the order makes sense on a
   phone as well as on a desktop.

**Pass two, one tile at a time.** Build a widget, show it, and ask. For each
tile the human checks:

1. **Still.** Conductor off. Does it fill its tile with even gaps?
2. **Each state.** Click through them. Does anything beside the change move?
3. **Both themes.**
4. **With its neighbours.** Conductor on. Does it sit well in the wall?

## Locking values

The human either presses Copy as JSON and pastes the values into the
conversation, or says the current look is fine. The agent checks pasted
values (every key of `Look` present and sensible) and writes them as the
wall's preset in one file:

```ts
// Tuned by eye in /lab/bento on 2026-11-22, in both themes, on the five
// and one column plans. Change through the lab, not here.
export const BENTO = { gap: 14, radius: 28, pad: 18, beat: 520 } satisfies Look
```

Then the lab's defaults point at the preset. After a change to the gap,
check every plan is still level (the lab says so) and fix the ones that are
not. After a change to the radius or padding, recompute the nested radii.

Feedback in words ("the tab's padding is off", "that looks cheap") is as
valid as JSON. Fix the named thing exactly, then look for the same fault in
every tile that shares the part.

## Recording the lab

The lab is also the best demo. For a recording, use a window that matches
the widest plan's shape so the wall fills it, load once so the fonts are
cached, then replay the opening.
