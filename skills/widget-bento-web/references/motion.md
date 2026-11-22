# Motion

A wall is alive because its widgets change state, not because things move.

## Contents

1. States, not loops
2. The conductor
3. The two pieces
4. Rows that glide
5. Text that moves
6. The opening
7. Blur
8. Durations and curves
9. Reduced motion

## 1. States, not loops

Every widget takes a `step` and shows the state for it:

```tsx
export function Rollout({ step }: WidgetProps) {
  const pct = [25, 50, 100][step % 3]
  // ...the fill and the thumb transition to pct
}
```

Two to four states each. A state change is one small, legible event: a word
swaps, a number rolls, a bar grows, a switch flips, a row arrives. Lay every
state out at its final size, so a change never moves anything beside it.

Nothing loops for decoration. The exceptions earn it: a spinner while
something is in progress, a caret while a field is typing, a countdown.

## 2. The conductor

One timer for the whole wall (`wall.tsx`). Every beat (about 520 ms) it
raises the step of two tiles: the next in a fixed order and the one half the
list away. `wakeOrder()` builds the order from the widest plan, row by row
across the columns with a column skipped each time, so two changes in a row
are never neighbours.

- Fixed order, fixed beat. No random choice, no random delay.
- Two tiles a beat on a wall of twenty reads as alive. All of them at once
  reads as noise.
- It stops while the tab is hidden and under reduced motion.

## 3. The two pieces

`assets/pieces.tsx`.

**`Digits`** rolls a number to its new value. Each digit is a reel of 0 to 9
that slides to its value. Digits are keyed from the right, so a digit keeps
its reel as the number grows. Other characters stay put. The reel is clipped
with `clip-path`, not `overflow`, so the digit keeps its text baseline.

**`Swap`** crossfades text to its new value: the old text leaves upward, the
new one arrives from below, 0.35 em of travel, a 2 px blur while they
overlap, 450 ms.

## 4. Rows that glide

A thread or a stack of cards moves one slot at a time. Give every row an
absolute position and a slot, and change the slot:

```tsx
const ROWS = 5, SLOT = 42, EDGE = 12, LEAVE = 220

// One above and one below the window stay mounted, unseen.
{keys.map((k) => {
  const slot = k - step
  const seen = slot >= 0 && slot < ROWS
  const y = slot < 0 ? -EDGE : slot < ROWS ? slot * SLOT : (ROWS - 1) * SLOT + EDGE
  return (
    <div
      key={k}
      className="moving-text"
      style={{
        position: "absolute", insetInline: 0, top: 0,
        transform: `translateY(${y}px)`,
        opacity: seen ? 1 : 0,
        zIndex: seen ? 1 : 0,
        transition: "transform 600ms var(--ease-out-quint), opacity 600ms var(--ease-out-quint)",
        // A row that leaves fades faster than it moves.
        transitionDuration: seen ? undefined : `600ms, ${LEAVE}ms`,
      }}
    />
  )
})}
```

- **Full from the first frame.** The list starts full and moves. It never
  starts empty and fills.
- **A row leaves inside its list.** It steps a few pixels past the edge,
  fades in about 220 ms, and sits behind the row taking its place. A row
  that glides a whole slot out while fading flashes over whatever is there
  (a header, the next tile).
- Keys are the items' positions in the story, so a row is the same element
  for its whole life and only its slot changes.

## 5. Text that moves

A row of text that glides gets a compositor layer for the move. When the
move ends the browser takes the layer away and redraws the words on the
pixel grid, and they shift by a fraction of a pixel. It reads as jitter.

```css
.moving-text {
  will-change: transform;
}
```

`will-change: transform` on those rows keeps the layer and stops the redraw.
Put it on the gliding rows only. Promoting everything costs memory and
softens text that never moves.

## 6. The opening

Pass `title` to the wall. For a hero or a showcase, not for a section in the
middle of a page.

1. **Blank.** Nothing but the canvas, for 400 ms.
2. **Title.** The words come into focus: a 3 px blur, 4% of a line of rise
   and 1% of scale, over about 900 ms, each word 120 ms after the one
   before. It holds for a second.
3. **Out.** A plain fade, 500 ms, with 1.5% of scale. Quieter and shorter
   than the entrance.
4. **Land.** Every tile on screen starts 1.5 times its size and pushed out
   from the centre by 90% of its distance, so most start past the edges.
   Each flies to its place over 1200 ms on a curve that is fast at first
   with a long soft settle. The centre leaves first and the corners up to
   150 ms later. Opacity arrives in 420 ms, well before the tile rests.
5. **Live.** The conductor starts.

One gesture, no change of speed half way, no overshoot. Tiles below the fold
do not fly: they are simply there when the page scrolls.

## 7. Blur

Blur is a mask, never an effect.

| Where | Blur |
| --- | --- |
| Two texts crossing in a swap | 2 px |
| The title coming into focus | 3 px |
| The first frames of a tile landing | 3 px, gone in 320 ms |
| The title leaving | 2 px |
| Rows that move and fade | none |

Anything above this reads as smeared. If it looks soft, remove the blur
before changing anything else.

## 8. Durations and curves

| Change | Duration | Curve |
| --- | --- | --- |
| A thumb, a fill, a row gliding | 600 ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| A number rolling | 800 ms | the same |
| A bar, a ring, a curve growing | 700 to 900 ms | the same |
| A text swap | 450 ms | the same |
| A mark popping in (from 0.8 scale, never from 0) | 420 ms | the same |
| A row leaving (opacity) | 220 ms | the same |
| A tile landing | 1200 ms | `cubic-bezier(0.2, 0.9, 0.2, 1)` |

These are longer than interface motion (150 to 300 ms) on purpose. Nothing
here answers a click: it is a scene being watched, and a state change needs
to be seen. Exits are still quicker and quieter than entrances.

## 9. Reduced motion

Under `prefers-reduced-motion: reduce` the wall shows its resting state: no
opening, no conductor, no spinners or pops. Every tile must read well in its
first state, since that is the one shown.
