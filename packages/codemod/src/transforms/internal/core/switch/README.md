# Switch Component Migration Guide

## Component: `Switch` ➡️ `Switch.Root`

- **Version:** v0.32.0
- **Overview:** Migrate the Switch component for vapor-ui migration. The structure based on Radix UI Context API changes to a Base UI-based structure. The Compound Pattern is maintained, but Switch.Indicator changes to Switch.Thumb, and when Label exists, it's automatically wrapped with Field component.

---

## 1. Name Change

The component changed from Switch to Switch.Root, with some sub-component names changed.

- **Before:** `<Switch>` (Radix UI based, Context Provider)
- **After:** `<Switch.Root>` (Base UI based)
- ⚠️**Note:** `Switch.Indicator` → `Switch.Thumb`
- ⚠️**Note:** `Switch.Label` → `Field.Label` (structure wrapping Switch.Root)
- ⚠️**Note:** When Label exists, automatically wrapped with Field.Root

---

## 2. Usage Change

### Basic Usage (With Label)

```typescript
// Before
import Switch from '@goorm-dev/vapor-core';

<Switch size="md" checked={checked} onCheckedChange={setChecked}>
  <Switch.Label>Enable notifications</Switch.Label>
  <Switch.Indicator />
</Switch>

// After
import { Switch, Field } from '@vapor-ui/core';

<Field.Root>
  <Field.Label>
    Enable notifications
    <Switch.Root size="md" checked={checked} onCheckedChange={setChecked}>
      <Switch.Thumb />
    </Switch.Root>
  </Field.Label>
</Field.Root>
```

### Without Label

```typescript
// Before
import Switch from '@goorm-dev/vapor-core';

<Switch size="lg" checked={checked} onCheckedChange={setChecked}>
  <Switch.Indicator />
</Switch>

// After
import { Switch } from '@vapor-ui/core';

<Switch.Root size="lg" checked={checked} onCheckedChange={setChecked}>
  <Switch.Thumb />
</Switch.Root>
```

---

## 3. Props Changes

### Switch.Root Props (Former Switch)

| **Prop**          | **Before**                               | **After**                                  | **Change Type**  | **Migration Method / Notes**                |
| ----------------- | ---------------------------------------- | ------------------------------------------ | ---------------- | ------------------------------------------- |
| `size`            | `'sm' \| 'md' \| 'lg'` (default: `'md'`) | `'sm' \| 'md' \| 'lg'` (default: `'md'`)   | **No Change**    | Switch size                                 |
| `checked`         | `boolean`                                | `boolean`                                  | **No Change**    | Current state in controlled mode            |
| `defaultChecked`  | `boolean`                                | `boolean`                                  | **No Change**    | Initial state in uncontrolled mode          |
| `onCheckedChange` | `(checked: boolean) => void`             | `(checked: boolean, event: Event) => void` | **Type Changed** | State change handler, event parameter added |
| `disabled`        | `boolean`                                | `boolean`                                  | **No Change**    | Disable switch                              |
| `readOnly`        | (none)                                   | `boolean`                                  | **New Prop**     | Read-only mode                              |
| `required`        | (none)                                   | `boolean`                                  | **New Prop**     | Required input field                        |
| `name`            | (none)                                   | `string`                                   | **New Prop**     | Name used in form submission                |
| `value`           | (none)                                   | `string`                                   | **New Prop**     | Value used in form submission               |
| `className`       | `string`                                 | `string \| (state: State) => string`       | **Improved**     | State-based styling support                 |

### Switch.Thumb Props (Former Switch.Indicator)

| **Prop**    | **Before**        | **After**                            | **Change Type** | **Migration Method / Notes** |
| ----------- | ----------------- | ------------------------------------ | --------------- | ---------------------------- |
| All props   | HTML button props | HTML span props                      | **Changed**     | All props passed through     |
| `className` | `string`          | `string \| (state: State) => string` | **Improved**    | State-based styling support  |

### Switch.Label → Field.Label

