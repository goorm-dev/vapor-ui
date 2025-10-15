# update-callout

Migrates `Alert` component to `Callout` component.

## Usage

```bash
npx @vapor-ui/codemod update-callout src/
```

## What Changes

| Change Type        | Before       | After                    |
| ------------------ | ------------ | ------------------------ |
| **Component name** | `<Alert>`    | `<Callout.Root>`         |
| **Icon wrapper**   | Direct child | `<Callout.Icon>` wrapper |
| **Prop name**      | `asChild`    | `render`                 |

## Supported Transformations

### 1. Basic Alert with Icon

**Before:**

```tsx
<Alert>
  <InfoIcon />
  This is a basic alert message
</Alert>
```

**After:**

```tsx
<Callout.Root>
  <Callout.Icon>
    <InfoIcon />
  </Callout.Icon>
  This is a basic alert message
</Callout.Root>
```

### 2. Alert with asChild prop

**Before:**

```tsx
<Alert asChild>
  <div>
    <HeartIcon />
    Custom alert with asChild prop
  </div>
</Alert>
```

**After:**

```tsx
<Callout.Root
  render={
    <div>
      <HeartIcon />
      Custom alert with asChild prop
    </div>
  }
/>
```

### 3. Alert without Icon

**Before:**

```tsx
<Alert>Plain text without icon</Alert>
```

**After:**

```tsx
<Callout.Root>Plain text without icon</Callout.Root>
```

### 4. Alert with Dynamic Content

**Before:**

```tsx
<Alert>
  <WarningIcon />
  {message}
</Alert>
```

**After:**

```tsx
<Callout.Root>
  <Callout.Icon>
    <WarningIcon />
  </Callout.Icon>
  {message}
</Callout.Root>
```
