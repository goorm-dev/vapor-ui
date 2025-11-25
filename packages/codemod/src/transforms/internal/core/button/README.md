# Button Component Migration Guide

## Component: `Button` ➡️ `Button`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Button component API for vapor-ui migration. Variant naming is improved, and custom element rendering functionality is added.

---

## 1. Name Change

The component name remains unchanged.

---

## 2. Usage Change

The basic usage is the same, but the custom element rendering capability through the `render` prop has been added.

```javascript
// Before
<Button color="primary" shape="fill" size="md">
  Click me
</Button>

// After
<Button color="primary" variant="fill" size="md">
  Click me
</Button>

// Before: Custom element rendering
<Button asChild>
  <a href="/link">
    Link Button
  </a>
</Button>

// After
<Button render={<a href="/link" />}>
  Link Button
</Button>
```

---

## 3. Props Changes

| **Prop**                   | **Before**                           | **After**            | **Change Type**       | **Migration Method / Notes**                                                                                                                |
| -------------------------- | ------------------------------------ | -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `shape`                    | `'fill' \| 'outline' \| 'invisible'` | Changed to `variant` | **Name Change**       | Prop name changed from `shape` to `variant`.                                                                                                |
| `shape` value: `invisible` | `'invisible'`                        | `'ghost'`            | **Type/Value Change** | `'invisible'` has been changed to `'ghost'`. `'fill'` and `'outline'` remain the same.                                                      |
| `size`                     | `'sm' \| 'md' \| 'lg' \| 'xl'`       | (no change)          | **No Change**         |                                                                                                                                             |
| `render`                   | (none)                               | `ReactElement`       | **New Prop**          | Same functionality as Radix UI's `asChild`. Replace HTML element with another tag or compose with other components. Only the usage differs. |

---

## 4. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes Button import to Button
    - Automatically merges with existing `@vapor-ui/core` imports

2. **Component Name**: Button remains as Button (no change)

3. **Prop Changes**:
    - `shape` → `variant` (prop name change)
    - `shape="invisible"` → `variant="ghost"` (value mapping)
    - `shape="fill"` → `variant="fill"` (preserved)
    - `shape="outline"` → `variant="outline"` (preserved)
    - Automatically converts `asChild` prop to `render` prop

4. **asChild → render prop automatic conversion** ✨
    - Automatically converts `asChild` prop to `render` prop
    - Extracts the first child element as render prop
    - Preserves child element props in render prop
    - Moves child element's inner content to Button's children

5. **Prop Preservation**:
    - All other props (color, size, className, etc.) are preserved
    - Expression props are automatically handled

---

## 5. Manual Migration Required

**Most cases do not require manual work!** ✨

The codemod automatically handles:

- ✅ Import changes and merges
- ✅ Component name (remains Button)
- ✅ shape → variant prop rename
- ✅ invisible → ghost value mapping
- ✅ asChild → render prop conversion
- ✅ All props preservation

Manual review may only be needed for:

1. **Dynamic shape prop**: When the `shape` prop is an expression or variable
    - The codemod converts expressions, but verify the logic is correct
2. **Complex asChild patterns**: When asChild contains complex nested structures

---

## 6. Notes

### Design Tokens and Styling

The new Button component is implemented with CSS-in-JS using Vanilla Extract.

**Key improvements:**

- Clearer variant naming (`ghost` instead of `invisible`)
- Consistent prop naming convention (`variant` for visual style)
- Systematic application of design tokens
- Custom element rendering through `render` prop

### Variant Mapping

All shape options map to variant:

- `fill`: Filled button (primary style)
- `outline`: Outlined button
- `invisible` → `ghost`: Transparent background button

### Default Values

- Old Button: No default `shape` (must be specified)
- New Button: No default `variant` (must be specified)

Defaults remain explicit, requiring intentional variant selection.

---
