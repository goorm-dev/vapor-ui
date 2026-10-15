---
'@vapor-ui/core': minor
---

fix(breadcrumb): match Figma by changing default `size` from `md` to `xl` and removing `size` from `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive` props

`size` on `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive` never affected styling (only `Breadcrumb.Root`'s `size` is used) and leaked to the DOM as `<a size="...">`.

**Action required:**

- Every `Breadcrumb.Root` rendered without a `size` prop will now be larger. Check those usages and add `size="md"` wherever the previous size should be kept.
- Remove `size` from any `Breadcrumb.Item` / `Breadcrumb.LinkPrimitive`; set it on `Breadcrumb.Root` instead. Passing it there is now a type error.
