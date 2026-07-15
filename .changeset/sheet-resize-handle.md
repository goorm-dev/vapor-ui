---
'@vapor-ui/core': minor
---

Add `Sheet.ResizeHandle` for edge drag-and-keyboard resizing.

Place `Sheet.ResizeHandle` inside `Sheet.Popup` to let users resize the sheet by dragging its edge or using arrow keys / Home / End. Size bounds live in CSS: set `min/max-width` (left/right sheets) or `min/max-height` (top/bottom sheets) on the Popup — px and viewport units are supported, and sensible defaults (64px to viewport size) apply when unset. The handle accepts `step` and `disabled`.
