# Alert Component Migration Guide

## Component: `Alert` ➡️ `Callout.Root`

- **Overview:** Migrate the Alert component to Callout for vapor-ui migration. Changes from a single component to a composition structure for more granular control over icons and other elements.

---

## 1. Name Change

Changed from a single component to a composition structure.

- **Before:** `<Alert>`
- **After:** `<Callout.Root>` (or `<Callout.Root><Callout.Icon>...</Callout.Icon>...` when icon is included)

**Migration:**

- Basic: `Alert` → `Callout.Root`
- Use `Callout.Icon` component when icon is needed

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
<Alert color="primary">Anyone can develop</Alert>

// After
<Callout.Root color="primary">Anyone can develop</Callout.Root>
```

### Usage with Icon

```javascript
// Before (no icon)
<Alert color="success">Success operation completed</Alert>

// After (icon can be added)
<Callout.Root color="success">
  <Callout.Icon>
    <CheckboxIcon />
  </Callout.Icon>
  Success operation completed
</Callout.Root>
```

### Various Color Usage

```javascript
// Before
<Alert color="warning">Warning message</Alert>
<Alert color="danger">Error message</Alert>
<Alert color="hint">Hint message</Alert>
<Alert color="contrast">Contrast message</Alert>

// After
<Callout.Root color="warning">Warning message</Callout.Root>
<Callout.Root color="danger">Error message</Callout.Root>
<Callout.Root color="hint">Hint message</Callout.Root>
<Callout.Root color="contrast">Contrast message</Callout.Root>
```

---

## 3. Props Changes

| **Prop**    | **Before**                                                                                       | **After**                                                                                        | **Change Type** | **Migration Method / Notes**                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------- |
| `color`     | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'contrast' \| 'hint'` (default: `'primary'`) | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'contrast' \| 'hint'` (default: `'primary'`) | **No Change**   | Color prop remains the same. All options are identical.                                 |
| `children`  | `ReactNode`                                                                                      | `ReactNode`                                                                                      | **No Change**   | Children are passed through as-is. Place `Callout.Icon` before children to add an icon. |
| `className` | `string`                                                                                         | `string`                                                                                         | **No Change**   | Custom style classes work as before.                                                    |
| `render`    | (none)                                                                                           | `ReactElement`                                                                                   | **New Prop**    | Replace HTML element with another tag or compose with other components.                 |

---

## 4. Sub-components

### Callout.Icon

Component for displaying an icon.

```javascript
<Callout.Root color="success">
    <Callout.Icon>
        <CheckboxIcon />
    </Callout.Icon>
    Success operation completed
</Callout.Root>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering
- `children`: Icon component (e.g., `<CheckboxIcon />`)

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes Alert import to Callout
    - Automatically merges with existing `@vapor-ui/core` imports

2. **Component Name**: `Alert` → `Callout.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **asChild → render prop automatic conversion** ✨
    - Automatically converts `asChild` prop to `render` prop
    - Extracts the first child element as render prop
    - Preserves child element props in render prop
    - Extracts the first child element and moves it to the `render` prop

4. **Automatic Icon Detection and Wrapping** ✨
    - Automatically detects if the first child JSX element is an icon
    - Detection condition: component name ends with "Icon" or is an `svg` tag
    - Automatically wraps detected icon with `<Callout.Icon>` wrapper
    - Skips text nodes and whitespace to detect only the first JSX element

5. **Prop Preservation**:
    - `color` prop remains as-is
    - All other props (className, etc.) are preserved
    - Expression props are automatically handled

---

## 6. Manual Migration Required

**Most cases do not require manual work!** ✨

The codemod automatically handles:

- ✅ Import changes and merges
- ✅ Component name change (Alert → Callout.Root)
- ✅ asChild → render prop conversion
- ✅ Automatic icon detection and Callout.Icon wrapping
- ✅ All props preservation

Manual review may only be needed for:

1. **Adding New Icons**: When you want to add an icon to an Alert that didn't have one before
2. **Special Icon Patterns**: Icons not automatically detected (e.g., component names not ending with "Icon")

---

## 7. Notes

### Design Tokens and Styling

The new Callout component is implemented with CSS-in-JS using Vanilla Extract.

**Key improvements:**

- Typography: `subtitle1` style applied
- Spacing: gap, padding, etc. standardized based on design tokens
- Border radius: Uses 300 token
- Color system: Systematic application of border, background, foreground colors for each color variant

### Color Mapping

All color options remain identical:

- `primary`: Blue tones
- `success`: Green tones
- `warning`: Yellow tones
- `danger`: Red tones
- `hint`: Gray tones
- `contrast`: Contrast color

### Default Values

- Old Alert: `color="primary"` (default)
- New Callout: `color="primary"` (default)

Defaults are identical, maintaining the same behavior without additional adjustments.

---
