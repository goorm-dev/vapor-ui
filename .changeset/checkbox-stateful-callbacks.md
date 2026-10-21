---
'@vapor-ui/core': patch
---

fix `Checkbox.Root` `className`, `style`, and `render` callbacks not receiving Base UI state (`checked`, `disabled`, etc.)

fix `NavigationMenu.Link` callbacks receiving Base UI `active`, which `NavigationMenu.Link.State` does not declare (use `current`)
