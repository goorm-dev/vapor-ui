---
'@vapor-ui/core': minor
---

fix(breadcrumb): remove `size` from `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive` props

`size` on `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive` never affected styling (only `Breadcrumb.Root`'s `size` is used) and leaked to the DOM as `<a size="...">`.

**Action required:** remove `size` from any `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive` and set it on `Breadcrumb.Root` instead. Passing it there is now a type error.
