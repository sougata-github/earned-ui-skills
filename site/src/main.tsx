import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { WidgetWall } from "./WidgetWall"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WidgetWall />
  </StrictMode>
)
