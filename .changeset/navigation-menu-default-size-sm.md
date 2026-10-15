---
'@vapor-ui/core': minor
---

fix(navigation-menu): change default `size` from `md` to `sm` to match Figma

**Action required:** every `NavigationMenu.Root` rendered without a `size` prop will now be smaller. Check those usages and add `size="md"` wherever the previous size should be kept.
