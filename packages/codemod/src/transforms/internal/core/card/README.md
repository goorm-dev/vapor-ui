# Card Component Migration Guide

## Component: `Card` ➡️ `Card.Root`

- **Version:** `v0.32.0`
- **Overview:** Migrate the Card component for vapor-ui migration. The basic composition structure is maintained, but the root component name has changed, Card.Title has been removed, and it has changed from semantic HTML to div-based.

---

## 1. Name Change

The composition structure is maintained, but the root component and some sub-component names have changed.

- **Before:** `<Card>` (renders as `article`)
- **After:** `<Card.Root>` (renders as `div` by default, customizable with `render` prop)
- **Note:** `Card.Title` does not exist in the new version, so it will be removed

**Migration:**

- Change `Card` → `Card.Root`
- `Card.Header`, `Card.Body`, `Card.Footer` remain as-is
- `Card.Title` does not exist in the new version - will be removed and replaced with a comment

---

## 2. Usage Change

### Basic Usage

```javascript
// Before
<Card>
  <Card.Header>
    <Card.Title>Basic Template</Card.Title>
  </Card.Header>
  <Card.Body>This is a Basic Template</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>

// After
<Card.Root>
  <Card.Header>
    {/* TODO: Card.Title is removed. Use Text or custom heading component */}
    Basic Template
  </Card.Header>
  <Card.Body>This is a Basic Template</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card.Root>
```

### Card.Title Migration

Card.Title has been removed in the new version. The previous Card.Title was basically rendered as `<Text as={h5} typography="heading5" color="text-normal">`.

```javascript
// Before
<Card.Title>Title Text</Card.Title>

// After Option 1: Remove wrapper, keep children only
Title Text

// After Option 2: Use Text component manually (if needed)
<Text typography="heading5" color="text-normal">Title Text</Text>

// After Option 3: Use custom heading
<h5>Title Text</h5>
```

### Semantic HTML Customization

The new Card renders as `div` by default, but you can maintain semantic HTML using the `render` prop.

```javascript
// Before (automatic semantic HTML)
<Card>  {/* renders as <article> */}
  <Card.Header>  {/* renders as <header> */}
    Header content
  </Card.Header>
  <Card.Body>Body content</Card.Body>
  <Card.Footer>Footer content</Card.Footer>
</Card>

// After (custom semantic HTML with render prop)
<Card.Root render={<article />}>
  <Card.Header render={<header />}>
    Header content
  </Card.Header>
  <Card.Body>Body content</Card.Body>
  <Card.Footer>Footer content</Card.Footer>
</Card.Root>
```

---

## 3. Props Changes

| **Prop**        | **Before**                                            | **After**      | **Change Type** | **Migration Method / Notes**                                                                                                   |
| --------------- | ----------------------------------------------------- | -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `children`      | `ReactNode`                                           | `ReactNode`    | **No Change**   | Children are passed through as-is.                                                                                             |
| `className`     | `string`                                              | `string`       | **No Change**   | Custom style classes work as before.                                                                                           |
| `render`        | (none)                                                | `ReactElement` | **New Prop**    | Replace HTML element with another tag or compose with other components. E.g., `render={<article />}` or `render={<section />}` |
| (Accessibility) | Automatic `aria-labelledby`, `aria-describedby` setup | (removed)      | **Removed**     | The previous version's context-based automatic accessibility setup has been removed. Add aria attributes manually if needed.   |

---

## 4. Sub-components

### Card.Root

The root container of the card.

```javascript
<Card.Root className="custom-card">{/* Card content */}</Card.Root>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering (default: `<div />`)
- `children`: Card content
- All other HTML div attributes

### Card.Header

The header section of the card.

```javascript
<Card.Header>{/* Header content */}</Card.Header>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering (default: `<div />`)
- `children`: Header content

### Card.Body

The body section of the card.

