# Nav Component Migration Guide

## Component: `Nav` ➡️ `NavigationMenu`

- **Overview:** Migrate the Nav component to NavigationMenu for vapor-ui migration. The Nav structure based on Radix UI changes to a NavigationMenu structure based on Base UI, with root component name changes and some props modified/removed.

---

## 1. Name Change

The entire component has changed from Nav to NavigationMenu, with changes to the composition structure.

- **Before:** `<Nav>` (Radix UI based)
- **After:** `<NavigationMenu.Root>` (Base UI based)
- ⚠️**Note:** `Nav.Link`'s `active` prop → `NavigationMenu.Link`'s `selected` prop
- ⚠️**Note:** `Nav.Link`'s `align` prop removed
- ⚠️**Note:** `Nav`'s `type` prop removed (pill/text style distinction removed)
- ⚠️**Note:** `aria-label` prop **required** in `NavigationMenu.Root`

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
import Nav from '@goorm-dev/vapor-core';

<Nav size="md" type="pill" stretch={false} direction="horizontal">
  <Nav.List>
    <Nav.Item>
      <Nav.Link href="/" active>Home</Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link href="/about">About</Nav.Link>
    </Nav.Item>
  </Nav.List>
</Nav>

// After
import { NavigationMenu } from '@vapor-ui/core';

<NavigationMenu.Root aria-label="Main navigation" size="md" stretch={false} direction="horizontal">
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="/" selected>Home</NavigationMenu.Link>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
```

### LinkItem Usage (Simplified)

```javascript
// After - Using new LinkItem component
<NavigationMenu.Root aria-label="Main navigation">
    <NavigationMenu.List>
        <NavigationMenu.LinkItem href="/" selected>
            Home
        </NavigationMenu.LinkItem>
        <NavigationMenu.LinkItem href="/about">About</NavigationMenu.LinkItem>
    </NavigationMenu.List>
</NavigationMenu.Root>
```

### Using Trigger and Panel (Submenu)

```javascript
// After - Dropdown menu using Trigger and Panel
<NavigationMenu.Root aria-label="Main navigation" defaultValue="1">
    <NavigationMenu.List>
        <NavigationMenu.Item value="1">
            <NavigationMenu.Trigger>
                Products
                <NavigationMenu.TriggerIndicator />
            </NavigationMenu.Trigger>
            <NavigationMenu.Panel>
                <NavigationMenu.Item>
                    <NavigationMenu.Link href="/products/item1">Item 1</NavigationMenu.Link>
                </NavigationMenu.Item>
            </NavigationMenu.Panel>
        </NavigationMenu.Item>
    </NavigationMenu.List>
</NavigationMenu.Root>
```

---

## 3. Props Changes

### NavigationMenu.Root Props (Former Nav)

| **Prop**        | **Before**                     | **After**                                                          | **Change Type**         | **Migration Method / Notes**                       |
| --------------- | ------------------------------ | ------------------------------------------------------------------ | ----------------------- | -------------------------------------------------- |
| `aria-label`    | (none)                         | `string` (required)                                                | **New Prop (required)** | Provide navigation label (e.g., "Main navigation") |
| `size`          | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm' \| 'md' \| 'lg' \| 'xl'`                                     | **No Change**           | Navigation size                                    |
| `type`          | `'pill' \| 'text'`             | (removed)                                                          | **Removed**             | Style distinction removed                          |
| `stretch`       | `boolean` (default: `false`)   | `boolean` (default: `false`)                                       | **No Change**           | Fit item width to parent container                 |
| `direction`     | `'horizontal' \| 'vertical'`   | `'horizontal' \| 'vertical'`                                       | **No Change**           | Navigation direction                               |
| `orientation`   | (used internally)              | `'horizontal' \| 'vertical'` (default: `'horizontal'`)             | **No Change**           | Internal orientation                               |
| `disabled`      | (none)                         | `boolean`                                                          | **New Prop**            | Disable all navigation items                       |
| `defaultValue`  | (none)                         | `any`                                                              | **New Prop**            | Initial selected item in uncontrolled mode         |
| `value`         | (none)                         | `any`                                                              | **New Prop**            | Current selected item in controlled mode           |
| `onValueChange` | (none)                         | `(value: any, event: Event, reason: BaseOpenChangeReason) => void` | **New Prop**            | Callback on item selection change                  |
| `delay`         | (none)                         | `number` (default: `50`)                                           | **New Prop**            | Delay time for opening navigation menu (ms)        |
| `closeDelay`    | (none)                         | `number` (default: `50`)                                           | **New Prop**            | Delay time for closing navigation menu (ms)        |

