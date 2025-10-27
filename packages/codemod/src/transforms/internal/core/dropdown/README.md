# **Component:** `Dropdown` ➡️ `Menu`

## Overview

This transformer automates the migration of the Dropdown component from `@goorm-dev/vapor-core` to the new Menu component in `@vapor-ui/core`. This migration represents a significant architectural shift from **Radix UI** to **Base UI**, with changes to component naming, props placement, and internal structure.

### Key Changes Summary

| Aspect                | Before (`@goorm-dev/vapor-core`) | After (`@vapor-ui/core`)         |
| --------------------- | -------------------------------- | -------------------------------- |
| **Base Library**      | Radix UI Dropdown Menu           | Base UI Menu                     |
| **Root Component**    | `<Dropdown>`                     | `<Menu.Root>`                    |
| **Import Style**      | Default import                   | Named import: `{ Menu }`         |
| **Positioning Props** | On root (`side`, `align`)        | On Content via `positionerProps` |
| **Portal Prop**       | `forceMount`                     | `keepMounted`                    |
| **Max Height**        | `maxHeight` prop                 | `style={{ maxHeight }}`          |
| **Divider**           | `Dropdown.Divider`               | `Menu.Separator`                 |
| **Submenu**           | `Dropdown.Sub*`                  | `Menu.Submenu*`                  |
| **Composition**       | `asChild` prop                   | `render` prop                    |

### What This Transformer Does

This transformer automatically handles:

- ✅ Import statement migration with smart merging
- ✅ Component and subcomponent renaming
- ✅ Props repositioning and conversion
- ✅ Portal prop renaming (`forceMount` → `keepMounted`)
- ✅ `asChild` to `render` prop conversion
- ✅ Style prop merging for `maxHeight`
- ⚠️ Removes `closeOnClick` with warning (Base UI always closes on click)

### Coverage

**Test Coverage**: 100% Statements, 90% Branch, 100% Functions, 100% Lines
**Test Cases**: 19 comprehensive test cases covering all transformation scenarios

---

## 1. Name Change

The overall component has been renamed from Dropdown to Menu, and the composition structure has been modified.

- **Before:** `<Dropdown>` (Radix UI-based)
- **After:** `<Menu.Root>` (Base UI-based)
- ⚠️**Caution:** `Dropdown.Contents` / `Dropdown.CombinedContent` → Changed to `Menu.Content`
- ⚠️**Caution:** `Dropdown.Divider` → Changed to `Menu.Separator`
- ⚠️**Caution:** `Dropdown.Sub` → Changed to `Menu.SubmenuRoot`
- ⚠️**Caution:** `Dropdown.SubTrigger` → Changed to `Menu.SubmenuTriggerItem`
- ⚠️**Caution:** `Dropdown.SubContent` → Changed to `Menu.Content` (within SubmenuRoot)
- ⚠️**Caution:** `Dropdown.SubContents` / `Dropdown.SubCombinedContent` → Changed to `Menu.SubmenuContent`

---

## 2. Usage Change

### Basic Usage

```jsx
// Before
import { Dropdown } from '@goorm-dev/vapor-core';
// After
import { Menu } from '@vapor-ui/core';

<Dropdown side="bottom" align="start" modal={true}>
    <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
    <Dropdown.Portal>
        <Dropdown.Content>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Item 3</Dropdown.Item>
        </Dropdown.Content>
    </Dropdown.Portal>
</Dropdown>;

<Menu.Root modal={true}>
    <Menu.Trigger>Open Menu</Menu.Trigger>
    <Menu.Content positionerProps={{ side: 'bottom', align: 'start' }}>
        <Menu.Item>Item 1</Menu.Item>
        <Menu.Item>Item 2</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Item 3</Menu.Item>
    </Menu.Content>
</Menu.Root>;
```

### With Group

```jsx
// Before
<Dropdown>
  <Dropdown.Trigger>Open</Dropdown.Trigger>
  <Dropdown.Portal>
    <Dropdown.Content>
      <Dropdown.Group>
        <Dropdown.Item>Item A</Dropdown.Item>
        <Dropdown.Item>Item B</Dropdown.Item>
      </Dropdown.Group>
      <Dropdown.Divider />
      <Dropdown.Group>
        <Dropdown.Item>Item C</Dropdown.Item>
      </Dropdown.Group>
    </Dropdown.Content>
  </Dropdown.Portal>
</Dropdown>

// After
<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Content>
    <Menu.Group>
      <Menu.Item>Item A</Menu.Item>
      <Menu.Item>Item B</Menu.Item>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Group>
      <Menu.Item>Item C</Menu.Item>
    </Menu.Group>
  </Menu.Content>
</Menu.Root>
```

