---
'@vapor-ui/core': minor
---

fix(meter): change default `size` from `md` to `sm` to match Figma

**Action required:** every `Meter.Root` rendered without a `size` prop will now have a thinner track. Check those usages and add `size="md"` wherever the previous size should be kept.
