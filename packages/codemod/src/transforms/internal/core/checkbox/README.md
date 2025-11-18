# Checkbox Component Migration Guide

## Component: `Checkbox` ➡️ `Checkbox.Root`

- **Version:** `v1.0.0`
- **Overview:** Migrate the Checkbox component from `@goorm-dev/vapor-core` to `@vapor-ui/core`. Maintains basic structure while providing enhanced accessibility and flexibility based on Base UI.

---

## 1. Key Changes

| Category        | Before (As-is)          | After (To-be)     | Notes                               |
| --------------- | ----------------------- | ----------------- | ----------------------------------- |
| Import path     | `@goorm-dev/vapor-core` | `@vapor-ui/core`  | Package change                      |
| Root component  | `<Checkbox>`            | `<Checkbox.Root>` | Compound Component pattern          |
| Label component | `<Checkbox.Label>`      | Removed           | Use standard HTML label recommended |
| Base library    | Radix UI                | Base UI           | Library change                      |

---

## 2. Usage Change

### Before (Old)

```typescript
import { Checkbox } from '@goorm-dev/vapor-core';

<Checkbox id="terms" size="md" invalid={false}>
  <Checkbox.Indicator />
  <Checkbox.Label>I agree to the terms</Checkbox.Label>
</Checkbox>
```

### After (New)

```typescript
import { Checkbox } from '@vapor-ui/core';

<div className="flex items-center gap-2">
  <Checkbox.Root id="terms" size="md" invalid={false}>
    <Checkbox.Indicator />
  </Checkbox.Root>
  <label htmlFor="terms">I agree to the terms</label>
</div>
```

**Key Changes:**

- `<Checkbox>` → `<Checkbox.Root>` change
- `<Checkbox.Label>` removed, use standard HTML `<label>` element
- Need container to wrap Label and Checkbox together

---

## 3. Props Changes

| **Prop**          | **Before**                                            | **After**                                  | **Change Type**      | **Migration Method / Notes**                               |
| ----------------- | ----------------------------------------------------- | ------------------------------------------ | -------------------- | ---------------------------------------------------------- |
| `invalid`         | `boolean` (default: `false`)                          | `boolean` (default: `false`)               | **No Change**        | Can use as-is                                              |
| `size`            | `'md' \| 'lg'` (default: `'md'`)                      | `'md' \| 'lg'` (default: `'md'`)           | **No Change**        | Can use as-is                                              |
| `checked`         | `boolean \| 'indeterminate'`                          | `boolean`                                  | **Type Change**      | For indeterminate state, use separate `indeterminate` prop |
| `indeterminate`   | (none)                                                | `boolean` (default: `false`)               | **New Prop**         | New prop to represent mixed state                          |
| `setChecked`      | `Dispatch<SetStateAction<CheckedState \| undefined>>` | (removed)                                  | **Removed**          | Use `onCheckedChange` callback                             |
| `onCheckedChange` | `(checked: CheckedState) => void`                     | `(checked: boolean, event: Event) => void` | **Signature Change** | Event object added as second parameter                     |
| `defaultChecked`  | `boolean` (default: `false`)                          | `boolean` (default: `false`)               | **New Prop**         | Initial check state for uncontrolled component             |
| `readOnly`        | (none)                                                | `boolean` (default: `false`)               | **New Prop**         | Prevent user from checking/unchecking                      |
| `required`        | `boolean` (default: `false`)                          | `boolean` (default: `false`)               | **New Prop**         | Whether check is required before form submission           |
| `inputRef`        | (none)                                                | `RefObject<HTMLInputElement>`              | **New Prop**         | Access to hidden input element                             |
| `render`          | (none)                                                | `ReactElement`                             | **New Prop**         | Replace HTML element with another tag                      |

---

## 4. Automated Migration (Codemod)

This component supports **automated migration**!

### Automatic Conversions:

- ✅ Import path change: `@goorm-dev/vapor-core` → `@vapor-ui/core`
- ✅ Component name: `<Checkbox>` → `<Checkbox.Root>`
- ✅ Checkbox.Indicator handling
- ✅ Checkbox.Label removal and TODO comment addition
- ✅ Import merge optimization

### Execution:

```bash
pnpm codemod internal/core/checkbox <filepath>
```

### Conversion Example:

**Before:**

```typescript
import { Checkbox } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Checkbox id="terms">
        <Checkbox.Indicator />
        <Checkbox.Label>Accept terms</Checkbox.Label>
    </Checkbox>
);
```

**After:**

```typescript
import { Checkbox } from '@vapor-ui/core';

export const Component = () => (
    <Checkbox.Root id="terms">
        <Checkbox.Indicator />
        {
            // TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute
        }
        Accept terms
    </Checkbox.Root>
);
```

---

## 5. Manual Work Required

### Checkbox.Label Migration

Manual modification is needed for TODO comments added after automatic conversion.

**Recommended Migration:**

```typescript
// Codemod result
<Checkbox.Root id="terms">
  <Checkbox.Indicator />
  {
    // TODO: Checkbox.Label removed - use standard HTML label element with htmlFor attribute
  }
  Accept terms
</Checkbox.Root>

// After manual modification
<div className="flex items-center gap-2">
  <Checkbox.Root id="terms">
    <Checkbox.Indicator />
  </Checkbox.Root>
  <label htmlFor="terms">Accept terms</label>
</div>
```

---

## 6. Additional Notes

### Base UI Checkbox Documentation

- [Base UI Checkbox API Documentation](https://base-ui.com/react/components/checkbox)
- Base UI's Checkbox follows WAI-ARIA 1.2 specification
- Keyboard navigation supported: Toggle with Space

### Indeterminate State Usage

```typescript
// Before: checked="indeterminate"
<Checkbox checked="indeterminate" />

// After: Use indeterminate prop
<Checkbox.Root indeterminate />
```

### Checkbox Group

Base UI provides Checkbox Group component separately. Useful when managing multiple checkboxes.

---

## 7. Migration Checklist

- [ ] Run codemod for automatic conversion
- [ ] Check and fix Checkbox.Label TODO comments
- [ ] Change `checked="indeterminate"` to indeterminate prop
- [ ] Check onCheckedChange callback signature (event parameter added)
- [ ] Change setChecked usage to onCheckedChange
- [ ] Run tests and verify functionality
- [ ] Test accessibility (keyboard, screen reader)
