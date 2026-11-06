---
'@vapor-ui/composites': minor
---

add `ref`, `id`, `className` DOM API to `Dialog`, `AlertDialog`, `Menu` composites

Root composites now forward `ref`, `id`, and `className` to their Popup DOM node (`PopupPrimitive` / `SubmenuPopupPrimitive`). Publicly exposed sub-components — `Dialog.Action`, `Dialog.Assistive`, `AlertDialog.Action`, `AlertDialog.Cancel`, `Menu.Item`, `Menu.CheckItem`, `Menu.SubmenuItem`, `Menu.Group`, `Menu.CheckGroup` — now forward the same three props to their underlying primitive. `className` is **merged** onto the core base classes, not replaced. The `trigger` slot keeps its existing behavior; consumers pass `ref`/`id`/`className` through `render` as before.
