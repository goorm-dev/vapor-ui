---
'@vapor-ui/core': patch
---

Infer the state argument of `style` and `render` callbacks instead of falling back to `any`. `VaporUIComponentProps` now omits Base UI's own `style`/`render` and redeclares them with the vapor-ui `State`. `NavigationMenu.Link` passes its custom state (`current`, `disabled`) to `style`/`render` callbacks as it already did for `className`. Also adds `Toggle.ChangeEventDetails` and `ToggleGroup.ChangeEventDetails`, and `Collapsible.Trigger.State` now points to `BaseCollapsible.Trigger.State`.
