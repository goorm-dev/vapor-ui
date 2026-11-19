---
'@vapor-ui/composites': minor
---

add `ref`, `id`, `className`, `style` DOM API to `Dialog`, `AlertDialog`, `Menu` composites

**Breaking:** `Dialog.Action`, `Dialog.Assistive`, `AlertDialog.Action`, and `AlertDialog.Cancel` no longer accept every `Button` prop. They expose only `id`, `className`, `style`, `isDisabled`, `closeOnClick`, `onClick`, and `children`, plus `ref`. Rename `disabled` to `isDisabled`.