### With Submenu

```jsx
// Before
<Dropdown>
  <Dropdown.Trigger>Open</Dropdown.Trigger>
  <Dropdown.Portal>
    <Dropdown.Content>
      <Dropdown.Item>Item 1</Dropdown.Item>
      <Dropdown.Sub>
        <Dropdown.SubTrigger>Submenu</Dropdown.SubTrigger>
        <Dropdown.Portal>
          <Dropdown.SubContent>
            <Dropdown.Item>Sub Item 1</Dropdown.Item>
            <Dropdown.Item>Sub Item 2</Dropdown.Item>
          </Dropdown.SubContent>
        </Dropdown.Portal>
      </Dropdown.Sub>
    </Dropdown.Content>
  </Dropdown.Portal>
</Dropdown>

// After
<Menu.Root>
  <Menu.Trigger>Open</Menu.Trigger>
  <Menu.Content>
    <Menu.Item>Item 1</Menu.Item>
    <Menu.SubmenuRoot>
      <Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
      <Menu.SubmenuContent>
        <Menu.Item>Sub Item 1</Menu.Item>
        <Menu.Item>Sub Item 2</Menu.Item>
      </Menu.SubmenuContent>
    </Menu.SubmenuRoot>
  </Menu.Content>
</Menu.Root>
```

---

## 3. Props Change

### Menu.Root Props (formerly Dropdown)

| **Prop**       | **Before**                               | **After**                 | **Change Type** | **Migration Method / Notes**                                       |
| -------------- | ---------------------------------------- | ------------------------- | --------------- | ------------------------------------------------------------------ |
| `side`         | `'top' \| 'bottom' \| 'left' \| 'right'` | (Moved)                   | **Moved**       | Now passed to `Content` via `positionerProps={{ side: "bottom" }}` |
| `align`        | `'start' \| 'center' \| 'end'`           | (Moved)                   | **Moved**       | Now passed to `Content` via `positionerProps={{ align: "start" }}` |
| `modal`        | `boolean` (default: `true`)              | `boolean` (Optional)      | **No Change**   | Controls focus trap behavior                                       |
| `open`         | `boolean`                                | `boolean`                 | **No Change**   | Controls whether the Menu is open or closed                        |
| `onOpenChange` | `(open: boolean) => void`                | `(open: boolean) => void` | **No change**   | Callback invoked when Menu state changes                           |
| `defaultOpen`  | `boolean`                                | `boolean`                 | **No change**   | Initial open state in uncontrolled mode                            |

### Menu.Content Props (formerly Dropdown.Content)

| **Prop**          | **Before**                   | **After**             | **Change Type** | **Migration Method / Notes**                                             |
| ----------------- | ---------------------------- | --------------------- | --------------- | ------------------------------------------------------------------------ |
| `maxHeight`       | `string` (default: `'40vh'`) | (Use style prop)      | **Changed**     | Use `style={{ maxHeight: '40vh' }}` instead                              |
| `portalProps`     | (None)                       | `MenuPortalProps`     | **New Prop**    | Props to pass to the Portal                                              |
| `positionerProps` | (None)                       | `MenuPositionerProps` | **New Prop**    | Props to pass to the Positioner (includes `side`, `align`, `sideOffset`) |

### Menu.Item Props (formerly Dropdown.Item)

| **Prop**       | **Before**                  | **After**      | **Change Type** | **Migration Method / Notes**                              |
| -------------- | --------------------------- | -------------- | --------------- | --------------------------------------------------------- |
| `closeOnClick` | `boolean` (default: `true`) | (Removed)      | **Removed**     | Base UI handles this differently - always closes on click |
| `disabled`     | `boolean`                   | `boolean`      | **No Change**   | Disables the item                                         |
| `asChild`      | `boolean`                   | (Removed)      | **Removed**     | Replaced by `render` prop                                 |
| `render`       | (None)                      | `ReactElement` | **New Prop**    | Composes the component with another element               |

### Common Props for Subcomponents

| **Prop**    | **Before** | **After**      | **Change Type** | **Migration Method / Notes**                                              |
| ----------- | ---------- | -------------- | --------------- | ------------------------------------------------------------------------- |
| `asChild`   | `boolean`  | (Removed)      | **Removed**     | Replaced by `render` prop                                                 |
| `render`    | (None)     | `ReactElement` | **New Prop**    | Composes the component with another element (e.g., `render={<button />}`) |
| `className` | `string`   | `string`       | **No Change**   | Custom style class                                                        |

