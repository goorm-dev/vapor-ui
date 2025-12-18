# Tabs Component Migration Guide

## Component: `Tabs` ➡️ `Tabs.Root` + `Tabs.Trigger` + `Tabs.Indicator`

- **Version:** v0.33.0
- **Overview:** Migrate the Tabs component for vapor-ui migration. The Radix UI-based Tabs structure changes to a Base UI-based Tabs structure, where Tabs.Button changes to Tabs.Trigger and Tabs.Indicator is newly added.

---

## 1. Name Change

The entire component structure changed from Tabs to Tabs.Root + Tabs.Trigger.

- **Before:** `<Tabs>` (Radix UI-based)
- **After:** `<Tabs.Root>` (Base UI-based)
- ⚠️**Note:** `Tabs.Button` → changed to `Tabs.Trigger`
- ⚠️**Note:** `Tabs.Indicator` must be automatically added to Tabs.List
- ⚠️**Note:** `Tabs.Panel` name maintained (usage same)
- ⚠️**Note:** `direction` → prop name changed to `orientation`
- ⚠️**Note:** `hasBorder`, `stretch`, `position`, `align` props removed

---

## 2. Usage Change

### Basic Usage

```typescript
// Before
import Tabs from '@goorm-dev/vapor-core';

<Tabs
  size="md"
  direction="horizontal"
  stretch={false}
  position="start"
  defaultValue="tab1"
>
  <Tabs.List hasBorder={true}>
    <Tabs.Button value="tab1" align="left">Tab 1</Tabs.Button>
    <Tabs.Button value="tab2" align="center">Tab 2</Tabs.Button>
    <Tabs.Button value="tab3" disabled>Tab 3</Tabs.Button>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
  <Tabs.Panel value="tab3">Content 3</Tabs.Panel>
</Tabs>

// After
import { Tabs } from '@vapor-ui/core';

<Tabs.Root
  size="md"
  orientation="horizontal"
  defaultValue="tab1"
>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
    <Tabs.Trigger value="tab3" disabled>Tab 3</Tabs.Trigger>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
  <Tabs.Panel value="tab3">Content 3</Tabs.Panel>
</Tabs.Root>
```

### Controlled Mode

```typescript
// Before
import Tabs from '@goorm-dev/vapor-core';

const [value, setValue] = useState('tab1');

<Tabs value={value} onValueChange={setValue}>
  <Tabs.List>
    <Tabs.Button value="tab1">Tab 1</Tabs.Button>
    <Tabs.Button value="tab2">Tab 2</Tabs.Button>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>

// After
import { Tabs } from '@vapor-ui/core';

const [value, setValue] = useState('tab1');

<Tabs.Root value={value} onValueChange={setValue}>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs.Root>
```

---

## 3. Props Changes

### Tabs.Root Props (formerly Tabs)

| **Prop**          | **Before**                                             | **After**                                              | **Change Type**      | **Migration Method / Notes**                |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------ | -------------------- | ------------------------------------------- |
| `direction`       | `'horizontal' \| 'vertical'` (default: `'horizontal'`) | (renamed)                                              | **Renamed**          | Changed to `orientation`                    |
| `orientation`     | (none)                                                 | `'horizontal' \| 'vertical'` (default: `'horizontal'`) | **New Prop**         | Layout direction                            |
| `stretch`         | `boolean` (default: `false`)                           | (removed)                                              | **Removed**          | Customize with CSS                          |
| `position`        | `'start' \| 'center'` (default: `'start'`)             | (removed)                                              | **Removed**          | Customize with CSS                          |
| `value`           | `string`                                               | `string`                                               | **No Change**        | Current selected value in controlled mode   |
| `defaultValue`    | `string`                                               | `string`                                               | **No Change**        | Initial selected value in uncontrolled mode |
| `onValueChange`   | `(value: string) => void`                              | `(value: string, event: Event) => void`                | **Signature change** | event parameter added                       |
| `disabled`        | (none)                                                 | `boolean`                                              | **New Prop**         | Disable all tabs                            |
| `activateOnFocus` | (none)                                                 | `boolean` (default: `false`)                           | **New Prop**         | Auto-activate on focus                      |
| `loop`            | (none)                                                 | `boolean` (default: `true`)                            | **New Prop**         | Keyboard navigation loop                    |
| `variant`         | (none)                                                 | `'line' \| 'plain'` (default: `'line'`)                | **New Prop**         | Tab style variant                           |

### Tabs.List Props

| **Prop**    | **Before**                  | **After** | **Change Type** | **Migration Method / Notes**                 |
| ----------- | --------------------------- | --------- | --------------- | -------------------------------------------- |
| `hasBorder` | `boolean` (default: `true`) | (removed) | **Removed**     | Replaced with `variant="line"` (set on Root) |
| `loop`      | `boolean` (default: `true`) | (removed) | **Removed**     | Moved to Root's `loop` prop                  |

### Tabs.Trigger Props (formerly Tabs.Button)

| **Prop**   | **Before**          | **After**           | **Change Type** | **Migration Method / Notes** |
| ---------- | ------------------- | ------------------- | --------------- | ---------------------------- |
| `value`    | `string` (required) | `string` (required) | **No Change**   | Tab value                    |
| `disabled` | `boolean`           | `boolean`           | **No Change**   | Disable individual tab       |

### Tabs.Panel Props

