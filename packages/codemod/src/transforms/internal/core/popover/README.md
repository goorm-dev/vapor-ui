# **Component:** `Popover` ➡️ `Popover.Root`

## Overview

This transformer automates the migration of the Popover component from `@goorm-dev/vapor-core` to the new Popover component in `@vapor-ui/core`. This migration represents a significant architectural shift from **Radix UI** to **Base UI**, with changes to component naming, props placement, and internal structure.

### Key Changes Summary

| Aspect                | Before (`@goorm-dev/vapor-core`) | After (`@vapor-ui/core`)                  |
| --------------------- | -------------------------------- | ----------------------------------------- |
| **Base Library**      | Radix UI Popover                 | Base UI Popover                           |
| **Root Component**    | `<Popover>`                      | `<Popover.Root>`                          |
| **Import Style**      | Named import                     | Named import: `{ Popover }`               |
| **Positioning Props** | On root (`side`, `align`)        | On Content via `positionerProps`          |
| **Portal Prop**       | `forceMount`                     | `keepMounted`                             |
| **Arrow**             | `Popover.Arrow` component        | Automatically included in Popup (removed) |
| **Anchor**            | `Popover.Anchor` component       | Removed (children moved to parent)        |
| **Offset Props**      | `sideOffset`, `alignOffset`      | Moved to Content's `positionerProps`      |
| **CombinedContent**   | `Popover.CombinedContent`        | `Popover.Content` (Portal + Content)      |
| **Composition**       | `asChild` prop                   | `render` prop                             |

### What This Transformer Does

This transformer automatically handles:

-   ✅ Import statement migration with smart merging
-   ✅ Component renaming (`Popover` → `Popover.Root`)
-   ✅ `CombinedContent` → `Content` conversion
-   ✅ Props repositioning (`side`, `align` → `positionerProps`)
-   ✅ Offset props migration (`sideOffset`, `alignOffset` → `positionerProps`)
-   ✅ Arrow component removal (auto-included in new Popup)
-   ✅ Anchor component removal (children moved to parent Root)
-   ✅ Portal prop renaming (`forceMount` → `keepMounted`)
-   ✅ `asChild` to `render` prop conversion
-   ✅ `isArrowVisible` prop removal

### Coverage

**Test Coverage**: 98.18% Statements, 83.07% Branch, 100% Functions, 98.18% Lines
**Test Cases**: 12 comprehensive test cases covering all transformation scenarios

---

## 1. Name Change

The root component has been renamed from Popover to Popover.Root.

-   **Before:** `<Popover>` (Radix UI-based)
-   **After:** `<Popover.Root>` (Base UI-based)
-   ⚠️**Caution:** `Popover.CombinedContent` → Changed to `Popover.Content`
-   ⚠️**Caution:** `Popover.Arrow` → Removed (automatically included in Popup)
-   ⚠️**Caution:** `Popover.Anchor` → Removed (children moved to parent Root)
-   Other components (`Trigger`, `Portal`, `Content`, `Close`) stay the same

---

## 2. Usage Change

### Basic Usage

```jsx
// Before
import { Popover } from '@goorm-dev/vapor-core';

<Popover side="bottom" align="center">
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Portal>
        <Popover.Content>
            <Popover.Arrow />
            Popover Content
        </Popover.Content>
    </Popover.Portal>
</Popover>;

// After
import { Popover } from '@vapor-ui/core';

<Popover.Root>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Portal>
        <Popover.Content
            positionerProps={{
                side: 'bottom',
                align: 'center',
            }}
        >
            Popover Content
        </Popover.Content>
    </Popover.Portal>
</Popover.Root>;
```

### With CombinedContent

```jsx
// Before
<Popover side="right" align="center">
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.CombinedContent>
        Popover Content
    </Popover.CombinedContent>
</Popover>

// After
<Popover.Root>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Content positionerProps={{ side: 'right', align: 'center' }}>
        Popover Content
    </Popover.Content>
</Popover.Root>
```

### With Anchor

⚠️ **Note:** `Popover.Anchor` has been removed. The children of Anchor are moved directly to `Popover.Root`.

```jsx
// Before
<Popover>
    <Popover.Anchor>
        <div>Anchor Element</div>
        <Popover.Trigger>Open</Popover.Trigger>
    </Popover.Anchor>
    <Popover.Portal>
        <Popover.Content>Content</Popover.Content>
    </Popover.Portal>
</Popover>

// After
<Popover.Root>
    <div>Anchor Element</div>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Portal>
        <Popover.Content>Content</Popover.Content>
    </Popover.Portal>
</Popover.Root>
```

