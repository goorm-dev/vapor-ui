# RadioGroup Component Migration Guide

## Component: `RadioGroup` ➡️ `RadioGroup.Root` + `Radio`

- **Version:** v0.32.0
- **Overview:** Migrate the RadioGroup component for vapor-ui migration. The RadioGroup structure based on Radix UI changes to a RadioGroup + Radio structure based on Base UI, with simplified Compound Pattern and Radio separated as an independent component. When Label exists, automatically wrapped with Field component.

**Before:** `<RadioGroup>` (Radix UI based)
**After:** `<RadioGroup.Root>` + `<Radio.Root>` (Base UI based)

- ⚠️**Note:** `RadioGroup.Item` removed, children placed directly under RadioGroup.Root
- ⚠️**Note:** `RadioGroup.Indicator` → `Radio.Root` (separate component)
- ⚠️**Note:** `RadioGroup.Label` → `Field.Label` (structure wrapping Radio.Root)
- ⚠️**Note:** Value type changed from `string | number` to `string`

---

## 1. Name Change

The entire component structure changed from RadioGroup to RadioGroup.Root + Radio.Root.

---

## 2. Usage Change

### Basic Usage (With Label)

```typescript
// Before
import RadioGroup from '@goorm-dev/vapor-core';

<RadioGroup
  size="md"
  direction="vertical"
  selectedValue={value}
  onSelectedValueChange={setValue}
>
  <RadioGroup.Item>
    <RadioGroup.Indicator value="option1" />
    <RadioGroup.Label>Option 1</RadioGroup.Label>
  </RadioGroup.Item>
  <RadioGroup.Item>
    <RadioGroup.Indicator value="option2" />
    <RadioGroup.Label>Option 2</RadioGroup.Label>
  </RadioGroup.Item>
</RadioGroup>

// After
import { RadioGroup, Radio, Field } from '@vapor-ui/core';

<RadioGroup.Root
  size="md"
  orientation="vertical"
  value={value}
  onValueChange={setValue}
>
  <Field.Label>
    <Radio.Root value="option1" />
    Option 1
  </Field.Label>
  <Field.Label>
    <Radio.Root value="option2" />
    Option 2
  </Field.Label>
</RadioGroup.Root>
```

### Without Label

```typescript
// Before
import RadioGroup from '@goorm-dev/vapor-core';

<RadioGroup selectedValue={value} onSelectedValueChange={setValue}>
  <RadioGroup.Item>
    <RadioGroup.Indicator value="1" />
  </RadioGroup.Item>
  <RadioGroup.Item>
    <RadioGroup.Indicator value="2" />
  </RadioGroup.Item>
</RadioGroup>

// After
import { RadioGroup, Radio } from '@vapor-ui/core';

<RadioGroup.Root value={value} onValueChange={setValue}>
  <Radio.Root value="1" />
  <Radio.Root value="2" />
</RadioGroup.Root>
```

---

## 3. Props Changes

### RadioGroup.Root Props (Former RadioGroup)

| **Prop**                | **Before**                               | **After**                                            | **Change Type**   | **Migration Method / Notes**                    |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------- | ----------------- | ----------------------------------------------- |
| `selectedValue`         | `string \| number`                       | (renamed)                                            | **Renamed**       | Changed to `value`, type only supports `string` |
| `value`                 | (none)                                   | `string`                                             | **New Prop**      | Current selected value in controlled mode       |
| `defaultSelectedValue`  | `string \| number`                       | (renamed)                                            | **Renamed**       | Changed to `defaultValue`                       |
| `defaultValue`          | (none)                                   | `string`                                             | **New Prop**      | Initial selected value in uncontrolled mode     |
| `onSelectedValueChange` | `(value: string \| number) => void`      | (renamed)                                            | **Renamed**       | Changed to `onValueChange`                      |
| `onValueChange`         | (none)                                   | `(value: string, event: Event) => void`              | **New Prop**      | Value change handler                            |
| `direction`             | `'vertical' \| 'horizontal'`             | (renamed)                                            | **Renamed**       | Changed to `orientation`                        |
| `orientation`           | (none)                                   | `'vertical' \| 'horizontal'` (default: `'vertical'`) | **New Prop**      | Layout direction                                |
| `size`                  | `'sm' \| 'md' \| 'lg'` (default: `'md'`) | `'md' \| 'lg'` (default: `'md'`)                     | **Value Changed** | `'sm'` option removed, change to `'md'`         |
| `invalid`               | `boolean` (default: `false`)             | `boolean`                                            | **No Change**     | Validation state                                |
| `disabled`              | (none)                                   | `boolean`                                            | **New Prop**      | Disable all radios                              |
| `readOnly`              | (none)                                   | `boolean`                                            | **New Prop**      | Read-only mode                                  |
| `required`              | (none)                                   | `boolean`                                            | **New Prop**      | Required input field                            |

### Radio.Root Props (Former RadioGroup.Indicator)

