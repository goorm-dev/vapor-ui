# TextInput Component Migration Guide

## Component: `TextInput` ➡️ `TextInput`

- **Overview:** Migrate the TextInput component for vapor-ui migration. The Compound pattern-based TextInput structure changes to a single component structure, transitioning to a simplified API based on Base UI.

---

## 1. Name Change

Changed from Compound pattern to single component.

- **Before:** `<TextInput>` (Compound pattern, Context-based)
- **After:** `<TextInput>` (Single component, Base UI-based)
- ⚠️**Note:** `TextInput.Field` → merged into `TextInput`
- ⚠️**Note:** `TextInput.Label` → use separate `Label` or `Field.Label`

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
import { TextInput } from '@goorm-dev/vapor-core';

<TextInput size="md" invalid={false}>
  <TextInput.Label>Label</TextInput.Label>
  <TextInput.Field placeholder="Enter text" />
</TextInput>

// After
import { Field, TextInput } from '@vapor-ui/core';

<Field.Root>
  <Field.Label>
    Name
    <TextInput
      invalid={false}
      size="md"
      placeholder="Enter text"
    />
  </Field.Label>
</Field.Root>
```

### Controlled Usage

```javascript
// Before
import TextInput from '@goorm-dev/vapor-core';

const [value, setValue] = useState('');

<TextInput value={value} onValueChange={setValue}>
  <TextInput.Label>Label</TextInput.Label>
  <TextInput.Field placeholder="Enter text" />
</TextInput>

// After
import { TextInput } from '@vapor-ui/core';

const [value, setValue] = useState('');

<TextInput
  value={value}
  onValueChange={setValue}
  placeholder="Enter text"
/>
```

### With Label

⚠️ **Note:** `TextInput.Label` has been removed. You must use the `Field` component.

```javascript
// Before
<TextInput size="md">
  <TextInput.Label>Name</TextInput.Label>
  <TextInput.Field placeholder="Enter your name" />
</TextInput>

// After
import { Field, TextInput } from '@vapor-ui/core';

<Field.Root>
  <Field.Label>
    Name
    <TextInput
      size="md"
      placeholder="Enter your name"
    />
  </Field.Label>
</Field.Root>
```

### Hidden Label Usage

```javascript
// Before
<TextInput aria-label="Search">
  <TextInput.Label visuallyHidden>Search</TextInput.Label>
  <TextInput.Field placeholder="Enter search term" />
</TextInput>

// After
<TextInput
  aria-label="Search"
  placeholder="Enter search term"
/>
```

---

## 3. Props Changes

### TextInput Props

| **Prop**        | **Before**                      | **After**                                | **Change Type**      | **Migration Method / Notes**                               |
| --------------- | ------------------------------- | ---------------------------------------- | -------------------- | ---------------------------------------------------------- |
| `invalid`       | `boolean`                       | `boolean`                                | **No Change**        | Validation failure state display                           |
| `disabled`      | `boolean`                       | `boolean`                                | **No Change**        | Set disabled state                                         |
| `type`          | `text` `email` `password` `url` | `text` `email` `password` `url` `search` | **search added**     | None                                                       |
| `value`         | (none)                          | `string`                                 | **Type restriction** | None                                                       |
| `defaultValue`  | `string`                        | `string`                                 | **No Change**        | Initial value for uncontrolled mode                        |
| `onValueChange` | `(value) => void`               | `(value, event) => void`                 | **Signature change** | Event added as second parameter                            |
| `placeholder`   | (on Field)                      | `string`                                 | **Moved**            | Moved from Field props to Root                             |
| `readOnly`      | (on Field)                      | `boolean`                                | **Moved**            | Moved from Field props to Root                             |
| `required`      | (on Field)                      | `boolean`                                | **Moved**            | Moved from Field props to Root                             |
| `maxLength`     | (on Field)                      | `number`                                 | **Moved**            | Moved from Field props to Root, integrates with InputGroup |
| `className`     | `string`                        | `string`                                 | **No Change**        | Custom style class                                         |

### Removed Sub-components

| **Sub-component** | **Before**             | **After** | **Migration Method**                           |
| ----------------- | ---------------------- | --------- | ---------------------------------------------- |
| `TextInput.Field` | Required sub-component | (removed) | Move all Field props to TextInput              |
| `TextInput.Label` | Optional sub-component | (removed) | Use separate `Label` component or `InputGroup` |

---

## 4. Component Structure

### Before

Used Compound pattern to share state via Context.

```javascript
<TextInput size="md" value={value} onValueChange={setValue}>
    <TextInput.Label>Label</TextInput.Label>
    <TextInput.Field placeholder="Enter text" />
