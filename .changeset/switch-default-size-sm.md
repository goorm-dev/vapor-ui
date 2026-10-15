---
'@vapor-ui/core': minor
---

fix(switch): change default `size` from `md` to `sm` to match Figma

**Action required:** every `Switch.Root` rendered without a `size` prop will now be smaller. Check those usages and add `size="md"` wherever the previous size should be kept.
