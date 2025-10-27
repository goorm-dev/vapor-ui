# **Component:** `Dialog` ➡️ `Dialog.Root`

- **Overview:** Modifies the Dialog component for migration to vapor-ui.
  It transitions from a Radix UI-based structure to a Base UI-based structure, with changes to the root component name, certain props, and the subcomponent structure.

---

## 1. Name Change

The composition structure remains unchanged, but the root component name and some subcomponents have been modified.

- **Before:** `<Dialog>` (Radix UI-based)
- **After:** `<Dialog.Root>` (Base UI-based)
- ⚠️**Caution:** `Dialog.Contents` / `Dialog.CombinedContent` → Changed to `Dialog.Content`
- ⚠️**Caution:** `Dialog.Content` (Used standalone without Portal or Overlay) → Changed to `Dialog.Popup` (Beware of confusion with the new component's Dialog.Content)
- The remaining subcomponents (`Trigger`, `Portal`, `Overlay`, `Header`, `Body`, `Footer`, `Title`, `Description`, `Close`) retain their original names.

---

## 2. Usage Change

### Default Usage (Using Dialog.Contents / Dialog.CombinedContent)

```jsx
// Before
import Dialog from ‘@goorm-dev/vapor-core’;

<Dialog size="md" scrimClickable={true}>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Contents> // or <Dialog.CombinedContents>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>Dialog Description</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      Content goes here
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Contents>
</Dialog>

// After
import { Dialog } from ‘@vapor-ui/core’;

<Dialog.Root size="md" closeOnClickOverlay={true}>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>Dialog Description</Dialog.Description>
    </Dialog.Header>
    <Dialog.Body>
      Content goes here
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### When explicitly using Portal and Overlay

```jsx
// Before
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Title</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>Content</Dialog.Body>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog>

// After
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Popup>
      <Dialog.Header>
        <Dialog.Title>Title</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>Content</Dialog.Body>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

---

## 3. Props Change

### Dialog.Root Props

| **Prop**              | **Before**                  | **After**                 | **Change Type** | **Migration Method / Notes**                                                    |
| --------------------- | --------------------------- | ------------------------- | --------------- | ------------------------------------------------------------------------------- |
| `scrimClickable`      | `boolean` (default: `true`) | (Removed)                 | **Removed**     | Replaced by `closeOnClickOverlay`                                               |
| `closeOnClickOverlay` | (None)                      | `boolean` (Optional)      | **New Prop**    | Whether to close the Dialog on overlay click (Maps to `dismissible` in Base UI) |
| `open`                | `boolean`                   | `boolean`                 | **No Change**   | Controls whether the Dialog is open or closed                                   |
| `onOpenChange`        | `(open: boolean) => void`   | `(open: boolean) => void` | **No change**   | Callback invoked when Dialog state changes                                      |
| `defaultOpen`         | `boolean`                   | `boolean`                 | **No change**   | Initial open state in uncontrolled mode                                         |

### Common Props for Subcomponents

| **Prop**    | **Before** | **After**      | **Change Type** | **Migration Method / Notes**                                              |
| ----------- | ---------- | -------------- | --------------- | ------------------------------------------------------------------------- |
| `asChild`   | `boolean`  | (Removed)      | **Removed**     | Replaced by `render` prop                                                 |
| `render`    | (None)     | `ReactElement` | **New Prop**    | Composes the component with another element (e.g., `render={<button />}`) |
| `className` | `string`   | `string`       | **No Change**   | Custom style class                                                        |

---

## 4. Sub-components

### Dialog.Root

The root container for the Dialog. It provides state management and Context.

```jsx
<Dialog.Root size="md" closeOnClickOverlay={true}>
    {/* Dialog content */}
</Dialog.Root>
```

**Props:**

- `size`: Dialog size (`‘md’` | `‘lg’` | `‘xl’`)
- `closeOnClickOverlay`: Close Dialog on overlay click (boolean)
- `open`, `onOpenChange`, `defaultOpen`: State control props
- `children`: Dialog content

### Dialog.Trigger

The trigger button that opens the Dialog.

```jsx
<Dialog.Trigger>Open Dialog</Dialog.Trigger>
```

### Dialog.Portal

Renders the Dialog at a different location in the DOM (typically at the end of the body).

```jsx
<Dialog.Portal>{/* Dialog content */}</Dialog.Portal>
```

### Dialog.Overlay

The background overlay behind the Dialog. (Renamed from Base-ui Dialog.Backdrop)

```jsx
<Dialog.Overlay />
```

### Dialog.Content

**New component**: A composite component containing `Portal`, `Overlay`, and `Popup`. Replaces the previous `Dialog.Contents` / `Dialog.CombinedContent`.

```jsx
<Dialog.Content>
    <Dialog.Header>{/* Header content */}</Dialog.Header>
    <Dialog.Body>{/* Body content */}</Dialog.Body>
</Dialog.Content>
```

**Props:**

- `portalProps`: Props to pass to the Portal
- `overlayProps`: Props to pass to the Overlay
- Other Popup props (like className)

### Dialog.Popup

**New primitive**: The actual content container for a Dialog. Use it standalone without `Portal` or `Overlay`.

```jsx
<Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Popup>{/* Content */}</Dialog.Popup>
</Dialog.Portal>
```

### Dialog.Header, Dialog.Body, Dialog.Footer

Each section of the Dialog.

```jsx
<Dialog.Header>
  {/* Header content */}
</Dialog.Header>
<Dialog.Body>
  {/* Body content */}
</Dialog.Body>
<Dialog.Footer>
  {/* Footer content */}
</Dialog.Footer>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering (default: `<div />`)
- `children`: Content

### Dialog.Title

The title of the Dialog. Automatically connects to `aria-labelledby` for accessibility.

```jsx
<Dialog.Title>Dialog Title</Dialog.Title>
```

### Dialog.Description

The description of the Dialog. Automatically connects to `aria-describedby` for accessibility.

```jsx
<Dialog.Description>Dialog Description</Dialog.Description>
```

### Dialog.Close

The button to close the Dialog.

```jsx
<Dialog.Close>Close</Dialog.Close>
```

---

## 5. Automated Migration

Codemode automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes the `Dialog` default import to a named import: `{ Dialog }`
    - Automatically merges existing `@vapor-ui/core` imports
2. **Component Name**: `Dialog` → `Dialog.Root`
    - Automatically changes both opening and closing tags
    - Self-closing tags also handled automatically
3. **Automatic Props Conversion**:
    - `scrimClickable` → `closeOnClickOverlay`
    - Prop values remain unchanged (true → true, false → false)
4. **Subcomponent Conversion**:
    - `Dialog.Contents` → `Dialog.Content`
    - `Dialog.CombinedContent` → `Dialog.Content`
    - When explicitly using `Dialog.Portal` and `Dialog.Overlay` while also using `Dialog.Content` → Convert to `Dialog.Popup`

    ```jsx
        // Before
    <Dialog.Contents>
        <Dialog.Header>Header</Dialog.Header>
    </Dialog.Contents>

    // After (Automatically converted)
    <Dialog.Content>
        <Dialog.Header>Header</Dialog.Header>
    </Dialog.Content>
    ```

    ```jsx
    // Before
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Header>Header</Dialog.Header>
      </Dialog.Content>
    </Dialog.Portal>

    // After (auto-converted)
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Popup>
        <Dialog.Header>Header</Dialog.Header>
      </Dialog.Popup>
    </Dialog.Portal>
    ```

5. **asChild → automatic render prop conversion** :
    - Automatically converts the `asChild` prop to a `render` prop
    - Extracts the first child JSX element as a render prop (self-closing form)
    - Preserves the child element's props in the render prop
    - Moves the child element's internal content to the component's children

    ```jsx
    // Before
    <Dialog.Trigger asChild>
      <button className="custom-button">Open</button>
    </Dialog.Trigger>

    // After (auto-converted)
    <Dialog.Trigger render={<button className="custom-button" />}>
      Open
    </Dialog.Trigger>
    ```

6. **Props Preservation**:
    - All other props (className, data-_, aria-_, etc.) are automatically preserved

---

## 6. When Manual Migration is Required

Codemode handles most tasks automatically, but manual intervention may be necessary in the following cases:

1. **Complex Dialog.Content Structures**: While Codemode handles common patterns, highly complex nested or dynamic structures may require manual verification.

---

## 7. Notes

### Base UI Transition (Radix UI → Base UI)

New Dialog components have transitioned from **Radix UI** to **Base UI**.

**Source**: Context7 MCP - Base UI Documentation

**Key Changes:**

1. **Base Library**:
    - Previous: `@radix-ui/react-dialog`
    - New: `@base-ui-components/react/dialog`
2. **Focus Management Approach**:
    - **Radix UI**: Uses `onOpenAutoFocus`, `onCloseAutoFocus`

    ```jsx
    // Radix UI
    <Dialog.Content
      onOpenAutoFocus={(event) => {
        closeButtonRef.current?.focus();
        event.preventDefault();
      }}
    >
    ```

    - **Base UI**: Uses `initialFocus`, `finalFocus` props

    ```jsx
    // Base UI
    <Dialog.Popup
      initialFocus={() => closeButtonRef.current}
      finalFocus={() => triggerRef.current}
    >
    ```

3. **Overlay Click Behavior**:
    - **Radix UI**: Closes by default on overlay click (uncontrollable)
    - **Base UI**: Controlled via `dismissible` property (we wrap it with `closeOnClickOverlay`)

    ```jsx
    // Base UI (internal)
    <BaseDialog.Root dismissible={closeOnClickOverlay}>
    ```

4. **Background vs Overlay**:
    - **Radix UI**: `Dialog.Overlay`
    - **Base UI**: `Dialog.Backdrop` (internal), we wrap it with `Dialog.Overlay`
5. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Maintain design token-based styling

### Dialog.Contents vs Dialog.Content

- **Previous version (`@goorm-dev/vapor-core`)**:
    - `Dialog.Contents` (or `Dialog.CombinedContent`) is a composite component containing `Portal + Overlay + Content`
    - Renders all elements at once for convenience
- **New Version (`@vapor-ui/core`)**:
    - Renamed to `Dialog.Content`, same role (includes `Portal + Overlay + Popup`)
    - `Dialog.Popup` is the primary element usable on its own
    - Portal, Overlay, and Popup can be explicitly configured when finer control is needed

### Size Variants

The Dialog's size property remains unchanged:

- `md`: Medium size (default)
- `lg`: Large size
- `xl`: Extra large size

### Accessibility

Both libraries provide excellent accessibility:

- `Dialog.Title` is automatically linked to `aria-labelledby`
- `Dialog.Description` is automatically linked to `aria-describedby`
- `role=“dialog”` is automatically set
- `aria-modal=“true”` is automatically set
- Focus trap is built-in (controllable via the `trap` prop in Base UI)

---

## 8. Implementation Details

### Transformer Implementation

**File Location**: `packages/codemod/src/transforms/internal/core/dialog/index.ts`

**Automation Scope** (Target 90%+ coverage):

1. **Import Migration**
    - Change the default import of `Dialog` from `@goorm-dev/vapor-core` to the named import `{ Dialog }` from `@vapor-ui/core`
    - Automatically merge existing `@vapor-ui/core` imports
    - Remove duplicate imports
2. **Component Conversion**
    - Automatically convert `<Dialog>` → `<Dialog.Root>`
    - Automatically handle both opening and closing tags
    - Automatically handle self-closing tags
3. **Props Conversion**
    - `scrimClickable` → `closeOnClickOverlay`
    - Value remains unchanged
4. **Subcomponent Conversion**
    - `Dialog.Contents` → `Dialog.Content`
    - `Dialog.CombinedContent` → `Dialog.Content`
    - `Dialog.Portal` + `Dialog.Content` pattern → `Dialog.Portal` + `Dialog.Popup`
5. **asChild → render Conversion**
    - Automatically convert the `asChild` property of all Dialog subcomponents to a `render` property

### Test Coverage

**Test Cases** (Total 18, all passed):

1. `dialog-basic`: Basic use case (Dialog → Dialog.Root, Contents → Content)
2. `dialog-named-import`: Named import case (import { Dialog })
3. `dialog-with-contents`: Dialog.Contents usage case
4. `dialog-with-combined-content`: Dialog.CombinedContent usage case
5. `dialog-explicit-portal`: Explicit use of portal + overlay + content (content → popup conversion)
6. `dialog-scrim-clickable`: scrimClickable property conversion (true/false/boolean)
7. `dialog-with-props`: Various properties (size, open, onOpenChange, etc.)
8. `dialog-mixed-imports`: Importing alongside other components
9. `dialog-mixed-with-existing-vapor`: Dialog + other components, merge into existing @vapor-ui/core import
10. `dialog-existing-vapor-import`: When an existing @vapor-ui/core import is present
11. `dialog-merge-into-vapor-import`: Merge into @vapor-ui/core import
12. `dialog-already-in-vapor-import`: When the Dialog is already imported into vapor-ui
13. `dialog-vapor-import-has-dialog`: When a Dialog already exists in @vapor-ui/core (alias handling)
14. `dialog-with-asChild`: asChild prop conversion (default case) - Include the entire element in the render prop
15. `dialog-asChild-with-props`: asChild prop transformation (includes props) - wraps entire element in render prop
16. `dialog-all-sections`: Includes Header, Body, and Footer
17. `dialog-controlled`: Controlled mode (open, onOpenChange)
18. `dialog-multiple`: Simultaneous transformation of multiple Dialog components

### How to Run

```bash
# Run test
pnpm test dialog

# Run Transformer
pnpm codemod dialog <path-to-files>
```