```javascript
<Card.Body>{/* Body content */}</Card.Body>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering (default: `<div />`)
- `children`: Body content

### Card.Footer

The footer section of the card.

```javascript
<Card.Footer>{/* Footer content */}</Card.Footer>
```

**Props:**

- `className`: Custom style class
- `render`: Custom rendering (default: `<div />`)
- `children`: Footer content

---

## 5. Automated Migration

The codemod automatically handles the following changes:

1. **Import Change**: `@goorm-dev/vapor-core` → `@vapor-ui/core`
    - Changes Card import to Card (named import)
    - Automatically merges with existing `@vapor-ui/core` imports

2. **Component Name**: `Card` → `Card.Root`
    - Automatically changes both opening and closing tags
    - Also handles self-closing tags

3. **Sub-components Maintained**:
    - `Card.Header`, `Card.Body`, `Card.Footer` remain as-is

4. **Automatic Card.Title Removal** ⚠️
    - Automatically removes `<Card.Title>` tags and replaces with a comment
    - Children text is preserved

    ```javascript
    // Before
    <Card.Header>
      <Card.Title>Title Text</Card.Title>
    </Card.Header>

    // After (automatic conversion)
    <Card.Header>
      {/* TODO: Card.Title removed - consider using Text component or custom heading */}
      Title Text
    </Card.Header>
    ```

5. **asChild → render prop automatic conversion** ✨
    - Automatically converts `asChild` prop to `render` prop
    - Extracts the first child JSX element as render prop (self-closing form)
    - Preserves child element props in render prop
    - Moves child element's inner content to Card.Root's children

    ```javascript
    // Before
    <Card asChild className="custom-card">
      <article data-testid="card">
        <Card.Body>Content</Card.Body>
      </article>
    </Card>

    // After (automatic conversion)
    <Card.Root render={<article data-testid="card" />} className="custom-card">
      <Card.Body>Content</Card.Body>
    </Card.Root>
    ```

6. **Prop Preservation**:
    - All props (className, etc.) are preserved
    - Expression props are automatically handled

---

## 6. Manual Migration Required

The codemod handles most work automatically, but manual work may be needed for:

1. **Card.Title Replacement**: Since Card.Title is removed, manually replace with Text component or custom heading if needed

    ```javascript
    // After codemod conversion
    <Card.Header>
      {/* TODO: Card.Title removed - consider using Text component or custom heading */}
      Title Text
    </Card.Header>

    // Manual migration option 1: Use Text component
    <Card.Header>
      <Text typography="heading5" color="text-normal">Title Text</Text>
    </Card.Header>

    // Manual migration option 2: Use native heading
    <Card.Header>
      <h5>Title Text</h5>
    </Card.Header>
    ```

2. **Semantic HTML Restoration**: Use `render` prop if semantic HTML is needed instead of default `div`

    ```javascript
    // After codemod conversion (renders as div)
    <Card.Root>
      <Card.Header>
        Header
      </Card.Header>
    </Card.Root>

    // Manually add semantic HTML
    <Card.Root render={<article />}>
      <Card.Header render={<header />}>
        Header
      </Card.Header>
    </Card.Root>
    ```

3. **Accessibility Restoration**: Since previous version's automatic aria attributes are removed, add manually if needed

    ```javascript
    // Manually add accessibility
    <Card.Root aria-labelledby="card-title">
        <Card.Header>
            <h5 id="card-title">Title</h5>
        </Card.Header>
        <Card.Body aria-describedby="card-description">
            <p id="card-description">Description</p>
        </Card.Body>
    </Card.Root>
    ```

---

## 7. Notes

### Design Tokens and Styling

The new Card component is implemented with CSS-in-JS using Vanilla Extract.

**Key changes:**

- Semantic HTML: Uses default `div` (previously: `article`, `header`, etc.)
- However, any semantic HTML can be used through the `render` prop
- Styles are maintained based on design tokens

### Context Removal

The previous version's CardContext (automatic titleId, descriptionId generation) has been removed. Add aria attributes manually if needed.

### Card.Title Removal Reason

Card.Title was essentially a wrapper for `<Text as={h5} typography="heading5" color="text-normal">`. In the new version, it has been removed for a more flexible structure, allowing users to directly choose the Text component or native heading.
