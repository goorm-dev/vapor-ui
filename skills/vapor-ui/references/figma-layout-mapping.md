# Figma Layout to Vapor-UI Mapping

## Auto-Layout Detection

| Figma Property | Value      | Vapor-UI Component |
| -------------- | ---------- | ------------------ |
| layoutMode     | VERTICAL   | VStack             |
| layoutMode     | HORIZONTAL | HStack             |
| layoutMode     | NONE       | Box                |
| layoutGrids    | (present)  | Grid               |

## Direction & Reverse

| Figma layoutMode | reverse prop | Result          |
| ---------------- | ------------ | --------------- |
| VERTICAL         | false        | VStack (column) |
| VERTICAL         | true         | VStack reverse  |
| HORIZONTAL       | false        | HStack (row)    |
| HORIZONTAL       | true         | HStack reverse  |

## Alignment Mapping

### Primary Axis (justifyContent)

| Figma primaryAxisAlignItems | Vapor-UI justifyContent |
| --------------------------- | ----------------------- |
| MIN                         | flex-start              |
| CENTER                      | center                  |
| MAX                         | flex-end                |
| SPACE_BETWEEN               | space-between           |

### Cross Axis (alignItems)

| Figma counterAxisAlignItems | Vapor-UI alignItems |
| --------------------------- | ------------------- |
| MIN                         | flex-start          |
| CENTER                      | center              |
| MAX                         | flex-end            |
| BASELINE                    | baseline            |

## Gap (itemSpacing)

| Figma itemSpacing | Vapor-UI gap |
| ----------------- | ------------ |
| 0                 | $000         |
| 2                 | $025         |
| 4                 | $050         |
| 6                 | $075         |
| 8                 | $100         |
| 12                | $150         |
| 14                | $175         |
| 16                | $200         |
| 18                | $225         |
| 20                | $250         |
| 24                | $300         |
| 32                | $400         |
| 40                | $500         |
| 48                | $600         |
| 56                | $700         |
| 64                | $800         |
| 72                | $900         |

## Padding

| Figma Property | Vapor-UI Prop |
| -------------- | ------------- |
| paddingTop     | paddingTop    |
| paddingBottom  | paddingBottom |
| paddingLeft    | paddingLeft   |
| paddingRight   | paddingRight  |

**Shorthand optimization:**

- If `paddingTop === paddingBottom` → use `paddingY`
- If `paddingLeft === paddingRight` → use `paddingX`
- If all equal → use `padding`

## Grid Layout

When `layoutGrids` is present:

```tsx
<Grid.Root templateColumns="repeat(N, 1fr)" $css={{ gap: '$XXX' }}>
    <Grid.Item colSpan="X">...</Grid.Item>
</Grid.Root>
```

## Conversion Examples

### Figma Node:

```json
{
    "layoutMode": "VERTICAL",
    "itemSpacing": 16,
    "paddingTop": 24,
    "paddingBottom": 24,
    "paddingLeft": 16,
    "paddingRight": 16,
    "primaryAxisAlignItems": "CENTER",
    "counterAxisAlignItems": "MIN"
}
```

### Vapor-UI Output:

```tsx
<VStack
    $css={{
        gap: '$200',
        paddingY: '$300',
        paddingX: '$200',
        justifyContent: 'center',
        alignItems: 'flex-start',
    }}
>
    {children}
</VStack>
```

### Horizontal Layout:

```json
{
    "layoutMode": "HORIZONTAL",
    "itemSpacing": 8,
    "counterAxisAlignItems": "CENTER"
}
```

```tsx
<HStack $css={{ gap: '$100', alignItems: 'center' }}>{children}</HStack>
```
