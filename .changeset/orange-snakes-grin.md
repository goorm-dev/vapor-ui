---
'@vapor-ui/core': major
---

Migrate to Base UI v1.1.0

### Breaking Changes

- **Checkbox/Switch/Radio**: Root element changed from `HTMLButtonElement` to `HTMLSpanElement`
- **Tabs.Root**: `loop` prop renamed to `loopFocus`
- **Tooltip.Root**: `hoverable` prop renamed to `disableHoverablePopup` (logic inverted)
- **Tooltip**: `delay`, `closeDelay` props moved from `Tooltip.Root` to `Tooltip.Trigger`
- **Popover**: `openOnHover`, `delay`, `closeDelay` props moved from `Popover.Root` to `Popover.Trigger`
- **Menu**: `openOnHover`, `delay`, `closeDelay` props moved from `Menu.Root` to `Menu.Trigger`
- **Form**: `onClearErrors` prop removed (now auto-handled internally)
- **NavigationMenu.Link**: `selected` prop renamed to `current` (for Breadcrumb API consistency)
- **Field**: `validationMode` default changed from `onBlur` to `onSubmit`
- **Tabs**: `activateOnFocus` default changed from `true` to `false`
- **CSS**: `data-selected` attribute changed to `data-active` in Tabs and NavigationMenu

### New Features

- **Field.Item**: New component added for improved accessibility when using Checkbox, Radio, Switch with Field