---

## 3. Props Change

### Popover.Root Props (formerly Popover)

| **Prop**       | **Before**                               | **After**                 | **Change Type** | **Migration Method / Notes**                                       |
| -------------- | ---------------------------------------- | ------------------------- | --------------- | ------------------------------------------------------------------ |
| `side`         | `'top' \| 'bottom' \| 'left' \| 'right'` | (Moved)                   | **Moved**       | Now passed to `Content` via `positionerProps={{ side: "bottom" }}` |
| `align`        | `'start' \| 'center' \| 'end'`           | (Moved)                   | **Moved**       | Now passed to `Content` via `positionerProps={{ align: "start" }}` |
| `disabled`     | `boolean`                                | `boolean`                 | **No Change**   | Controls whether the Popover can be opened                         |
| `open`         | `boolean`                                | `boolean`                 | **No Change**   | Controls whether the Popover is open or closed                     |
| `onOpenChange` | `(open: boolean) => void`                | `(open: boolean) => void` | **No change**   | Callback invoked when Popover state changes                        |
| `defaultOpen`  | `boolean`                                | `boolean`                 | **No change**   | Initial open state in uncontrolled mode                            |

### Popover.Content Props (formerly Popover.Content / Popover.CombinedContent)

| **Prop**          | **Before**                     | **After**                | **Change Type** | **Migration Method / Notes**                                             |
| ----------------- | ------------------------------ | ------------------------ | --------------- | ------------------------------------------------------------------------ |
| `isArrowVisible`  | `boolean` (default: `true`)    | (Removed)                | **Removed**     | Arrow is now automatically included and always visible                   |
| `sideOffset`      | `string` (e.g., `'space-150'`) | (Moved)                  | **Moved**       | Moved to `positionerProps={{ sideOffset: 'space-150' }}`                 |
| `alignOffset`     | `string` (e.g., `'space-000'`) | (Moved)                  | **Moved**       | Moved to `positionerProps={{ alignOffset: 'space-000' }}`                |
| `portalProps`     | (None)                         | `PopoverPortalProps`     | **New Prop**    | Props to pass to the Portal                                              |
| `positionerProps` | (None)                         | `PopoverPositionerProps` | **New Prop**    | Props to pass to the Positioner (includes `side`, `align`, `sideOffset`) |

### Common Props for Subcomponents

| **Prop**    | **Before** | **After**      | **Change Type** | **Migration Method / Notes**                                              |
| ----------- | ---------- | -------------- | --------------- | ------------------------------------------------------------------------- |
| `asChild`   | `boolean`  | (Removed)      | **Removed**     | Replaced by `render` prop                                                 |
| `render`    | (None)     | `ReactElement` | **New Prop**    | Composes the component with another element (e.g., `render={<button />}`) |
| `className` | `string`   | `string`       | **No Change**   | Custom style class                                                        |

---

## 4. Sub-components

### Popover.Root

The root container for the Popover. It provides state management and Context.

```jsx
<Popover.Root open={open} onOpenChange={setOpen}>
    {/* Popover content */}
</Popover.Root>
```

**Props:**

-   `open`, `onOpenChange`, `defaultOpen`: State control props
-   `disabled`: Disables the popover
-   `children`: Popover content

### Popover.Trigger

The trigger button/element that opens the Popover.

```jsx
<Popover.Trigger>Open Popover</Popover.Trigger>
```

### Popover.Portal

Renders the Popover at a different location in the DOM (typically at the end of the body).

```jsx
<Popover.Portal keepMounted>{/* Popover content */}</Popover.Portal>
```

**Props:**

-   `keepMounted`: Keep the portal mounted even when closed (formerly `forceMount`)

### Popover.Content

**Composite component**: Contains `Portal`, `Positioner`, and `Popup`. Replaces the previous `Popover.Content` / `Popover.CombinedContent`.

```jsx
<Popover.Content positionerProps={{ side: 'bottom', align: 'start', sideOffset: 8 }}>
    <p>Popover content here</p>
</Popover.Content>
```

**Props:**

-   `portalProps`: Props to pass to the Portal
-   `positionerProps`: Props to pass to the Positioner (includes `side`, `align`, `sideOffset`, `alignOffset`)
-   Other Popup props (like className, style)

### Popover.Close

A button that closes the popover.

```jsx
<Popover.Close>Close</Popover.Close>
```

### Popover.Anchor

