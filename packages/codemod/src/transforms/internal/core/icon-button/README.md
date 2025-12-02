# IconButton Component Migration Guide

## Component: `IconButton`

- **Overview:** Migrate the IconButton component prop interface for vapor-ui migration. The `rounded` prop is changed to `shape` prop, the `invisible` value in `shape` is changed to `ghost`, and deprecated props are removed.

---

## 1. Name Change

The component name remains unchanged.

- **Before:** `IconButton`
- **After:** `IconButton`

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
import { IconButton } from '@goorm-dev/vapor-core';
import { HeartIcon } from '@goorm-dev/vapor-icons';

<IconButton aria-label="heart">
  <HeartIcon />
</IconButton>

// After
import { IconButton } from '@vapor-ui/core';
import { HeartIcon } from '@vapor-ui/icons';

<IconButton aria-label="heart">
  <HeartIcon />
</IconButton>
```

### rounded prop → shape prop

The rounded prop has been changed to the shape prop.

```javascript
// Before
<IconButton rounded aria-label="heart">
  <HeartIcon />
</IconButton>
<IconButton rounded={false} aria-label="heart">
  <HeartIcon />
</IconButton>

// After
<IconButton shape="circle" aria-label="heart">
  <HeartIcon />
</IconButton>
<IconButton shape="square" aria-label="heart">
  <HeartIcon />
</IconButton>
```

### shape Value Change: invisible → ghost

```javascript
// Before
<IconButton shape="invisible" aria-label="heart">
  <HeartIcon />
</IconButton>

// After
<IconButton variant="ghost" aria-label="heart">
  <HeartIcon />
</IconButton>
```

### Deprecated props Removal

icon and iconClassName props have been removed.

```javascript
// Before
<IconButton icon={HeartIcon} iconClassName="custom-icon" aria-label="heart" />

// After
<IconButton aria-label="heart">
  <HeartIcon className="custom-icon" />
</IconButton>
```

---

## 3. Props Changes

| **Prop**        | **Before**                   | **After**                | **Change Type**          | **Migration Method / Notes**                                                                |
| --------------- | ---------------------------- | ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------- |
| `rounded`       | `boolean`                    | (removed)                | **Removed**              | Use `shape` prop. `rounded={true}` → `shape="circle"`, `rounded={false}` → `shape="square"` |
| `shape`         | `fill` `outline` `invisible` | prop deleted             | prop deleted             | Replaced with variant                                                                       |
| `variant`       | (none)                       | `fill` `outline` `ghost` | **New Prop**             | Replaces shape                                                                              |
| `shape` (new)   | (none)                       | `square` `circle`        | **New Prop**             | New shape prop                                                                              |
| `icon`          | `IconType`                   | (removed)                | **Removed (deprecated)** | Use children.                                                                               |
| `iconClassName` | `string`                     | (removed)                | **Removed (deprecated)** | Pass className directly to icon component.                                                  |
| `aria-label`    | `string` (recommended)       | `string` (required)      | **Changed to Required**  | Became required prop for accessibility.                                                     |
| `render`        | (none)                       | `ReactElement`           | **New Prop**             | Replace HTML element with another tag or compose with other components.                     |

---

## 4. Sub-components

IconButton has no sub-components.

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes IconButton import as named import
    - Automatically merges with existing `@vapor-ui/core` imports

2. **rounded prop automatic conversion** ✨
    - Automatically converts `rounded` → `shape` prop
    - Automatic mapping based on value:
        - `rounded` (no value) → `shape="circle"`
        - `rounded={true}` → `shape="circle"`
        - `rounded={false}` → `shape="square"`
        - `rounded={expression}` → `shape={expression ? "circle" : "square"}`

3. **shape prop → variant prop automatic conversion** ✨
    - Renames `shape` prop to `variant`
    - Automatically converts `invisible` value to `ghost`

4. **Deprecated props automatic removal** ⚠️
    - Automatically removes `icon`, `iconClassName` props and outputs warning message

5. **Prop Preservation**:
    - Other props like `size`, `color`, `disabled`, `aria-label` remain as-is
    - HTML attributes like `className`, `data-*` are preserved

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work is needed for:

1. **Using icon prop**: Since icon prop is removed, need to manually change to children

    ```javascript
    // After codemod conversion (icon prop removed)
    <IconButton aria-label="heart" />

    // Manual migration
    <IconButton aria-label="heart">
      <HeartIcon />
    </IconButton>
    ```

2. **Using iconClassName**: Pass className directly to icon component

    ```javascript
    // After codemod conversion (iconClassName removed)
    <IconButton aria-label="heart">
      <HeartIcon />
    </IconButton>

    // Manual migration
    <IconButton aria-label="heart">
      <HeartIcon className="custom-icon" />
    </IconButton>
    ```

3. **Using hint color**: Since hint color is removed, change to another color

    ```javascript
    // After codemod conversion (warning message output)
    <IconButton color="hint" aria-label="heart">
      <HeartIcon />
    </IconButton>
    // Console warning: [IconButton] 'hint' color is not supported. Consider using 'secondary'.

    // Manual migration
    <IconButton color="secondary" aria-label="heart">
      <HeartIcon />
    </IconButton>
    ```

---

## 7. Notes

### Design Tokens and Styling

The new IconButton component is implemented with CSS-in-JS using Vanilla Extract.

**Key Changes:**

- Prop name unification: `shape` → `variant`, `rounded` → `shape`
- Value consistency: `invisible` → `ghost` (consistency with other components)
- Styles maintained based on design tokens

### aria-label Requirement

Since IconButton is visually a button without text, aria-label has become required for screen reader users.

### Deprecated props Removal Reason

- `icon` prop: children pattern is more React-like API
- `iconClassName`: Passing className directly to icon is clearer