| **Prop**     | **Before**          | **After**           | **Change Type** | **Migration Method / Notes**                             |
| ------------ | ------------------- | ------------------- | --------------- | -------------------------------------------------------- |
| `value`      | `string` (required) | `string` (required) | **No Change**   | Panel value                                              |
| `forceMount` | `boolean`           | (removed)           | **Removed**     | Handle with CSS if always mounted needed (display: none) |
| `hidden`     | `boolean`           | (removed)           | **Removed**     | Customize with CSS                                       |

---

## 4. Sub-components

### Tabs.Root

Root container of Tabs. Provides state management and Context.

```typescript
<Tabs.Root
  size="md"
  orientation="horizontal"
  value={value}
  onValueChange={setValue}
  variant="line"
>
  {/* Tabs.List and Tabs.Panel */}
</Tabs.Root>
```

**Props:**

- `size`: Tab size ('sm' | 'md' | 'lg' | 'xl')
- `orientation`: Layout direction ('horizontal' | 'vertical')
- `value`, `onValueChange`, `defaultValue`: State control props
- `disabled`: Disable all tabs (boolean)
- `variant`: Tab style variant ('line' | 'plain')
- `activateOnFocus`, `loop`: Keyboard navigation options

### Tabs.List

Container that wraps tab buttons.

```typescript
<Tabs.List>
  <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
  <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  <Tabs.Indicator />
</Tabs.List>
```

**⚠️ Note:** Must include `Tabs.Indicator` inside Tabs.List.

### Tabs.Trigger (formerly Tabs.Button)

Individual tab button.

```typescript
<Tabs.Trigger value="tab1" disabled={false}>
  Tab 1
</Tabs.Trigger>
```

**Props:**

- `value`: Tab value (string, required)
- `disabled`: Disable individual tab (boolean)

### Tabs.Indicator

**New component**: Visual indicator that shows the selected tab.

```typescript
<Tabs.Indicator />
```

**⚠️ Important:** Must be included at the end inside Tabs.List.

### Tabs.Panel

Tab content panel. Used the same as before.

```typescript
<Tabs.Panel value="tab1">
  Content for Tab 1
</Tabs.Panel>
```

**Props:**

- `value`: Panel value (string, required)

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes `Tabs` default import to `{ Tabs }` named import
    - Automatically merges with existing `@vapor-ui/core` imports
    - Removes duplicate imports

2. **Component Name**: `Tabs` → `Tabs.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Props Automatic Conversion**:
    - `direction` → `orientation`
    - `hasBorder={true}` → `variant="line"` (added to Root)
    - `hasBorder={false}` → `variant="plain"` (added to Root)
    - Removes `hasBorder`, `stretch`, `position`, `align` props

4. **Structure Conversion**:
    - `Tabs.Button` → `Tabs.Trigger`
    - Automatically adds `<Tabs.Indicator />` inside `Tabs.List`
    - Handles both opening and closing tags

5. **Props Preservation**:
    - Automatically preserves all other props (className, data-_, aria-_, etc.)
    - Handles props using spread operator

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **stretch prop usage**: Since stretch has been removed, customize with CSS.

    ```css
    .tabs-list {
        width: 100%;
    }
    .tabs-trigger {
        flex: 1;
    }
    ```

2. **position prop usage**: Since position has been removed, adjust alignment with CSS.

    ```css
    .tabs-list {
        justify-content: center; /* position="center" */
    }
    ```

3. **align prop usage**: Since align has been removed, adjust text alignment with CSS.

    ```css
    .tabs-trigger {
        text-align: center; /* align="center" */
    }
    ```

4. **forceMount + hidden combination**: To keep always mounted while hidden, use CSS.

    ```typescript
    // Before
    <Tabs.Panel value="tab1" forceMount hidden={activeTab !== 'tab1'}>
      Content
    </Tabs.Panel>

    // After (handle with CSS)
    <Tabs.Panel value="tab1" style={{ display: activeTab !== 'tab1' ? 'none' : 'block' }}>
      Content
    </Tabs.Panel>
    ```

5. **activationMode="manual"**: Base UI defaults to manual, so no separate setting needed. For automatic activation, use `activateOnFocus={true}`.

---

## 7. Notes

### Base UI Transition (Radix UI → Base UI)

The new Tabs component has transitioned from **Radix UI Tabs** to **Base UI Tabs**.

**Key Changes:**

1. **Base Library**:
    - Before: `@radix-ui/react-tabs`
    - After: `@base-ui-components/react`'s Tabs

2. **Component Structure**:
    - **Radix UI**: Tabs + TabsList + Trigger + TabsContent
    - **Base UI**: Tabs.Root + Tabs.List + Tabs.Tab (Trigger) + Tabs.Indicator + Tabs.Panel

3. **Indicator Addition**:
    - Base UI provides `Tabs.Indicator` component to visually show the selected tab
    - Used to represent animated underline or background

4. **Context Usage**:
    - Both use Context API, but Base UI provides more flexible state management

5. **Styling**:
    - CSS-in-JS using Vanilla Extract
    - Design token-based styling maintained

### Accessibility

Both libraries provide excellent accessibility:

- `role="tablist"`, `role="tab"`, `role="tabpanel"` automatically set
- Arrow key navigation provided by default
- Select with Space and Enter keys
- Automatic focus management
- `aria-selected`, `aria-controls` automatically set