⚠️ **Removed:** `Popover.Anchor` has been removed from the new API. The children of Anchor are moved directly to `Popover.Root`.

```jsx
// Before
<Popover.Anchor>
    <div>Anchor Element</div>
    <Popover.Trigger>Open</Popover.Trigger>
</Popover.Anchor>

// After - Anchor removed, children moved to Root
<div>Anchor Element</div>
<Popover.Trigger>Open</Popover.Trigger>
```

### Popover.Title

A title element for the Popover (new component).

```jsx
<Popover.Title>Popover Title</Popover.Title>
```

### Popover.Description

A description element for the Popover (new component).

```jsx
<Popover.Description>This is a description of the popover content.</Popover.Description>
```

---

## 5. Automated Migration

Codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Migrates the `Popover` named import
    - Automatically merges with existing `@vapor-ui/core` imports if present
    - Removes duplicate imports
    - Uses the `transformImportDeclaration` utility for safe import transformation
2. **Component Name**: `Popover` → `Popover.Root`
    - Automatically changes both opening and closing tags
    - Self-closing tags also handled automatically
3. **Automatic Props Conversion**:
    - `side` and `align` props are moved from Root to Content's `positionerProps`
    - `sideOffset` and `alignOffset` props are moved to Content's `positionerProps`
    - `isArrowVisible` prop is removed
    - `disabled` prop remains on Root
    - **Portal's `forceMount` prop is automatically converted to `keepMounted`**
4. **Subcomponent Conversion**:

    - `Popover.Trigger` → `Popover.Trigger`
    - `Popover.Portal` → `Popover.Portal`
        - Portal's `forceMount` → `keepMounted`
    - `Popover.Content` → `Popover.Content`
    - `Popover.CombinedContent` → `Popover.Content`
    - `Popover.Arrow` → (Removed - automatically included in Popup)
    - `Popover.Close` → `Popover.Close`
    - `Popover.Anchor` → `Popover.Anchor`

    ```jsx
    // Before
    <Popover.CombinedContent>
        <Popover.Arrow />
        Content
    </Popover.CombinedContent>

    // After (Automatically converted)
    <Popover.Content>
        Content
    </Popover.Content>
    ```

5. **asChild → automatic render prop conversion**:

    - Automatically converts the `asChild` prop to a `render` prop
    - Extracts the first child JSX element as a render prop (self-closing form)
    - Preserves the child element's props in the render prop
    - Moves the child element's internal content to the component's children

    ```jsx
    // Before
    <Popover.Trigger asChild>
      <button className="custom-button">Open</button>
    </Popover.Trigger>

    // After (auto-converted)
    <Popover.Trigger render={<button className="custom-button" />}>
      Open
    </Popover.Trigger>
    ```

6. **Props Preservation**:
    - All other props (className, data-_, aria-_, etc.) are automatically preserved

---

## 6. What the Transformer Does

The transformer performs the following transformations automatically:

### 6.1. Import Transformation

-   Locates all imports from `@goorm-dev/vapor-core` containing `Popover`
-   Migrates named imports from `@goorm-dev/vapor-core` to `@vapor-ui/core`
-   Merges with existing `@vapor-ui/core` imports to avoid duplicate import statements
-   Preserves all other imports from the same source

### 6.2. Component Structure Transformation

-   Renames the root component: `<Popover>` → `<Popover.Root>`
-   Transforms `Popover.CombinedContent` → `Popover.Content`
-   Removes `Popover.Arrow` components (automatically included in new Popup)
-   Updates both opening and closing tags, as well as self-closing tags

### 6.3. Props Transformation

-   **Repositions positioning props**: Extracts `side` and `align` from `Popover.Root` and wraps them in `positionerProps={{ side, align }}` on `Popover.Content`
-   **Moves offset props**: Extracts `sideOffset` and `alignOffset` from `Content` and wraps them in `positionerProps`
-   **Removes isArrowVisible**: Removes the `isArrowVisible` prop (arrow is now always visible and included automatically)
-   **Renames Portal props**: Converts `forceMount` to `keepMounted` on `Popover.Portal`

### 6.4. asChild to render Prop Conversion

-   Detects `asChild` prop usage on any Popover subcomponent
-   Extracts the first child JSX element
-   Converts it to a self-closing `render` prop: `render={<element />}`
-   Moves the child's internal content to the component's children
-   Preserves all props from the original child element

---

## 7. When Manual Migration is Required

Codemod handles most tasks automatically, but manual intervention may be necessary in the following cases:

### 7.1. Dynamic Props

If you're dynamically setting `side`, `align`, or offset props:

