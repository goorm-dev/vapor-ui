# Text Component Migration Guide

## Component: `Text` ➡️ `Text`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Text component for vapor-ui migration. The color system has been redesigned, typography options have been added, and custom element rendering method has been changed.

---

## 1. Name Change

The component name remains unchanged.

- **Before:** `Text`
- **After:** `Text`

---

## 2. Usage Change

Basic usage is similar, but the color system and custom element rendering method have changed.

```javascript
// Before
import { Text } from '@goorm-dev/vapor-core';

<Text
  typography="body1"
  color="text-primary"
  as="p"
>
  Hello
</Text>

// After
import { Text } from '@vapor-ui/core';

<Text
  typography="body1"
  foreground="primary-100"
  render={<p />}
>
  Hello
</Text>
```

---

## 3. Props Changes

| **Prop**     | **Before**                                  | **After**                               | **Change Type**  | **Migration Method / Notes**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------- | --------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`         | `E` (generic element type)                  | (removed)                               | **Removed**      | `as` prop has been removed and replaced with `render` prop. Change `as="p"` → `render={<p />}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `asChild`    | `boolean`                                   | (removed)                               | **Removed**      | **asChild pattern (Radix UI)**: Radix UI's **`asChild`** allows the parent component to pass props and behavior (ref, events, etc.) to a single child component for rendering, instead of rendering its own tag (e.g., button, div).<br>This eliminates nested DOM and makes it easy to compose with custom elements/libraries (e.g., Next.js Link, custom Button).<br>Example: `<Dialog.Trigger asChild> <a href="..." /></Dialog.Trigger>` // → `<a href="...">` (dialog trigger props merged)<br><br>**render props pattern (Base UI)**: Base UI recommends using a 'render' function prop |
| `color`      | `'text-primary' \| 'text-secondary' \| ...` | (removed)                               | **Removed**      | `color` prop has been removed and replaced with `foreground` prop. Use the new color system.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `foreground` | (none)                                      | `'primary-100' \| 'primary-200' \| ...` | **New Prop**     | New color system replacing the existing `color` prop. Uses 100/200 suffix to distinguish brightness levels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `typography` | `'heading1' \| ... \| 'body4'`              | `'display1' \| ... \| 'code2'`          | **Type Changed** | `display1`~`display4`, `code1`, `code2` options added. Most existing options remain.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `align`      | `'center' \| 'left' \| 'right'`             | (removed)                               | **Removed**      | `align` prop has been removed. Use CSS or `style` prop to control alignment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `render`     | (none)                                      | `ReactElement`                          | **New Prop**     | Same functionality as Radix UI's `asChild`. Replaces the existing `as` and `asChild` props. Can replace HTML element with another tag or compose with other components.                                                                                                                                                                                                                                                                                                                                                                                                                       |

### Color Mapping

| **Before (color)**           | **After (foreground)** |
| ---------------------------- | ---------------------- |
| `text-primary`               | `primary-100`          |
| `text-primary-alternative`   | `primary-200`          |
| `text-secondary`             | `secondary-100`        |
| `text-secondary-alternative` | `secondary-200`        |
| `text-success`               | `success-100`          |
| `text-success-alternative`   | `success-200`          |
| `text-warning`               | `warning-100`          |
| `text-warning-alternative`   | `warning-200`          |
| `text-danger`                | `danger-100`           |
| `text-danger-alternative`    | `danger-200`           |
| `text-hint`                  | `hint-100`             |
| `text-hint-alternative`      | `hint-200`             |
| `text-contrast`              | `contrast-100`         |
| `text-contrast-alternative`  | `contrast-200`         |

---

## 4. Sub-components

Text has no sub-components.

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes Text import as named import
    - Automatically merges with existing `@vapor-ui/core` imports

2. **Props Automatic Conversion**:
    - `color` → `foreground` (value mapping based on color mapping table)
    - `as` → `render` prop
    - `align` prop removed

3. **Prop Preservation**:
    - Other props like `typography`, `className`, HTML attributes are preserved

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **align prop**: Since the align prop is removed, use CSS or `style` prop to control text alignment.

    ```javascript
    // Before
    <Text align="center">Centered Text</Text>

    // After
    <Text style={{ textAlign: 'center' }}>Centered Text</Text>
    ```

2. **Unmapped color values**: If using `text-light`, `text-light-alternative`, `text-alternative`, `text-normal`, `text-exception`, manual mapping is needed.

---

## 7. Notes

### Design Tokens and Styling

The new Text component is implemented with CSS-in-JS using Vanilla Extract.

**Key Changes:**

- New color system: `foreground` prop with 100/200 brightness levels
- Typography options expanded: Added display1~display4, code1, code2
- Custom element rendering: `as` → `render` pattern change

### Typography Options

New typography options:

- `display1`, `display2`, `display3`, `display4`: Display text styles
- `code1`, `code2`: Code text styles
- Existing: `heading1`~`heading4`, `body1`~`body4` (maintained)

### Accessibility

The Text component maintains semantic HTML structure through the `render` prop, improving accessibility.
