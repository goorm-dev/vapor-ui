# Badge Component Migration Guide

## Component: `Badge` ➡️ `Badge`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Badge component API for vapor-ui migration. The `pill` attribute is unified into `shape`, and custom element rendering functionality is added.

---

## 1. Name Change

The component name remains unchanged.

---

## 2. Usage Change

The basic usage is the same, but the `pill` boolean prop has been changed to the `shape` prop.

```javascript
// Before
<Badge color="primary" size="md" pill={true}>
  Label
</Badge>

// After
<Badge color="primary" size="md" shape="pill">
  Label
</Badge>

// New: Custom element rendering
<Badge render={<a href="/link" />}>
  Link Badge
</Badge>
```

---

## 3. Props Changes

| **Prop** | **Before** | **After** | **Change Type** | **Migration Method / Notes** |
|----------|------------|-----------|-----------------|------------------------------|
| `pill` | `boolean` | (removed) | **Removed** | The `pill` prop has been removed and unified into the `shape` prop. Change `pill={true}` → `shape="pill"`, `pill={false}` → `shape="square"`. |
| `shape` | (none) | `'square' \| 'pill'` | **New Prop** | Replaces the existing `pill` boolean prop. Default value is `'square'`. |
| `size` | `'sm' \| 'md' \| 'lg'` | (no change) | **No Change** | |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'contrast' \| 'hint'` | (no change) | **No Change** | |
| `render` | (none) | `ReactElement` | **New Prop** | Same functionality as Radix UI's `asChild`. Replace HTML element with another tag or compose with other components. Only the usage differs. |

---

## 4. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
   - Changes Badge import to Badge
   - Automatically merges with existing `@vapor-ui/core` imports

2. **Component Name**: Badge remains as Badge (no change)

3. **Prop Changes**:
   - `pill={true}` → `shape="pill"` (boolean to string)
   - `pill={false}` → `shape="square"` (boolean to string)
   - When `pill` prop is not specified, no shape prop is added (default `'square'` is implicit)
   - Automatically converts `asChild` prop to `render` prop
   - All other props (color, size, className, etc.) are preserved

4. **Prop Preservation**:
   - All other props are preserved as-is
   - Expression props are automatically handled

---

## 5. Manual Migration Required

**Most cases do not require manual work!** ✨

The codemod automatically handles:

- ✅ Import changes and merges
- ✅ pill boolean → shape string conversion
- ✅ asChild → render prop conversion
- ✅ All props preservation

Manual review may only be needed for:

1. **Dynamic pill prop**: When the `pill` prop is an expression or variable
   - The codemod converts expressions, but verify the logic is correct
2. **Custom children**: When complex custom content exists inside Badge

---

## 6. Notes

### Design Tokens and Styling

The new Badge component is implemented with CSS-in-JS using Vanilla Extract.

**Key features:**

- Consistent shape terminology (`square` and `pill`)
- Simplified API with `shape` prop instead of `pill` boolean
- Systematic application of design tokens
- Custom element rendering through `render` prop

### Default Values

- Old Badge: No `pill` prop (default: false, square shape)
- New Badge: `shape="square"` (default)

Defaults are equivalent, maintaining the same behavior without additional adjustments.

---
