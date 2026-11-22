import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { WidgetWall, WidgetWallLab } from "./WidgetWall"

// ?lab shows the wall in the bento lab, with its controls.
const lab = new URLSearchParams(window.location.search).has("lab")

createRoot(document.getElementById("root")!).render(
  <StrictMode>{lab ? <WidgetWallLab /> : <WidgetWall />}</StrictMode>
)
