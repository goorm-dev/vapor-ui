---
'@vapor-ui/core': patch
---

- fix a function `className` or `style` on a `render` element getting stringified into its source when the host component has its own `className` (e.g. `<Button render={<Button className={(state) => ...} />} />`)

- fix `Textarea`, `Menu.SubmenuTrigger`, and `Sheet.PopupPrimitive` detaching and re-attaching a callback `ref` on every render, and dropping the cleanup a React 19 callback `ref` returns
