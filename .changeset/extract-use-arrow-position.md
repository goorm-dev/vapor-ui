---
'@vapor-ui/core': patch
---

Extract shared arrow positioning logic from `NavigationMenu`, `Popover`, and `Tooltip` into a `useArrowPosition` hook. Also bump the default `sideOffset` of these three primitives from `8` to `10`.
