---
'figma-plugin': minor
'@vapor-ui/core': minor
'website': minor
---

**BREAKING CHANGE**: Remove `stretch` prop from Button, IconButton, and NavigationMenu components

The `stretch` prop has been removed to align with Figma's component variant system. In Figma, width control is handled via "Fill Container" (Auto Layout), not as a component variant.

**Migration Guide:**

Replace `stretch` prop with Tailwind's `w-full` utility class:

```tsx
// Before
<Button stretch>Submit</Button>
<NavigationMenu stretch>...</NavigationMenu>

// After
<Button className="w-full">Submit</Button>
<NavigationMenu className="w-full">...</NavigationMenu>
```

**Why this change:**

- Maintains Figma-React design system parity (SSOT principle)
- Follows "React Props = Figma Variants" architectural principle
- Aligns with Vapor UI's 4-layer component architecture (Container, Interaction, Contents, Slot)
- Layout concerns should be handled by parent containers, not component props
