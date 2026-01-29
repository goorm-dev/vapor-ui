---
"@vapor-ui/core": patch
---

fix(dialog): correct ReactElement type parameters in DialogPopup props

Fixed incorrect type parameters for `portalElement` and `overlayElement` in `DialogPopup.Props` from `typeof Component` to `Component.Props`.
