import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { WidgetWall, WidgetWallLab } from "./WidgetWall"

// ?lab shows the wall in the bento lab, with its controls. ?dark starts in
// the dark theme.
const params = new URLSearchParams(window.location.search)
const lab = params.has("lab")
if (params.has("dark")) document.documentElement.classList.add("dark")
// ?still: a posed wall for a capture. The class stops the last loops (the
// caret, the typing dots), so no two captures differ.
if (params.has("still")) document.documentElement.classList.add("still")

createRoot(document.getElementById("root")!).render(
  <StrictMode>{lab ? <WidgetWallLab /> : <WidgetWall />}</StrictMode>
)
