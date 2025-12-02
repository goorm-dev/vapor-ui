# @vapor-ui/css-generator

Generate CSS variables for Vapor UI design system themes.

## Installation

```bash
npm install @vapor-ui/css-generator @vapor-ui/color-generator
```

> **Note:** This package uses `@vapor-ui/color-generator` internally for color palette generation. Both packages are required.

## Quick Start

> 💡 **Try it first!** You can visually customize and preview themes in the [Theme Playground](https://vapor-ui.goorm.io/playground) before writing any code.

```typescript
import { generateCompleteCSS } from '@vapor-ui/css-generator';

const css = generateCompleteCSS({
    colors: {
        primary: { name: 'mint', hexcode: '#71d378' },
        background: {
            name: 'neutral',
            hexcode: '#f8fafc',
            lightness: { light: 98, dark: 8 },
        },
    },
    scaling: 1.15,
    radius: 'lg',
});
```

## API

### generateCompleteCSS(config, options?)

Generate complete theme CSS with colors, scaling, and radius.

```typescript
import type { BackgroundColor, KeyColor } from '@vapor-ui/color-generator';

interface ColorThemeConfig {
    primary: KeyColor; // { name: string; hexcode: string }
    background: BackgroundColor; // { name: string; hexcode: string; lightness?: { light: number; dark: number } }
    keyColors?: Record<string, string>; // Optional: Override default system key colors (11 colors)
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
    background: {
        name: 'neutral',
        hexcode: '#f8fafc',
        lightness: { light: 98, dark: 8 },
    },
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
- `--{prefix}-color-canvas`: Canvas background color (based on backgroundColor lightness)

### Semantic Color Tokens

- `--{prefix}-color-canvas-100`: Primary canvas background
- `--{prefix}-color-canvas-200`: Secondary canvas background
- `--{prefix}-color-background-primary-100`: Primary background (light)
- `--{prefix}-color-background-primary-200`: Primary background (brand color)
- `--{prefix}-color-background-overlay-100`: Overlay background
- `--{prefix}-color-foreground-100`: Primary text color
- `--{prefix}-color-foreground-200`: Secondary text color
- `--{prefix}-color-foreground-inverse`: Inverse text color (auto-calculated for contrast)
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

```css
:root,
[data-vapor-theme='light'] {
    /* Canvas */
    --vapor-color-canvas: #f5f5f5;

    /* Primitive Palettes (050-900 steps) */
    --vapor-color-mint-050: #e8faea;
    --vapor-color-mint-100: #d1f5d5;
    --vapor-color-mint-200: #a8ebb0;
    --vapor-color-mint-300: #71d378;
    /* ... more palette colors ... */
    --vapor-color-mint-900: #1a4d1e;

    /* Semantic Tokens */
    --vapor-color-canvas-100: var(--vapor-color-canvas);
    --vapor-color-canvas-200: var(--vapor-color-neutral-050);
    --vapor-color-background-primary-100: var(--vapor-color-mint-100);
    --vapor-color-background-primary-200: var(--vapor-color-mint-300);
    --vapor-color-foreground-100: var(--vapor-color-mint-400);
    --vapor-color-foreground-200: var(--vapor-color-mint-500);
    --vapor-color-foreground-inverse: #000000;
    --vapor-color-border-normal: var(--vapor-color-neutral-100);
    --vapor-color-border-primary: var(--vapor-color-mint-300);

    /* System */
    --vapor-scale-factor: 1.15;
    --vapor-radius-factor: 1.5;
}

[data-vapor-theme='dark'] {
    --vapor-color-canvas: #161717;
    --vapor-color-mint-050: #1f3d21;
    /* ... dark mode palette colors ... */
    --vapor-color-canvas-100: var(--vapor-color-canvas);
    --vapor-color-canvas-200: var(--vapor-color-neutral-050);
    /* ... dark mode semantic tokens ... */
}
```
