---
'@vapor-ui/core': minor
---

fix(progress-bar): change default `size` from `md` to `sm` to match Figma

**Action required:** every `ProgressBar.Root` rendered without a `size` prop will now be thinner. Check those usages and add `size="md"` wherever the previous size should be kept.
