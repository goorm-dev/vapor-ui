# Breadcrumb Migration Guide

⚠️ If you are using the component as Breadcrumbs in `@goorm-dev/vapor-core`, manually change the component name to Breadcrumb first, then run the CLI.

## Package Change
- **Before**: `@goorm-dev/vapor-core`
- **After**: `@vapor-ui/core`

## Component Structure Changes

### Root Component
- **Before**: `<Breadcrumb>`
- **After**: `<Breadcrumb.Root>`

### Automatic Structure Conversion
The codemod automatically handles the following structure changes:

1. **List Wrapping**: Items are automatically wrapped with `<Breadcrumb.List>`
2. **Link Wrapping**: Items with `href` prop are converted to `<Breadcrumb.Item><Breadcrumb.Link></Breadcrumb.Item>` structure
3. **Separator Insertion**: `<Breadcrumb.Separator />` is automatically inserted between items

## Prop Changes

### Size Prop
- **Before**: `size="xs"`
- **After**: `size="sm"` (xs is mapped to sm)
- Other sizes (sm, md, lg) remain unchanged

### Active State
- **Before**: `<Breadcrumb.Item active>` or `<Breadcrumb.Item active={expression}>`
- **After**: `<Breadcrumb.Link current>` (inside Item)

### Href Prop
- **Before**: `<Breadcrumb.Item href="/path">`
- **After**: `<Breadcrumb.Item><Breadcrumb.Link href="/path"></Breadcrumb.Item>`

## Migration Examples

### Basic Example

**Before**:
```typescript
import { Breadcrumb } from '@goorm-dev/vapor-core';

<Breadcrumb size="md">
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
  <Breadcrumb.Item active>Components</Breadcrumb.Item>
</Breadcrumb>
```

**After**:
```typescript
import { Breadcrumb } from '@vapor-ui/core';

<Breadcrumb.Root size="md">
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/docs">Docs</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link current>Components</Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

### Size Change Example

**Before**:
```typescript
<Breadcrumb size="xs">
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
</Breadcrumb>
```

**After**:
```typescript
<Breadcrumb.Root size="sm">
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

### With Expression (Runtime Value)

**Before**:
```typescript
const isActive = true;

<Breadcrumb size="md">
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item active={isActive}>Current</Breadcrumb.Item>
</Breadcrumb>
```

**After**:
```typescript
<Breadcrumb.Root size="md">
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Link current>Current</Breadcrumb.Link>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

> **Note**: When an expression is used for the `active` prop (e.g., `active={isActive}`), the value cannot be determined at build time, so the codemod always converts it to the `current` prop without the expression.

## Key Changes

1. **Component Structure**: The flat structure has changed to a nested structure requiring `Breadcrumb.List`, `Breadcrumb.Item`, and `Breadcrumb.Link`
2. **Automatic Separator Removal**: Separator is no longer automatically inserted and must be explicitly added (codemod handles this automatically)
3. **Item Props**: `href` and `active` props have moved from `Item` to `Link` component
4. **Size Value**: `xs` size is no longer supported and is mapped to `sm`

## Automatic Migration

Run the codemod to automatically migrate:

```bash
npx @vapor-ui/codemod transform internal/core/breadcrumb <path>
```

The codemod handles:
- ✅ Import changes
- ✅ Component name change (Breadcrumb → Breadcrumb.Root)
- ✅ List wrapping
- ✅ Link wrapping and href/current prop movement
- ✅ Separator insertion
- ✅ Size prop mapping (xs → sm)
- ✅ Active prop to current prop conversion
- ✅ Other attribute preservation (className, etc.)

## Manual Review Required

After running the codemod, check the following:

1. **Expression-based active prop**: The codemod converts all `active` props to `current`, but cannot evaluate expressions at build time
2. **Custom Styling**: Verify that custom styling adjustments for the new structure are needed
3. **Test Coverage**: Confirm that all Breadcrumb features work as expected
