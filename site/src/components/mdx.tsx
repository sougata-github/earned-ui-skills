import * as runtime from "react/jsx-runtime"
import type { ComponentProps } from "react"

// Velite compiles each body to a function body. This runs it against
// React's JSX runtime, at build time.
const compile = (code: string) => new Function(code)({ ...runtime }).default

const components = {
  // A wide table scrolls inside its own box, never the page.
  table: (props: ComponentProps<"table">) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
}

export function Mdx({ code }: { code: string }) {
  const Content = compile(code)
  return (
    <div className="prose">
      <Content components={components} />
    </div>
  )
}
