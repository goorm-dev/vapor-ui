---
'@vapor-ui/core': patch
---

Align `Button` with Figma: secondary and contrast `outline`/`ghost` labels now use `foreground.normal` and `foreground.contrast`, and icons are sized per `size` (sm/md 16px, lg 20px, xl 24px). An icon's own `size` prop no longer changes its size inside `Button`.