---

## 4. Sub-components

### Menu.Root

The root container for the Menu. It provides state management and Context.

```jsx
<Menu.Root modal={true}>{/* Menu content */}</Menu.Root>
```

**Props:**

- `modal`: Focus trap behavior (boolean)
- `open`, `onOpenChange`, `defaultOpen`: State control props
- `disabled`: Disables all menu items
- `children`: Menu content

### Menu.Trigger

The trigger button that opens the Menu.

```jsx
<Menu.Trigger>Open Menu</Menu.Trigger>
```

### Menu.Portal

Renders the Menu at a different location in the DOM (typically at the end of the body).

```jsx
<Menu.Portal>{/* Menu content */}</Menu.Portal>
```

### Menu.Content

**Composite component**: Contains `Portal`, `Positioner`, and `Popup`. Replaces the previous `Dropdown.Content` / `Dropdown.CombinedContent`.

```jsx
<Menu.Content positionerProps={{ side: 'bottom', align: 'start' }}>
    <Menu.Item>Item 1</Menu.Item>
    <Menu.Item>Item 2</Menu.Item>
</Menu.Content>
```

**Props:**

- `portalProps`: Props to pass to the Portal
- `positionerProps`: Props to pass to the Positioner (includes `side`, `align`, `sideOffset`)
- Other Popup props (like className, style)

### Menu.Item

A menu item.

```jsx
<Menu.Item disabled={false}>Item</Menu.Item>
```

**Props:**

- `disabled`: Disables the item
- `render`: Custom rendering
- `className`: Custom style class

### Menu.Separator

A separator line between menu items (formerly `Dropdown.Divider`).

```jsx
<Menu.Separator />
```

### Menu.Group

Groups related menu items.

```jsx
<Menu.Group>
    <Menu.GroupLabel>Group Label</Menu.GroupLabel>
    <Menu.Item>Item 1</Menu.Item>
    <Menu.Item>Item 2</Menu.Item>
</Menu.Group>
```

### Menu.GroupLabel

A label for a group (new component).

```jsx
<Menu.GroupLabel>Group Label</Menu.GroupLabel>
```

### Menu.SubmenuRoot

The root container for a submenu (formerly `Dropdown.Sub`).

```jsx
<Menu.SubmenuRoot>
    <Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
    <Menu.SubmenuContent>
        <Menu.Item>Sub Item</Menu.Item>
    </Menu.SubmenuContent>
</Menu.SubmenuRoot>
```

### Menu.SubmenuTriggerItem

The trigger item that opens a submenu (formerly `Dropdown.SubTrigger`).

```jsx
<Menu.SubmenuTriggerItem>Submenu</Menu.SubmenuTriggerItem>
```

### Menu.SubmenuContent

The content of a submenu (formerly `Dropdown.SubContent` / `Dropdown.SubCombinedContent`).

```jsx
<Menu.SubmenuContent>
    <Menu.Item>Sub Item 1</Menu.Item>
    <Menu.Item>Sub Item 2</Menu.Item>
</Menu.SubmenuContent>
```

**Props:**

- `portalProps`: Props to pass to the Portal
- `positionerProps`: Props to pass to the Positioner
- Other Popup props

---

## 5. Automated Migration

Codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes the `Dropdown` default import to a named import: `{ Menu }`
    - Automatically merges with existing `@vapor-ui/core` imports if present
    - Removes duplicate imports
2. **Component Name**: `Dropdown` → `Menu.Root`
    - Automatically changes both opening and closing tags
    - Self-closing tags also handled automatically
3. **Automatic Props Conversion**:
    - `side` and `align` props are moved from Root to Content's `positionerProps`
    - `modal` prop remains on Root
    - `maxHeight` prop is converted to a `style` prop on Content
    - `closeOnClick` prop is removed (with a comment warning)
    - **Portal's `forceMount` prop is automatically converted to `keepMounted`**
