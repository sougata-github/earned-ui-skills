import type { CSSProperties } from "react"
import { AnimatePresence, motion } from "motion/react"

// Two pieces every live widget needs: a number that turns to its new value,
// and text that crossfades to its new value. Both lay out at their final
// size, so a change never moves anything beside it.
//
// `Digits` needs `bento.css`. `Swap` needs `motion` (motion/react), or
// replace it with the project's own crossfade.

const REEL = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const UNSEEN: CSSProperties = { visibility: "hidden" }

/** A number whose digits turn to their new value, like an odometer. Other
 *  characters (a comma, a colon, a point) stay put. */
export function Digits({ value }: { value: string | number }) {
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
            <span style={UNSEEN}>8</span>
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

const HOLDER: CSSProperties = { position: "relative", display: "inline-flex" }
const LINE: CSSProperties = { whiteSpace: "nowrap" }

/** Text that crossfades to its new value. The trace of blur keeps the two
 *  texts from reading as two objects while they overlap. */
export function Swap({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className} style={HOLDER}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          style={LINE}
          initial={{ opacity: 0, y: "0.35em", filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-0.35em", filter: "blur(2px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