### NavigationMenu.Link Props (Former Nav.Link)

| **Prop**   | **Before**                      | **After**      | **Change Type** | **Migration Method / Notes**          |
| ---------- | ------------------------------- | -------------- | --------------- | ------------------------------------- |
| `active`   | `boolean`                       | (renamed)      | **Renamed**     | Changed to `selected`                 |
| `selected` | (none)                          | `boolean`      | **New Prop**    | Display currently selected link       |
| `disabled` | `boolean`                       | `boolean`      | **No Change**   | Disable link                          |
| `href`     | `string`                        | `string`       | **No Change**   | Link URL                              |
| `align`    | `'left' \| 'center' \| 'right'` | (removed)      | **Removed**     | Align removed                         |
| `asChild`  | `boolean`                       | (removed)      | **Removed**     | Replaced with `render` prop           |
| `render`   | (none)                          | `ReactElement` | **New Prop**    | Compose component with other elements |

### Common Sub-component Props

| **Prop**    | **Before** | **After**                            | **Change Type** | **Migration Method / Notes**                                        |
| ----------- | ---------- | ------------------------------------ | --------------- | ------------------------------------------------------------------- |
| `asChild`   | `boolean`  | (removed)                            | **Removed**     | Replaced with `render` prop                                         |
| `render`    | (none)     | `ReactElement`                       | **New Prop**    | Compose component with other elements (e.g., `render={<button />}`) |
| `className` | `string`   | `string \| (state: State) => string` | **Improved**    | State-based styling support                                         |

---

## 4. Sub-components

### NavigationMenu.Root

Root container of NavigationMenu. Provides state management and Context.

```javascript
<NavigationMenu.Root aria-label="Main navigation" size="md">
    {/* NavigationMenu content */}
</NavigationMenu.Root>
```

**Props:**

- `aria-label`: Navigation label (required, string)
- `size`: Navigation size ('sm' | 'md' | 'lg' | 'xl')
- `stretch`: Fit item width to parent (boolean)
- `direction`: Navigation direction ('horizontal' | 'vertical')
- `disabled`: Disable all items (boolean)
- `value`, `onValueChange`, `defaultValue`: State control props
- `delay`, `closeDelay`: Open/close delay time (ms)
- `children`: NavigationMenu content

### NavigationMenu.List

List container for navigation items.

```javascript
<NavigationMenu.List>{/* NavigationMenu items */}</NavigationMenu.List>
```

### NavigationMenu.Item

Navigation item container. Wraps Link or Trigger.

```javascript
<NavigationMenu.Item>
    <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
</NavigationMenu.Item>
```

**Props:**

- `value`: Item identifier (any)
- `render`: Custom rendering (ReactElement)
- `className`: Custom style class

### NavigationMenu.Link

Navigation link.

```javascript
<NavigationMenu.Link href="/" selected>
    Home
</NavigationMenu.Link>
```

**Props:**

- `selected`: Display currently selected link (boolean)
- `disabled`: Disable link (boolean)
- `href`: Link URL (string)
- `render`: Custom rendering (ReactElement)
- `className`: Custom style class

### NavigationMenu.LinkItem

**New component**: Simplified component combining Item and Link.

```javascript
<NavigationMenu.LinkItem href="/" selected>
    Home
</NavigationMenu.LinkItem>
```

**Props:**

- Inherits all props from NavigationMenu.Link

### NavigationMenu.Trigger

**New component**: Trigger button to open dropdown menu.

```javascript
<NavigationMenu.Trigger>
    Products
    <NavigationMenu.TriggerIndicator />
</NavigationMenu.Trigger>
```

**Props:**

- `disabled`: Disable trigger (boolean)
- `render`: Custom rendering (ReactElement)
- `className`: Custom style class

### NavigationMenu.TriggerIndicator

**New component**: Icon (typically arrow) displayed next to trigger.

```javascript
<NavigationMenu.TriggerIndicator />
```

### NavigationMenu.Panel

**New component**: Container for dropdown menu content.

```javascript
<NavigationMenu.Panel>
    <NavigationMenu.Item>
        <NavigationMenu.Link href="/products/item1">Item 1</NavigationMenu.Link>
    </NavigationMenu.Item>
</NavigationMenu.Panel>
```

### NavigationMenu.Content

**New component**: Composite component including Portal + Positioner + Popup + Viewport. Controls positioning and rendering of dropdown menu.

