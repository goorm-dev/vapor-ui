# @vapor-ui/css-generator

Generate CSS variables for Vapor UI design system themes.

## Installation

```bash
npm install @vapor-ui/css-generator @vapor-ui/color-generator
```

> **Note:** This package uses `@vapor-ui/color-generator` internally for color palette generation. Both packages are required.

## Quick Start

> **Try it first!** You can visually customize and preview themes in the [Theme Playground](https://vapor-ui.goorm.io/playground) before writing any code.

```typescript
import { generateCompleteCSS } from '@vapor-ui/css-generator';

const css = generateCompleteCSS({
    colors: {
        primary: { name: 'mint', hexcode: '#71d378' },
    },
    scaling: 1.15,
    radius: 'lg',
});
```

## API

### generateCompleteCSS(config, options?)

Generate complete theme CSS with colors, scaling, and radius.

```typescript
import type { KeyColor, ThemeOptions } from '@vapor-ui/color-generator';

interface ColorThemeConfig {
    primary: KeyColor; // { name: string; hexcode: string }
    basicColors?: ThemeOptions['basicColors']; // Optional: add colors or replace a base color of the same name
}

interface CompleteCSSConfig {
    colors: ColorThemeConfig;
    scaling: number;
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

### generateColorCSS(colorConfig, options?)

Generate color variables only. This includes primitive color palettes and semantic tokens.

```typescript
import { generateColorCSS } from '@vapor-ui/css-generator';

const colorCSS = generateColorCSS({
    primary: { name: 'mint', hexcode: '#71d378' },
});
```

### generateScalingCSS(scaling, options?)

Generate scaling variable.

```typescript
const scalingCSS = generateScalingCSS(1.25);
// Output: :root, [data-vapor-theme=light] { --vapor-scale-factor: 1.25; }
```

### generateRadiusCSS(radius, options?)

Generate radius variable.

```typescript
type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const radiusCSS = generateRadiusCSS('lg');
// Output: :root, [data-vapor-theme=light] { --vapor-radius-factor: 1.5; }
```

## Options

All functions support these options:

```typescript
{
  prefix?: string;                    // Default: 'vapor'
  format?: 'compact' | 'readable';    // Default: 'readable'
}
```

### Additional options for generateCompleteCSS:

```typescript
{
  includeColorComments?: boolean;     // Default: false
}
```

## Examples

### Custom options

```typescript
const css = generateCompleteCSS(config, {
    prefix: 'my-theme',
    format: 'compact',
    includeColorComments: true,
});
```

### Individual generators

```typescript
import { generateColorCSS, generateRadiusCSS, generateScalingCSS } from '@vapor-ui/css-generator';

const colorCSS = generateColorCSS(colorConfig);
const scalingCSS = generateScalingCSS(1.2);
const radiusCSS = generateRadiusCSS('xl');
```

## Generated Variables

### Primitive Color Palettes

- `--{prefix}-color-{name}-{050-900}`: Color palettes (10 steps per color)
- `--{prefix}-color-gray-{000-900}`: Gray palette (12 steps, including 000 and 025)
- `--{prefix}-color-canvas`: Canvas background color (gray 000 in light, gray 025 in dark)

Backgrounds are fixed: light `#FFFFFF`, dark `#232323`. See `@vapor-ui/color-generator`.

### Semantic Color Tokens

- `--{prefix}-color-background-canvas-100`: Page background
- `--{prefix}-color-background-canvas-200`: Secondary page background
- `--{prefix}-color-background-overlay-100`: Overlay background
- `--{prefix}-color-background-primary-100`: Light primary background
- `--{prefix}-color-background-primary-200`: Primary fill (the brand cell in light)
- `--{prefix}-color-foreground-primary-100`: Primary text and icons
- `--{prefix}-color-foreground-primary-200`: Stronger primary text and icons
- `--{prefix}-color-foreground-inverse`: Inverse text color (white in light, black in dark)
- `--{prefix}-color-foreground-onPrimary`: Text and icons on the primary fill (white when it reaches 4.5:1, else black; provisional name)
- `--{prefix}-color-border-normal`: Normal border color
- `--{prefix}-color-border-primary`: Primary border color

### Other

- `--{prefix}-scale-factor`: Typography scale
- `--{prefix}-radius-factor`: Border radius factor

## Radius Values

The `generateRadiusCSS` function accepts predefined radius keys:

- `'none'`: 0
- `'sm'`: 0.5
- `'md'`: 1
- `'lg'`: 1.5
- `'xl'`: 2
- `'full'`: 3

## Output Example

`generateCompleteCSS` with the Quick Start config:

```css
:root,
[data-vapor-theme='light'] {
    --vapor-color-canvas: #ffffff;
    --vapor-color-white: #ffffff;
    --vapor-color-black: #000000;
    /* ... base and gray palettes ... */
    --vapor-color-mint-100: #c2edb4;
    --vapor-color-mint-200: #71d378;
    --vapor-color-mint-300: #5ac24e;
    /* ... mint 400–800 ... */
    --vapor-color-mint-900: #002d0c;
    --vapor-color-mint-050: #e0f7d8;
    --vapor-color-background-primary-100: var(--vapor-color-mint-100);
    --vapor-color-background-primary-200: var(--vapor-color-mint-200);
    --vapor-color-border-primary: var(--vapor-color-mint-200);
    --vapor-color-border-normal: var(--vapor-color-gray-100);
    --vapor-color-foreground-primary-100: var(--vapor-color-mint-300);
    --vapor-color-foreground-primary-200: var(--vapor-color-mint-400);
    --vapor-color-background-canvas-100: var(--vapor-color-gray-000);
    --vapor-color-background-canvas-200: var(--vapor-color-gray-050);
    --vapor-color-background-overlay-100: var(--vapor-color-gray-000);
    --vapor-color-foreground-inverse: var(--vapor-color-white);
    --vapor-color-foreground-onPrimary: var(--vapor-color-black);
    --vapor-scale-factor: 1.15;
    --vapor-radius-factor: 1.5;
}

[data-vapor-theme='dark'] {
    --vapor-color-canvas: #232323;
    /* ... dark palettes ... */
    --vapor-color-background-primary-100: var(--vapor-color-mint-050);
    --vapor-color-background-primary-200: var(--vapor-color-mint-700);
    /* ... dark semantic tokens ... */
}
```
