---
'@vapor-ui/core': patch
---

**Avatar: Fix double rendering and deprecate `imageElement`/`fallbackElement` props**

Previously, when `children` were passed to `Avatar.Root`, the internal `image` and `fallback` primitives were still rendered alongside them, causing double rendering. This is now fixed — if `children` are provided, only `children` are rendered.

**Deprecated APIs:**

- `imageElement` — Use `children` to compose `Avatar.ImagePrimitive` directly.
- `fallbackElement` — Use `children` to compose `Avatar.FallbackPrimitive` directly.

**New recommended usage:**

```tsx
<Avatar.Root src="..." alt="...">
    <Avatar.ImagePrimitive />
    <Avatar.FallbackPrimitive />
</Avatar.Root>
```
