# Figma to Vapor-UI Token Mapping

## Spacing Tokens

Used for: `gap`, `padding`, `margin`

| Pixel Value | Vapor-UI Token |
|-------------|----------------|
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

### Approximate Matching

For non-exact values, round to nearest:

| Range     | Token |
|-----------|-------|
| 0-1px     | $000  |
| 2-3px     | $025  |
| 4-5px     | $050  |
| 6-7px     | $075  |
| 8-10px    | $100  |
| 11-13px   | $150  |
| 14-15px   | $175  |
| 16-17px   | $200  |
| 18-19px   | $225  |
| 20-22px   | $250  |
| 23-28px   | $300  |
| 29-36px   | $400  |
| 37-44px   | $500  |
| 45-52px   | $600  |
| 53-60px   | $700  |
| 61-68px   | $800  |
| 69+px     | $900  |

## Border Radius Tokens

| Pixel Value | Vapor-UI Token |
|-------------|----------------|
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
|-------------|-------|
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

| Figma Variable Path      | Vapor-UI Token  |
|--------------------------|-----------------|
| background/primary/100   | primary-100     |
| background/primary/200   | primary-200     |
| background/secondary/100 | secondary-100   |
| background/secondary/200 | secondary-200   |
| background/success/100   | success-100     |
| background/success/200   | success-200     |
| background/warning/100   | warning-100     |
| background/warning/200   | warning-200     |
| background/danger/100    | danger-100      |
| background/danger/200    | danger-200      |
| background/hint/100      | hint-100        |
| background/hint/200      | hint-200        |
| background/contrast/100  | contrast-100    |
| background/contrast/200  | contrast-200    |
| background/canvas/100    | canvas-100      |
| background/canvas/200    | canvas-200      |
| background/overlay/100   | overlay-100     |

### Palette Colors

Available for all palettes: blue, cyan, grape, gray, green, lime, orange, pink, red, violet, yellow

| Scale | Token Example |
|-------|---------------|
| 050   | gray-050      |
| 100   | gray-100      |
| 200   | gray-200      |
| 300   | gray-300      |
| 400   | gray-400      |
| 500   | gray-500      |
| 600   | gray-600      |
| 700   | gray-700      |
| 800   | gray-800      |
| 900   | gray-900      |

## Foreground Colors (color prop)

| Figma Variable Path      | Vapor-UI Token  |
|--------------------------|-----------------|
| foreground/primary/100   | primary-100     |
| foreground/primary/200   | primary-200     |
| foreground/secondary/100 | secondary-100   |
| foreground/secondary/200 | secondary-200   |
| foreground/normal/100    | normal-100      |
| foreground/normal/200    | normal-200      |
| foreground/hint/100      | hint-100        |
| foreground/hint/200      | hint-200        |
| foreground/inverse       | inverse         |

## Border Colors (borderColor prop)

| Figma Variable Path | Vapor-UI Token |
|---------------------|----------------|
| border/primary      | primary        |
| border/secondary    | secondary      |
| border/success      | success        |
| border/warning      | warning        |
| border/danger       | danger         |
| border/hint         | hint           |
| border/normal       | normal         |
| border/contrast     | contrast       |

## Usage Example

```tsx
<Box
  padding="$400"           // 32px
  margin="$200"            // 16px
  gap="$100"               // 8px
  backgroundColor="gray-100"
  color="primary-100"
  borderRadius="$300"      // 8px
  borderColor="normal"
>
  Content
</Box>
```