| **Prop**    | **Before**                   | **After**                         | **Change Type** | **Migration Method / Notes**                      |
| ----------- | ---------------------------- | --------------------------------- | --------------- | ------------------------------------------------- |
| Label props | All props of Label component | Basic HTML props of label element | **Changed**     | `Field.Label` uses basic HTML label element props |

---

## 4. Sub-components

### Switch.Root

Root container of Switch. Based on Base UI's Switch.Root.

```typescript
<Switch.Root
  size="md"
  checked={checked}
  onCheckedChange={setChecked}
>
  <Switch.Thumb />
</Switch.Root>
```

**Props:**

- `size`: Switch size ('sm' | 'md' | 'lg')
- `checked`, `onCheckedChange`, `defaultChecked`: State control props
- `disabled`: Disable switch (boolean)
- `readOnly`, `required`, `name`, `value`: Additional form props

### Switch.Thumb

**Name changed**: Former Switch.Indicator changed to Switch.Thumb. The toggle element of Switch.

```typescript
<Switch.Thumb />
```

**Props:**

- Basic props of HTML span element
- `className`: Custom style class (state-based styling support)

### Field.Label

**New component**: Wrapper that wraps Switch and label text together.

```typescript
<Field.Label>
  Enable notifications
  <Switch.Root checked={checked} onCheckedChange={setChecked}>
    <Switch.Thumb />
  </Switch.Root>
</Field.Label>
```

**Props:**

- Basic HTML props of label element

### Field.Root

**New component**: Root container for form field. Used to wrap Switch with Label.

```typescript
<Field.Root>
  <Field.Label>
    Enable notifications
    <Switch.Root checked={checked} onCheckedChange={setChecked}>
      <Switch.Thumb />
    </Switch.Root>
  </Field.Label>
</Field.Root>
```

### Switch.Label (Removed)

The previous version's Switch.Label has been removed. Use `Field.Label` if label is needed.

### Switch.Indicator (Removed)

The previous version's Switch.Indicator has been changed to Switch.Thumb.

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes `Switch` default import to `{ Switch }` named import
    - Automatically adds `Field` import when Label exists
    - Automatically merges with existing `@vapor-ui/core` imports
    - Removes duplicate imports
    - Uses `migrateAndRenameImport` utility for safe import transformation

2. **Component Name**: `Switch` → `Switch.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Sub-component Conversion**:
    - `Switch.Indicator` → `Switch.Thumb`
    - `Switch.Label` → `Field.Label` (wrap Switch.Root)

4. **Props Automatic Conversion**:
    - Merge all props from Switch and Switch.Indicator
    - Preserve props order

5. **Field Wrapping Automation** (When Label exists):
    - Automatically generate Field.Root
    - Automatically generate Field.Label
    - Extract and place label text
    - Place Switch.Root inside Field.Label

6. **Various Case Handling**:
    - Controlled/Uncontrolled components
    - Props using spread operator
    - Named import method
    - Used with other components
    - Multiple Switch instances

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **Complex Label Structure**: If Label contains complex JSX, structure may need review.

2. **Custom Styling**: If using state-based className, may need to change to function form.

---

## 7. Notes

### Base UI Transition (Radix UI → Base UI)

The new Switch component has transitioned from **Radix UI Switch** to **Base UI Switch**.

**Key Changes:**

1. **Base Library**:
    - Before: `@radix-ui/react-switch`
    - After: `@base-ui-components/react`'s Switch

2. **Component Pattern**:
    - Both use Compound Component pattern
    - Changed from Context API based to Base UI based

3. **Sub-component Names**:
    - **Radix UI**: Switch.Root (none, Context Provider), Switch.Thumb (Indicator role)
    - **Base UI**: Switch.Root, Switch.Thumb

4. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Design token-based styling maintained

### Field Component

- **Field.Root**: Root container for form field
- **Field.Label**: Label wrapper (includes label text and input together)
- Used with Switch to improve accessibility and UX

### Accessibility

Both libraries provide excellent accessibility:

- `role="switch"` automatically set
- Toggle with Space/Enter key
- Automatic focus management
- `aria-checked` automatically set
- Keyboard navigation support

---