```jsx
// You may need to manually adjust this pattern
const position = { side: 'bottom', align: 'start', sideOffset: 8 };
<Popover.Content positionerProps={position} />;
```

### 7.2. Complex Nested or Dynamic Structures

While the codemod handles common patterns, highly complex nested structures or dynamically generated components may require manual verification.

### 7.3. Custom Arrow Styling

If you had custom styling on `Popover.Arrow`, you'll need to apply those styles to the Content or Popup component instead, as Arrow is now automatically included.

### 7.4. Custom Portal Containers

If you're using custom portal containers with `container` prop, verify they still work correctly with the new Base UI Portal implementation.

---

## 8. Notes

### Base UI Transition (Radix UI → Base UI)

New Popover components have transitioned from **Radix UI Popover** to **Base UI Popover**.

**Key Changes:**

1. **Base Library**:
    - Previous: `@radix-ui/react-popover`
    - New: `@base-ui-components/react/popover`
2. **Component Structure**:

    - **Radix UI**: Flat structure with `Popover.Root`, `Popover.Content`
    - **Base UI**: Hierarchical structure with `Popover.Root`, `Popover.Portal`, `Popover.Positioner`, `Popover.Popup`

3. **Arrow Handling**:

    - **Radix UI**: Separate `Popover.Arrow` component
    - **Base UI**: Arrow is automatically included in `Popup` component

4. **Positioning**:
    - **Radix UI**: `side` and `align` props on Content
    - **Base UI**: Separate `Positioner` component with `side`, `align`, `sideOffset`, `alignOffset` props
5. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Maintain design token-based styling

### CombinedContent vs Content

-   **Previous version (`@goorm-dev/vapor-core`)**:
    -   `Popover.CombinedContent` is a composite component containing `Portal + Content`
    -   Renders all elements at once for convenience
    -   `Popover.Content` is just the content without Portal
-   **New Version (`@vapor-ui/core`)**:
    -   `Popover.Content` is now the composite component (includes `Portal + Positioner + Popup`)
    -   `Popover.Popup` is the primary element usable on its own
    -   Portal, Positioner, and Popup can be explicitly configured when finer control is needed

### Accessibility

Both libraries provide excellent accessibility:

-   Proper focus management
-   Escape key closes the popover
-   Arrow key navigation (when applicable)
-   ARIA attributes are automatically applied

---

## 9. Implementation Details

### Transformer Implementation

**File Location**: `packages/codemod/src/transforms/internal/core/popover/index.ts`

**Automation Scope** (Target 90%+ coverage, achieved 98.18%):

1. **Import Migration**
    - Migrate the named import of `Popover` from `@goorm-dev/vapor-core` to `@vapor-ui/core`
    - Automatically merge existing `@vapor-ui/core` imports
    - Remove duplicate imports
2. **Component Conversion**
    - Automatically convert `<Popover>` → `<Popover.Root>`
    - Automatically handle both opening and closing tags
    - Automatically handle self-closing tags
3. **Props Conversion**
    - Move `side` and `align` from Root to Content's `positionerProps`
    - Move `sideOffset` and `alignOffset` to Content's `positionerProps`
    - Remove `isArrowVisible` prop
4. **Subcomponent Conversion**
    - `Popover.CombinedContent` → `Popover.Content`
    - Remove `Popover.Arrow` components
    - All other subcomponents preserve their names
5. **asChild → render Conversion**
    - Automatically convert the `asChild` property of all Popover subcomponents to a `render` property

### Test Coverage

**Test Cases** (Total 12, all passing):

1. `popover-basic`: Basic usage (Popover → Popover.Root)
2. `popover-props-side-align`: Props conversion (side, align)
3. `popover-combined-content`: CombinedContent usage
4. `popover-with-arrow`: Arrow removal
5. `popover-with-asChild`: asChild conversion
6. `popover-portal-forceMount`: Portal's forceMount → keepMounted conversion
7. `popover-isArrowVisible`: isArrowVisible removal
8. `popover-with-anchor`: Anchor usage
9. `popover-multiple`: Multiple Popover components
10. `popover-merge-into-existing`: Merging Popover into existing @vapor-ui/core import
11. `popover-disabled`: Disabled prop preservation
12. `popover-close-asChild`: Close component asChild conversion

**Coverage**: **98.18% Statements**, 83.07% Branch, **100% Functions**, **98.18% Lines** ✨

### How to Run

```bash
# Run test
pnpm test popover

# Run Transformer
pnpm codemod popover <path-to-files>
```
