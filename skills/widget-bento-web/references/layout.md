# Layout

How the wall is put together so that it holds at every size.

## Contents

1. One anatomy
2. Whole pixels
3. Concentric radii
4. Colour
5. The mosaic frame
6. The ruled frame
7. Plans: one arrangement per screen shape
8. The fit rule
9. Zoom, not a transform
10. A section in a page

## 1. One anatomy

Every tile is built from the same few parts. This, more than any single
tile, is what makes the wall read as designed.

| Part | Value on the reference wall |
| --- | --- |
| Tile title | 14 px, semibold, line height 1 |
| Meta and captions | 12 px, soft ink, line height 1 |
| The big number | 34 px, semibold, tight tracking, tabular |
| Pill (a delta, a count) | 24 px tall, 11 px semibold, a tint of its colour |
| Round control | 28 px |
| Icons | One family, 16 to 18 px, one stroke weight per role |
| Nested card | The inner surface colour, one faint shadow |

Set `line-height: 1` on single lines, so a line's box is its font size and
the arithmetic below is exact.

When the human asks for a change to one of these on one tile, change the
part everywhere.

## 2. Whole pixels

A tile's height is fixed and its content is laid out to fill it. Add up the
content, subtract it from the inner height, and the remainder is the gaps.
They should come out even and whole.

A worked example, a tile 222 px tall with 18 px padding:

```
inner height        222 - 36 = 186
header (a 32 px switch)        32
number                         34
bars                           92
content                       158
two gaps            186 - 158 = 28, so 14 each
```

If the gaps come out uneven or fractional (9.5 px), change the tile's
height by a few pixels or a part's size until they do not. Then fix the plan
(section 7), since a tile's height is part of every column's sum.

Widths work the same way. A switch with three segments on a 128 px track
with 4 px padding has 40 px segments. On a 126 px track it has 39.33 px
segments and the thumb never sits exactly on one.

## 3. Concentric radii

A nested shape's radius is the outer radius less the space between them.

```
tile radius 28, padding 12  ->  card radius 16
tile radius 28, padding 18  ->  card radius 10
card radius 10, padding 10  ->  inner chip radius about 6 to 8 (never 0)
```

If the lab changes the tile radius or padding, recompute the nested radii.

## 4. Colour

Neutral surfaces carry the wall: a canvas, a tile slightly darker than it,
a card inside the tile lighter than both, and a few dark tiles spread out
for contrast (never side by side).

Then a small set of colours, each with one meaning across the whole wall.
On the reference wall: green is live or done, blue is people and traffic,
orange is the event itself, violet is files and search, amber is praise,
rose is what needs attention. A colour appears as a solid fill, or as a
tint (the fill at about 15% over the surface) with a darker ink of the same
hue for text and glyphs on it.

- One accent across twenty tiles is flat. A colour per tile is noise.
- Text on a bright fill (green, amber) is dark in both themes. Text on a
  deep fill (blue, violet, orange, rose) is light in both themes.
- Dark mode is designed, not inverted. A raised thumb needs a track darker
  than the tile under it, or the two merge.

## 5. The mosaic frame

Rounded tiles on a soft canvas, separated by a gap. `assets/wall.tsx`.

- Columns of different widths, each a stack of tiles of fixed heights.
- Two small tiles can share a row.
- A tile that is one sheet has less padding and one nested card filling it.
- Text sits inside the tile, at the top.

## 6. The ruled frame

Square cells divided by hairlines that run end to end. For a features
section inside a page.

```css
.ruled {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;                       /* the hairlines are the gaps */
  background: var(--border);      /* showing through them */
  border: 1px solid var(--border);
}
.ruled > .cell {
  background: var(--background);  /* each cell covers the border colour */
}
```

- The lines are the grid's gap over the border colour, so they always meet
  and never double. Never draw them as borders on the cells.
- Cells are square cornered. The widget sits on its own rounded surface
  inside the cell. The cell never rounds to match the surface.
- Spans are uneven (two and one, then one and two), never an even grid.
- The widget's slot has a fixed height per breakpoint, so the titles under
  the widgets line up across a row.
- A title and one line of description sit under the widget.

## 7. Plans: one arrangement per screen shape

A plan is a hand made arrangement of all the tiles into columns:

```ts
{
  name: "three",
  pad: 24,                       // around the wall
  widths: [290, 290, 290],       // column widths the widgets were checked at
  grow: { voice: 2 },            // a tile 2 px taller in this plan only
  columns: [
    ["calendar", "search", ["oncall", "seats"], "regions", "revenue"],
    ["countdown", "pipeline", "notifications", "latency", "upload"],
    ["invoice", "voice", "chat", "signups", "platforms", "reviews"],
  ],
}
```

**Every column must end level.** A column's height is the sum of its tiles
plus a gap between each two. Columns with different numbers of tiles have
different numbers of gaps, so the sums must differ by exactly those gaps.
`lay()` returns `ragged`, the difference between the longest and shortest
column, and the lab prints it per plan. It must be 0.

To make a plan level:

1. Add up all the tile heights and the gaps the plan will have, and divide
   by the number of columns. That is the target column height.
2. If it is not a whole number, no arrangement can be level. Give one tile
   with loose spacing a pixel or two in this plan with `grow`.
3. Place the tallest tiles first, one per column, then fill. A short script
   that tries the combinations is faster than doing it by hand.
4. Spread the dark tiles so that no two sit side by side.

Make a plan for each shape the wall will meet: five or four columns for a
desktop, three for a tablet, two, and one for a phone. Check each widget at
the narrowest and widest column it appears in. Text that only just fits at
one width will overflow at another: shorten the text.

## 8. The fit rule

`pickFit()` picks a plan and a zoom for the window:

1. **One screen.** For each plan, the zoom at which it fits both the width
   and the height. Take the plan that leaves the least of the window empty.
   Use it if the zoom is at least 0.72 and no more than 15% is empty.
2. **Otherwise scroll.** The plan with the most columns that is readable at
   the window's width (zoom 0.78 to 1.3) and taller than the window. It
   fills the width and the page scrolls.
3. **Failing both** (a very wide window), the closest one screen fit.

This is what keeps the wall from floating in the middle of a window with
wide empty bands above and below, which reads as broken.

## 9. Zoom, not a transform

The stage has fixed pixel sizes and is scaled with CSS `zoom`. Text stays
sharp, which a `transform: scale()` does not guarantee, and the stage takes
its scaled size in the layout, so the page scrolls correctly.

Under zoom, move things with explicit transforms from known positions (the
plan's own numbers). Avoid layout animation that measures the page, since
measured pixels and stage pixels differ by the zoom.

## 10. A section in a page

`wall.tsx` sizes itself to the window. For a bento that is one section of a
longer page:

- Keep the tiles, the plans and `lay()`.
- Pick the plan from the section's own width (a container query or a
  `ResizeObserver` on the section), not the window's shape.
- Drop the zoom when the section's width matches a plan's width. Otherwise
  zoom to the section's width only.
- Leave out the opening, and pause the conductor while the section is off
  screen (an `IntersectionObserver` driving the `live` prop).
