---
'@vapor-ui/codemod': major
---

Add v1/migrate transform for @vapor-ui/core v1.0.0 migration

- `trackAnchor` → `disableAnchorTracking` (boolean inversion)
- `loop` → `loopFocus` (Menu, Tabs)
- Move `openOnHover`, `delay`, `closeDelay` from Root to Trigger (Tooltip, Preview Card)
- `hoverable` → `disableHoverablePopup` (Tooltip only, boolean inversion)
