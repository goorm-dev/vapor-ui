---
'@vapor-ui/core': minor
---

fix(segmented-control): change default `size` from `md` to `lg` to match Figma

**Action required:** every `SegmentedControl.Root` rendered without a `size` prop will now be larger. Check those usages and add `size="md"` wherever the previous size should be kept.
