---
'@vapor-ui/codemod': minor
---

Add v1/migrate transform for @base-ui/react v1.1.0 migration

- `trackAnchor` → `disableAnchorTracking` (boolean inversion)
- `loop` → `loopFocus` (Menu, Tabs)
- Move `openOnHover`, `delay`, `closeDelay` from Root to Trigger (Tooltip, Preview Card)
- `hoverable` → `disableHoverablePopup` (Tooltip only, boolean inversion)