```javascript
<NavigationMenu.Content positionerProps={{ side: 'bottom', align: 'center' }} />
```

**Props:**

- `portalProps`: Props to pass to Portal
- `positionerProps`: Props to pass to Positioner (includes `side`, `align`, `sideOffset`)
- `popupProps`: Props to pass to Popup

### NavigationMenu.Portal

**New component**: Renders menu at a different location in the DOM.

### NavigationMenu.Positioner

**New component**: Controls menu position.

**Props:**

- `side`: Menu display position ('top' | 'bottom' | 'left' | 'right')
- `align`: Menu alignment ('start' | 'center' | 'end')
- `sideOffset`: Distance from trigger (px)

### NavigationMenu.Popup

**New component**: Popup container for dropdown menu.

### NavigationMenu.Viewport

**New component**: Viewport for dropdown menu.

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes `Nav` default import to `{ NavigationMenu }` named import
    - Automatically merges with existing `@vapor-ui/core` imports
    - Uses `migrateAndRenameImport` utility for safe import transformation

2. **Component Name**: `Nav` → `NavigationMenu.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Props Automatic Conversion**:
    - Preserves `direction` prop (internally converted to `orientation`)
    - Removes `type` prop (adds warning comment)
    - Automatically adds `aria-label` prop (`aria-label="Navigation"`)
    - Changes `active` prop to `selected` (Nav.Link)
    - Removes `align` prop (Nav.Link)

4. **Sub-component Conversion**:
    - `Nav.List` → `NavigationMenu.List`
    - `Nav.Item` → `NavigationMenu.Item`
    - `Nav.Link` → `NavigationMenu.Link`
    - Automatically changes Link's `active` prop to `selected`
    - Automatically removes Link's `align` prop

5. **asChild → render prop automatic conversion**:
    - Automatically converts `asChild` prop to `render` prop

6. **Props Preservation**:
    - All other props (className, data-_, aria-_, etc.) automatically preserved

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **aria-label Validation**: The codemod automatically adds `aria-label="Navigation"`, but it's recommended to change it to a clearer label (e.g., "Main navigation", "Footer navigation").

2. **type prop Removal**: If `type="pill"` or `type="text"` style is needed, customize with CSS.

3. **align prop Removal**: Since Link's `align` prop was removed, use CSS `text-align` or flexbox to adjust alignment if needed.

4. **Adding Dropdown Menu**: If the existing Nav didn't use dropdown menus, you can manually add `Trigger`, `Panel`, `Content` components as needed.

5. **Text Component Wrapping Removal**: The existing Nav.Link was internally wrapped with Text component, but the new NavigationMenu.Link is not. Apply typography styles separately if needed.

---

## 7. Notes

### Base UI Transition (Radix UI → Base UI)

The new NavigationMenu component has transitioned from **Radix UI NavigationMenu** to **Base UI NavigationMenu**.

**Key Changes:**

1. **Base Library**:
    - Before: `@radix-ui/react-navigation-menu`
    - After: `@base-ui-components/react/navigation-menu`

2. **Component Structure**:
    - **Radix UI**: Flat structure using `NavigationMenu.Root`
    - **Base UI**: Hierarchical structure using `NavigationMenu.Root`, `NavigationMenu.Positioner`, `NavigationMenu.Popup`

3. **Positioning**:
    - **Radix UI**: Cannot pass position props directly to Content
    - **Base UI**: Pass `side`, `align`, `sideOffset` props to separate `Positioner` component
    - vapor-ui's `Content` component can conveniently set position via `positionerProps`

4. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Design token-based styling maintained

### Nav vs NavigationMenu Differences

- **Previous Version (`@goorm-dev/vapor-core`)**:
    - `Nav` is a component for simple navigation link lists
    - `type` prop to select pill/text style
    - Link component automatically wrapped with Text for typography
    - Dropdown menus not supported

- **New Version (`@vapor-ui/core`)**:
    - `NavigationMenu` supports more complex navigation patterns (dropdown, mega menu, etc.)
    - `type` prop removed, customize styles with CSS
    - Link component not wrapped with Text
    - New sub-components (`Trigger`, `Panel`, `Content`, etc.) enable dropdown menu implementation
    - More granular control and accessibility improvements

### Accessibility

Both libraries provide excellent accessibility:

- `role="navigation"` automatically set
- Arrow key navigation provided by default
- Close dropdown menu with Escape key
- Automatic focus management
- Requires `aria-label` for enhanced screen reader support
