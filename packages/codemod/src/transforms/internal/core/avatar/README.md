# Avatar Component Migration Guide

## Component: `Avatar` ➡️ `Avatar.Root` / `Avatar.Simple`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Avatar component from a single component to a composition structure for vapor-ui migration. Provides more granular control and improved accessibility.

---

## 1. Name Change

Changed from a single component to a composition structure.

- **Before:** `<Avatar>`
- **After:** `<Avatar.Root>` (or `<Avatar.Simple>` for simplified migration)

**Migration:**

- Basic: `Avatar` → `Avatar.Simple` (simplest migration)
- For fine control: Use `Avatar.Root`, `Avatar.Image`, `Avatar.Fallback` combination

---

## 2. Usage Change

### Basic Usage (Simple)

```javascript
// Before
<Avatar label="John Doe" size="md" square={false}>
  <Avatar.Image src="/avatar.jpg" alt="John Doe" />
</Avatar>

// After (Simple - simplest migration)
<Avatar.Simple alt="John Doe" src="/avatar.jpg" size="md" shape="circle" />

// After (Root - fine control)
<Avatar.Root alt="John Doe" src="/avatar.jpg" size="md" shape="circle">
  <Avatar.Image />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

### Without Image, Label Only

```javascript
// Before
<Avatar label="John Doe" size="lg" />

// After
<Avatar.Simple alt="John Doe" size="lg" />
```

---

## 3. Props Changes

| **Prop** | **Before**                     | **After**                                    | **Change Type**       | **Migration Method / Notes**                                                                                    |
| -------- | ------------------------------ | -------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `label`  | `string` (required)            | (name change)                                | **Name Change**       | Prop name changed from `label` to `alt` for clearer accessibility semantics.                                    |
| `alt`    | (none)                         | `string` (required)                          | **New Prop**          | Required accessibility text                                                                                     |
| `square` | `boolean` (default: `false`)   | (type/value change)                          | **Type/Value Change** | Changed from boolean to explicit value. `square={false}` → `shape="circle"`, `square={true}` → `shape="square"` |
| `shape`  | (none)                         | `'circle' \| 'square'` (default: `'square'`) | **New Prop**          | Shape of the avatar                                                                                             |
| `size`   | `'sm' \| 'md' \| 'lg' \| 'xl'` | (no change)                                  | **No Change**         |                                                                                                                 |
| `src`    | (passed to Image component)    | `string`                                     | **Position Change**   | Now can be passed directly to Root/Simple component                                                             |
| `render` | (none)                         | `ReactElement`                               | **New Prop**          | Replace HTML element with another tag or compose with other components                                          |
| `delay`  | (none)                         | `number`                                     | **New Prop**          | Set image loading delay time                                                                                    |

---

## 4. Sub-components

### Avatar.Image

Component for displaying an image.

```javascript
<Avatar.Root alt="John Doe" src="/avatar.jpg">
    <Avatar.Image />
    <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering
- `onLoadingStatusChange`: Loading status change callback

### Avatar.Fallback

Fallback content displayed when image loading fails.

```javascript
<Avatar.Root alt="John Doe">
    <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
2. **Component Name**: `Avatar` → `Avatar.Simple` (default strategy)
3. **Prop Changes**:
    - `label` → `alt`
    - `square={false}` → `shape="circle"`
    - `square={true}` → `shape="square"`
    - No `square` prop → `shape="circle"` (adjustment for default value change)
4. **Image Child Handling**: When `Avatar.Image` is a child, extract `src` prop and move it up

---

## 6. Manual Migration Required

Manual review may be needed for:

1. **Complex Custom children**: When complex custom content exists inside Avatar
2. **Dynamic square prop**: When `square` prop is an expression or variable
3. **Event Handlers**: Use `onLoadingStatusChange` prop of `Avatar.Image` for fine control of image loading state

---

## 7. Notes

### Based on Base UI

The new Avatar component is based on [@base-ui-components/react/avatar](https://base-ui.com/react/components/avatar).

**Key improvements:**

- Improved accessibility (clearer alt text)
- Better image loading state management
- Increased flexibility through composition pattern
- Clearer semantic structure

### Important Default Value Difference

- **Old**: `square={false}` (default - circle)
- **New**: `shape="square"` (default - square)

Therefore, when `square` prop was not specified before, must explicitly add `shape="circle"` during migration to maintain the same shape.
