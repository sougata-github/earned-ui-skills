# The forms a tile can take

Pick the form from the data. Ask what the claim's evidence already looks
like in the product, and draw that. A chart only when the data is a series.

Across a wall, most tiles are product UI and few are charts. Never put the
same form in two neighbouring tiles.

## Contents

- Numbers and series
- Progress
- Time
- People and messages
- Controls
- Documents and money
- Full bleed
- Choosing a size

Each form lists when it fits, when it does not, and the states it can step
through when the wall is alive.

## Numbers and series

**One number with a delta.** A big number, a short label, a small tinted
pill for the change. Use for one headline metric. Not for two or three
metrics in one tile: that is a table. States: the number rolls to its next
value, the pill's text swaps.

**Bars.** Five to twelve bars, the last one solid and the rest a tint of the
same colour. Use for a short series where the latest value matters. Needs
width: not in a tile narrower than about 230 px. States: the bars grow to a
new range, staggered by 30 to 40 ms.

**A line or an area.** One smooth curve with real dips, a soft gradient
under it, a dot on the last point. No gridlines, no axes. Use for a trend
over time in a wide tile. Not for a compact tile, where it turns into a
squiggle. States: the curve glides to a new shape (keep the number of points
the same in every state).

**A contribution grid.** Small square cells in weeks and days, a few tints.
Use for activity over a long period in a wide tile. Cells stay square: on a
smaller tile show fewer weeks, never squashed cells.

**A ranked list.** Three to five rows, each a label, a value and a thin bar.
Use when order is the point. States: a row changes rank and glides to its
new place.

## Progress

**A ring.** One groove and one fill inset in it, a number in the middle. Use
for one share of a whole in a compact tile. Not for two or more values (use
bars). Not in a wide tile, where it leaves the sides empty. States: the fill
grows a step, the number rolls.

**A split bar.** Two segments of one bar, a gap between them. Use for done
against open. States: the split moves.

**A slider.** A thin track, a fill, a round thumb, the value above it. Use
for something set to a level (a rollout, a volume, a budget). States: the
thumb glides to the next level.

**A pipeline or checklist.** Three to five rows, each a mark (done, running,
waiting), a label and a time. Use for a process with ordered stages. States:
the running mark moves down one row.

**An upload or a transfer.** A file name, a size line, a thin bar. States:
the bar fills, the line reads "Uploaded", the icon becomes a tick.

## Time

**A calendar month.** Weekday letters, a grid of days, one day marked, a
note under the grid. Use when a date is the claim. Keep the mark still and
change the note. A mark that jumps between days reads as a glitch.

**A countdown.** A large tabular time, a label above, a line below. Use
once per wall at most. It is the one widget allowed to tick every second.

**A timeline.** A row of stops with one current. Use for a journey with a
few fixed stages.

## People and messages

**A thread.** Avatars and one line bubbles, the reader's own on the other
side in the accent, a typing row at the bottom. The list is full from the
first frame. States: the list moves up one line.

**A notification stack.** Three cards, the newest on top, older ones
fainter, each with a tinted icon, a title, a line and a time. States: a new
card arrives on top, the oldest leaves under the last.

**A person on duty.** An avatar, a name, a line. For a compact tile.
States: the person changes.

**A voice note or a player.** A round play button, a waveform or a seek
bar, a time. States: the played part advances, the button swaps to pause.

## Controls

**A toggle list.** Two or three rows, each a name, a line and a switch, on
one nested card. States: a switch flips.

**A segmented switch.** Only inside the tile whose content it changes. A
day, week, month switch alone in a tile means nothing.

**A stepper.** A minus, a number, a plus. States: the number rolls.

**A search field.** A pill field with an icon, a typed query and a result
count. States: the query types at a steady pace, then the count appears.

**A status button.** One pill that says the state: Deploying with a spinner,
then live in the done colour. States: two.

## Documents and money

**A sheet.** One white card filling the tile: a title, a status line, three
rows of label and value, two buttons. Use for an invoice, an order, a
booking. States: the status line and the main button step through ready,
sending, sent. Say the state once: the word and the colour, no tick beside
it as well.

**Platform or plan cards.** Two or three small cards in a row, each an icon
in its own colour and a label. States: a pending card (a spinner in soft
ink) becomes live.

**A rating.** Five stars and a line. States: the last star fills.

## Full bleed

**A map, an image or art** filling the tile edge to edge, the title laid
over its calmest corner. Use when the content is the picture. Check the
text's contrast against the part of the image it sits on, in both themes.

## Choosing a size

| The content | The tile |
| --- | --- |
| One number, one ring, one person, one control | Small: about 100 to 170 px tall |
| A short list, bars, a sheet's summary | Medium: about 200 to 260 px |
| A month, a thread, a sheet with buttons | Tall: about 270 to 320 px |
| A trend, a contribution grid, a timeline | Wide: the widest column, or two columns in a ruled frame |

Draw the content first at its natural size, then set the tile's height to
fit it with even gaps. Never pick a height and stretch the content into it.
