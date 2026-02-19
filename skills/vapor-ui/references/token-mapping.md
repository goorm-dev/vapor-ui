# Figma to Vapor-UI Token Mapping

## Spacing Tokens

Used for: `gap`, `padding`, `margin`

| Pixel Value | Vapor-UI Token |
| ----------- | -------------- |
| 0px         | $000           |
| 2px         | $025           |
| 4px         | $050           |
| 6px         | $075           |
| 8px         | $100           |
| 12px        | $150           |
| 14px        | $175           |
| 16px        | $200           |
| 18px        | $225           |
| 20px        | $250           |
| 24px        | $300           |
| 32px        | $400           |
| 40px        | $500           |
| 48px        | $600           |
| 56px        | $700           |
| 64px        | $800           |
| 72px        | $900           |

## Border Radius Tokens

| Pixel Value | Vapor-UI Token |
| ----------- | -------------- |
| 0px         | $000           |
| 2px         | $050           |
| 4px         | $100           |
| 6px         | $200           |
| 8px         | $300           |
| 12px        | $400           |
| 16px        | $500           |
| 20px        | $600           |
| 24px        | $700           |
| 32px        | $800           |
| 40px        | $900           |

## Dimension Tokens

Used for: `width`, `height`, `minWidth`, `maxWidth`, etc.

| Pixel Value | Token |
| ----------- | ----- |
| 2px         | $025  |
| 4px         | $050  |
| 6px         | $075  |
| 8px         | $100  |
| 12px        | $150  |
| 14px        | $175  |
| 16px        | $200  |
| 18px        | $225  |
| 20px        | $250  |
| 24px        | $300  |
| 32px        | $400  |
| 40px        | $500  |
| 48px        | $600  |
| 56px        | $700  |
| 64px        | $800  |

**Note:** For dimensions outside token range, use raw CSS values (e.g., `width="100%"`, `width="320px"`).

## Background Colors

### Semantic Tokens (backgroundColor prop)

| Figma Variable Path      | Vapor-UI Token    |
| ------------------------ | ----------------- |
| background/primary/100   | $bg-primary-100   |
| background/primary/200   | $bg-primary-200   |
| background/secondary/100 | $bg-secondary-100 |
| background/secondary/200 | $bg-secondary-200 |
| background/success/100   | $bg-success-100   |
| background/success/200   | $bg-success-200   |
| background/warning/100   | $bg-warning-100   |
| background/warning/200   | $bg-warning-200   |
| background/danger/100    | $bg-danger-100    |
| background/danger/200    | $bg-danger-200    |
| background/hint/100      | $bg-hint-100      |
| background/hint/200      | $bg-hint-200      |
| background/contrast/100  | $bg-contrast-100  |
| background/contrast/200  | $bg-contrast-200  |
| background/canvas/100    | $bg-canvas-100    |
| background/canvas/200    | $bg-canvas-200    |
| background/overlay/100   | $bg-overlay-100   |

### Palette Colors

Available for all palettes: blue, cyan, grape, gray, green, lime, orange, pink, red, violet, yellow

| Scale | Token Example   |
| ----- | --------------- |
| 050   | $basic-gray-050 |
| 100   | $basic-gray-100 |
| 200   | $basic-gray-200 |
| 300   | $basic-gray-300 |
| 400   | $basic-gray-400 |
| 500   | $basic-gray-500 |
| 600   | $basic-gray-600 |
| 700   | $basic-gray-700 |
| 800   | $basic-gray-800 |
| 900   | $basic-gray-900 |

## Foreground Colors (color prop)

| Figma Variable Path      | Vapor-UI Token    |
| ------------------------ | ----------------- |
| foreground/primary/100   | $fg-primary-100   |
| foreground/primary/200   | $fg-primary-200   |
| foreground/secondary/100 | $fg-secondary-100 |
| foreground/secondary/200 | $fg-secondary-200 |
| foreground/normal/100    | $fg-normal-100    |
| foreground/normal/200    | $fg-normal-200    |
| foreground/hint/100      | $fg-hint-100      |
| foreground/hint/200      | $fg-hint-200      |
| foreground/inverse       | $fg-inverse       |

## Border Colors (borderColor prop)

| Figma Variable Path | Vapor-UI Token    |
| ------------------- | ----------------- |
| border/primary      | $border-primary   |
| border/secondary    | $border-secondary |
| border/success      | $border-success   |
| border/warning      | $border-warning   |
| border/danger       | $border-danger    |
| border/hint         | $border-hint      |
| border/normal       | $border-normal    |
| border/contrast     | $border-contrast  |

## Usage Example

```tsx
<Box
    $css={{
        padding: '$400', // 32px
        margin: '$200', // 16px
        gap: '$100', // 8px
        backgroundColor: '$bg-gray-100',
        color: '$fg-primary-100',
        borderRadius: '$300', // 8px
        borderColor: '$border-normal',
    }}
>
    Content
</Box>
```

**Note**: All layout/style props must be inside `$css` prop. Direct props like `padding="$400"` are deprecated.