| **Prop**    | **Before**                    | **After**                            | **Change Type**      | **Migration Method / Notes**                                              |
| ----------- | ----------------------------- | ------------------------------------ | -------------------- | ------------------------------------------------------------------------- |
| `value`     | `string \| number` (required) | `string` (required)                  | **Type Changed**     | Value, `number` needs conversion to `string`                              |
| `disabled`  | (Item's prop)                 | `boolean`                            | **Position Changed** | Moved from previous `RadioGroup.Item`'s `disabled` to `Radio.Root`        |
| `invalid`   | (none)                        | `boolean`                            | **New Prop**         | Individual radio validation state (can inherit from RadioGroup)           |
| `size`      | (none)                        | `'md' \| 'lg'`                       | **New Prop**         | Individual radio size (inherits from RadioGroup, can be set individually) |
| `className` | `string`                      | `string \| (state: State) => string` | **Improved**         | State-based styling support                                               |

### RadioGroup.Item (Removed)

| **Prop**    | **Before** | **After** | **Change Type** | **Migration Method / Notes**                             |
| ----------- | ---------- | --------- | --------------- | -------------------------------------------------------- |
| `disabled`  | `boolean`  | (removed) | **Removed**     | Moved to `Radio.Root`'s `disabled` prop                  |
| `className` | `string`   | (removed) | **Removed**     | Moved to `Field.Label`'s `className` (when Label exists) |

### RadioGroup.Label → Field.Label

| **Prop**    | **Before**                   | **After**                         | **Change Type** | **Migration Method / Notes**                      |
| ----------- | ---------------------------- | --------------------------------- | --------------- | ------------------------------------------------- |
| Label props | All props of Label component | Basic HTML props of label element | **Changed**     | `Field.Label` uses basic HTML label element props |

---

## 4. Sub-components

### RadioGroup.Root

Root container of RadioGroup. Provides state management and Context.

```typescript
<RadioGroup.Root
  size="md"
  orientation="vertical"
  value={value}
  onValueChange={setValue}
>
  {/* Radio items */}
</RadioGroup.Root>
```

**Props:**

- `size`: Radio size ('md' | 'lg')
- `orientation`: Layout direction ('vertical' | 'horizontal')
- `value`, `onValueChange`, `defaultValue`: State control props
- `invalid`: Validation state (boolean)
- `disabled`: Disable all radios (boolean)
- `readOnly`, `required`: Additional states

### Radio.Root

**New separate component**: Individual radio button. Based on Base UI's Radio.Root.

```typescript
<Radio.Root value="option1" disabled={false} />
```

**Props:**

- `value`: Radio value (string, required)
- `disabled`: Disable individual radio (boolean)
- `invalid`: Individual radio validation state (boolean)
- `size`: Individual radio size ('md' | 'lg')
- `className`: Custom style class

### Radio.Indicator

Radio's selection indicator element (typically included automatically).

```typescript
<Radio.Root value="option1">
  <Radio.Indicator />
</Radio.Root>
```

### Field.Label

**New component**: Wrapper that wraps Radio and label text together.

```typescript
<Field.Label>
  <Radio.Root value="option1" />
  Option 1
</Field.Label>
```

**Props:**

- Basic HTML props of label element

### RadioGroup.Item (Removed)

The previous version's RadioGroup.Item has been removed. Place Indicator and Label directly under RadioGroup.Root or wrap with Field.Label.

### RadioGroup.Label (Removed)

The previous version's RadioGroup.Label has been removed. Use `Field.Label` if label is needed.

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes `RadioGroup` default import to `{ RadioGroup, Radio }` named import
    - Automatically adds `Field` import when Label exists
    - Automatically merges with existing `@vapor-ui/core` imports
    - Removes duplicate imports
    - Uses `migrateAndRenameImport` utility for safe import transformation

2. **Component Name**: `RadioGroup` → `RadioGroup.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Props Automatic Conversion**:
    - `selectedValue` → `value`
    - `defaultSelectedValue` → `defaultValue`
    - `onSelectedValueChange` → `onValueChange`
    - `direction` → `orientation`
    - `size="sm"` → `size="md"` (sm removed)

4. **Structure Conversion**:
    - Remove `RadioGroup.Item` and hoist children
    - `RadioGroup.Indicator` → `Radio.Root`
    - `RadioGroup.Label` → `Field.Label` (wrap Radio.Root)
    - Automatically transfer Item's `disabled` prop to Radio.Root
    - Automatically preserve and move Item's attributes (key, className, etc.)

5. **Field Wrapping Automation** (When Label exists):
    - Automatically extract label text
    - Wrap Radio.Root and text together with Field.Label
    - Automatically adjust label order (Radio.Root placed before text)

6. **Props Preservation**:
    - All other props (className, data-_, aria-_, etc.) automatically preserved
    - Handle props using spread operator

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **Number Type Values**: If you previously used number as `value`, convert to string.

```typescript
// Before
<RadioGroup.Indicator value={1} />

// After (not automatically converted)
<Radio.Root value="1" />
```

2. **size="sm" Usage**: Since sm size was removed, change to md or customize with CSS.

3. **Complex Label Structure**: If Label contains complex JSX, structure may need review.

---

## 7. Notes

### Base UI Transition (Radix UI → Base UI)

The new RadioGroup component has transitioned from **Radix UI RadioGroup** to **Base UI RadioGroup + Radio**.

**Key Changes:**

1. **Base Library**:
    - Before: `@radix-ui/react-radio-group`
    - After: `@base-ui-components/react`'s RadioGroup + Radio

2. **Component Structure**:
    - **Radix UI**: RadioGroup.Root + RadioGroup.Item + RadioGroup.Indicator (integrated structure)
    - **Base UI**: RadioGroup.Root + Radio.Root (separated structure)

3. **Context Usage**:
    - Both use Context API, but Base UI separates RadioGroup and Radio for more flexibility

4. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Design token-based styling maintained

### Field Component

- **Field.Root**: Root container for form field
- **Field.Label**: Label wrapper (includes label text and input together)
- Used with RadioGroup to improve accessibility and UX

### RadioGroup vs Radio

- **RadioGroup**: Container to group multiple radios and manage state
- **Radio**: Individual radio button (can be used independently)
- Both are Base UI components but separated for more flexible use

### Accessibility

Both libraries provide excellent accessibility:

- `role="radiogroup"` automatically set
- Arrow key navigation provided by default
- Select with Space key
- Automatic focus management
- `aria-checked` automatically set