</TextInput>
```

**Structure:**

- `TextInput`: Root component, Context Provider
- `TextInput.Label`: Label component
- `TextInput.Field`: Actual input element

### After

Integrated into a single component.

```javascript
<TextInput size="md" value={value} onValueChange={setValue} placeholder="Enter text" />
```

**Structure:**

- `TextInput`: Single component wrapping Base UI Input
- Add Label separately if needed

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes `TextInput` default import to `TextInput` named import
    - Automatically merges with existing `@vapor-ui/core` imports
    - Uses `migrateImportSpecifier` utility for safe import transformation

2. **Component Structure Conversion**:
    - Automatically converts Compound pattern to single component
    - Removes `<TextInput>` wrapper and converts `<TextInput.Field>` to `<TextInput>`
    - Moves TextInput root props to new TextInput
    - Merges TextInput.Field props to new TextInput

3. **Label Handling**:
    - Separates `TextInput.Label` into separate `<Label>` component if present
    - Converts Label to `aria-label` if `visuallyHidden` prop exists
    - Automatically extracts Label text
    - Automatically adds Label import

4. **Props Automatic Conversion**:
    - Preserves TextInput root props (size, invalid, disabled, value, onValueChange, etc.)
    - Moves TextInput.Field props (placeholder, readOnly, required, maxLength, etc.) to TextInput
    - Automatically preserves all other HTML input props

5. **RefForwarding Preservation**:
    - Moves ref passed to TextInput.Field to TextInput

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **Complex Label Structure**: If Label contains additional elements or complex styles

    ```javascript
    // Complex Labels need manual verification
    <Field.Root>
        <Field.Label>
            <Icon />
            Label <Badge>Required</Badge>
        </Field.Label>
        <TextInput placeholder="Enter" />
    </Field.Root>
    ```

2. **Field Extended Features**: Field provides additional features

    ```javascript
    import { Field, TextInput } from '@vapor-ui/core';

    <Field.Root>
        <Field.Label>Name</Field.Label>
        <TextInput placeholder="Enter name" />
        <Field.HelperText>Help text</Field.HelperText>
        <Field.ErrorText>Error message</Field.ErrorText>
    </Field.Root>;
    ```

3. **Custom Styling**: Custom styles applied to TextInput root div need to be moved to new TextInput or wrapper div

4. **Dynamic Component Composition**: Cases with dynamically added/removed sub-components need manual verification

---

## 7. Notes

### Base UI Transition

The new TextInput component is implemented based on **Base UI Input**.

**Key Changes:**

1. **Base Library**:
    - Before: Custom implementation (using Radix UI hooks)
    - After: `@base-ui-components/react/input`

2. **State Management**:
    - Before: State sharing via Context API
    - After: Using Base UI's `useControlled` hook

3. **Component Pattern**:
    - Before: Compound pattern (Root + Field + Label)
    - After: Single component

4. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Design token-based styling maintained

### InputGroup Integration

The new TextInput is designed to work with InputGroup:

```javascript
import { InputGroup, TextInput } from '@vapor-ui/core';

<InputGroup>
    <InputGroup.Label>Email</InputGroup.Label>
    <TextInput type="email" placeholder="email@example.com" />
</InputGroup>;
```

### Accessibility

Both versions provide excellent accessibility:

- Automatic connection between Label and Input (htmlFor / id)
- Automatic ARIA attribute application (aria-invalid, aria-label, etc.)
- Keyboard navigation support
- Screen reader compatibility
