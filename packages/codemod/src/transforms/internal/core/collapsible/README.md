# Collapsible Component Migration Guide

## Component: `Collapsible` ➡️ `Collapsible.Root`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Collapsible component for vapor-ui migration. The basic composition structure is maintained, but the root component name has changed, Content has been renamed to Panel, and the base library has changed from Radix UI to Base UI.

---

## 1. Name Change

The composition structure is maintained, but the root component and some sub-component names have changed.

- **Before:** `<Collapsible>`
- **After:** `<Collapsible.Root>`
- **Content → Panel:** `<Collapsible.Content>` changed to `<Collapsible.Panel>`

**Migration:**

- Change `Collapsible` → `Collapsible.Root`
- `Collapsible.Trigger` remains as-is
- Change `Collapsible.Content` → `Collapsible.Panel`

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
<Collapsible>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Content</Collapsible.Content>
</Collapsible>

// After
<Collapsible.Root>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Panel>Content</Collapsible.Panel>
</Collapsible.Root>
```

### Controlled Usage

```javascript
// Before
const [open, setOpen] = React.useState(false);

<Collapsible open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Content</Collapsible.Content>
</Collapsible>

// After
const [open, setOpen] = React.useState(false);

<Collapsible.Root open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Panel>Content</Collapsible.Panel>
</Collapsible.Root>
```

### asChild → render prop Conversion

```javascript
// Before
<Collapsible asChild>
  <div className="wrapper">
    <Collapsible.Trigger asChild>
      <button>Toggle</button>
    </Collapsible.Trigger>
    <Collapsible.Content asChild>
      <section>Content</section>
    </Collapsible.Content>
  </div>
</Collapsible>

// After
<Collapsible.Root render={<div className="wrapper" />}>
  <Collapsible.Trigger render={<button />}>Toggle</Collapsible.Trigger>
  <Collapsible.Panel render={<section />}>Content</Collapsible.Panel>
</Collapsible.Root>
```

---

## 3. Props Changes

| **Prop**       | **Before**                | **After**                 | **Change Type** | **Migration Method / Notes**                   |
| -------------- | ------------------------- | ------------------------- | --------------- | ---------------------------------------------- |
| `open`         | `boolean`                 | `boolean`                 | **No Change**   | Controls open/close state as controlled state. |
| `defaultOpen`  | `boolean`                 | `boolean`                 | **No Change**   | Sets initial open state.                       |
| `onOpenChange` | `(open: boolean) => void` | `(open: boolean) => void` | **No Change**   | State change callback.                         |
| `disabled`     | `boolean`                 | `boolean`                 | **No Change**   | Disables Trigger.                              |
| `asChild`      | `boolean`                 | (removed)                 | **Removed**     | Replaced with `render` prop.                   |
| `render`       | (none)                    | `ReactElement`            | **New Prop**    | Specifies custom element to render.            |
| `className`    | `string`                  | `string`                  | **No Change**   | Adds custom style class.                       |

---

## 4. Sub-components

### Collapsible.Root

Root container of Collapsible.

```javascript
<Collapsible.Root open={open} onOpenChange={setOpen} disabled={false}>
    {/* Collapsible content */}
</Collapsible.Root>
```

**Props:**

- `open`: Open/close state (controlled)
- `defaultOpen`: Initial open state (uncontrolled)
- `onOpenChange`: State change callback
- `disabled`: Disable Trigger
- `render`: Custom rendering
- `className`: Custom style class
- All other HTML div attributes

### Collapsible.Trigger

Trigger button that opens and closes Collapsible.

```javascript
<Collapsible.Trigger disabled={false}>Toggle</Collapsible.Trigger>
```

**Props:**

- `disabled`: Disable trigger
- `render`: Custom rendering
- `className`: Custom style class
- All other HTML button attributes

### Collapsible.Panel

Collapsible content area that can be collapsed.

```javascript
<Collapsible.Panel keepMounted>{/* Panel content */}</Collapsible.Panel>
```

**Props:**

- `keepMounted`: Whether to keep in DOM when closed
- `render`: Custom rendering
- `className`: Custom style class
- All other HTML div attributes

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes Collapsible import to Collapsible (named import)
    - Automatically merges with existing `@vapor-ui/core` imports

2. **Component Name**: `Collapsible` → `Collapsible.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Sub-component Changes**:
    - `Collapsible.Trigger` remains as-is
    - `Collapsible.Content` → `Collapsible.Panel` automatically changed

4. **asChild → render prop automatic conversion** ✨
    - Automatically converts `asChild` prop to `render` prop
    - Extracts first child JSX element as render prop (self-closing form)
    - Preserves child element props in render prop
    - Moves child element's inner content to Collapsible.Root's children

5. **Prop Preservation**:
    - All props (open, onOpenChange, disabled, className, data-\*, etc.) preserved
    - defaultOpen, keepMounted, etc. all automatically maintained

6. **Alias Handling**:
    - Also handles import aliases (e.g., `import { Collapsible as CoreCollapsible }`)

---

## 6. Manual Migration Required

The codemod handles most work automatically, so additional manual work is rarely needed.

---

## 7. Notes

### Base Library Change

- **Before:** Radix UI (`@radix-ui/react-collapsible`)
- **After:** Base UI (`@base-ui-components/react`)

**Key Changes:**

- Content → Panel name change
- asChild → render prop pattern change
- Basic behavior and API mostly remain the same