4. **Subcomponent Conversion**:
    - `Dropdown.Trigger` → `Menu.Trigger`
    - `Dropdown.Portal` → `Menu.Portal`
        - Portal's `forceMount` → `keepMounted`
    - `Dropdown.Content` → `Menu.Content`
    - `Dropdown.Contents` / `Dropdown.CombinedContent` → `Menu.Content`
    - `Dropdown.Divider` → `Menu.Separator`
    - `Dropdown.Group` → `Menu.Group`
    - `Dropdown.Item` → `Menu.Item`
    - `Dropdown.Sub` → `Menu.SubmenuRoot`
    - `Dropdown.SubTrigger` → `Menu.SubmenuTriggerItem`
    - `Dropdown.SubContent` → `Menu.SubmenuContent`
    - `Dropdown.SubContents` / `Dropdown.SubCombinedContent` → `Menu.SubmenuContent`

    ```jsx
        // Before
    <Dropdown.Contents>
        <Dropdown.Item>Item</Dropdown.Item>
    </Dropdown.Contents>

    // After (Automatically converted)
    <Menu.Content>
        <Menu.Item>Item</Menu.Item>
    </Menu.Content>
    ```

5. **asChild → automatic render prop conversion**:
    - Automatically converts the `asChild` prop to a `render` prop
    - Extracts the first child JSX element as a render prop (self-closing form)
    - Preserves the child element's props in the render prop
    - Moves the child element's internal content to the component's children

    ```jsx
    // Before
    <Dropdown.Trigger asChild>
      <button className="custom-button">Open</button>
    </Dropdown.Trigger>

    // After (auto-converted)
    <Menu.Trigger render={<button className="custom-button" />}>
      Open
    </Menu.Trigger>
    ```

6. **Props Preservation**:
    - All other props (className, data-_, aria-_, etc.) are automatically preserved

---

## 6. What the Transformer Does

The transformer performs the following transformations automatically:

### 6.1. Import Transformation

- Locates all imports from `@goorm-dev/vapor-core` containing `Dropdown`
- Converts default imports to named imports: `import Dropdown` → `import { Menu }`
- Changes the import source: `@goorm-dev/vapor-core` → `@vapor-ui/core`
- Merges with existing `@vapor-ui/core` imports to avoid duplicate import statements
- Preserves all other imports from the same source

### 6.2. Component Structure Transformation

- Renames the root component: `<Dropdown>` → `<Menu.Root>`
- Transforms all subcomponents with their new names (e.g., `Dropdown.Item` → `Menu.Item`)
- Handles aliased subcomponents (e.g., `Dropdown.Contents`, `Dropdown.CombinedContent` → `Menu.Content`)
- Updates both opening and closing tags, as well as self-closing tags

### 6.3. Props Transformation

- **Repositions positioning props**: Extracts `side` and `align` from `Menu.Root` and wraps them in `positionerProps={{ side, align }}` on `Menu.Content`
- **Converts maxHeight**: Changes `maxHeight="40vh"` to `style={{ maxHeight: "40vh" }}` on `Menu.Content`
- **Merges styles**: If both `maxHeight` and `style` exist, merges them into a single style object
- **Renames Portal props**: Converts `forceMount` to `keepMounted` on `Menu.Portal`
- **Removes deprecated props**: Removes `closeOnClick` and adds a warning comment

### 6.4. asChild to render Prop Conversion

- Detects `asChild` prop usage on any Menu subcomponent
- Extracts the first child JSX element
- Converts it to a self-closing `render` prop: `render={<element />}`
- Moves the child's internal content to the component's children
- Preserves all props from the original child element

---

## 7. When Manual Migration is Required

Codemod handles most tasks automatically, but manual intervention may be necessary in the following cases:

### 7.1. Critical: `closeOnClick` Behavior Change

**⚠️ IMPORTANT**: Base UI Menu items **always close the menu when clicked**. This behavior is not customizable.

- **Radix UI** (old): You could use `onSelect` with `event.preventDefault()` to prevent menu closing
- **Base UI** (new): Menu always closes on item click (default `closeOnClick: true`)

**Action Required**: If your code relied on `closeOnClick={false}` to keep the menu open, you'll need to refactor your logic. The codemod adds a warning comment where this prop was used.

### 7.2. Dynamic Props

If you're dynamically setting `side` and `align` props:

```jsx
// You may need to manually adjust this pattern
const position = { side: 'bottom', align: 'start' };
<Menu.Content positionerProps={position} />;
```

### 7.3. Style Merging

The codemod converts `maxHeight="40vh"` to `style={{ maxHeight: "40vh" }}`. If you have existing inline styles, verify the merge is correct.

### 7.4. Complex Nested or Dynamic Structures

While the codemod handles common patterns, highly complex nested structures or dynamically generated components may require manual verification.

### 7.5. Custom Portal Containers

If you're using custom portal containers with `container` prop, verify they still work correctly with the new Base UI Portal implementation.

---
