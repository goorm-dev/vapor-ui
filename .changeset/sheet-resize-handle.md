---
'@vapor-ui/core': minor
---

Add `Sheet.ResizeHandle` for edge drag-and-keyboard resizing.

Place `Sheet.ResizeHandle` inside `Sheet.Popup` to let users resize the sheet by dragging its edge or using arrow keys / Home / End. Size bounds are configured on `Sheet.Root` via the new `minSize`, `maxSize`, and `defaultSize` props; the handle accepts `step` and `disabled`.
