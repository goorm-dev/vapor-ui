---
'@vapor-ui/core': minor
---

fix(avatar): change default `shape` from `square` to `circle` to match Figma

**Action required:** every `Avatar.Root` rendered without a `shape` prop will now be circular. Check those usages and add `shape="square"` wherever the previous square look should be kept.
