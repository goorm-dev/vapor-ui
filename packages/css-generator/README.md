# @vapor-ui/css-generator

Generate CSS variables for Vapor UI design system themes.

## Installation

```bash
npm install @vapor-ui/css-generator @vapor-ui/color-generator
```

## Quick Start

```typescript
import { generateCompleteCSS } from '@vapor-ui/css-generator';

const css = generateCompleteCSS({
    colors: {
        primary: { name: 'mint', color: '#6af574ff' },
        background: {
            name: 'neutral',
            color: '#f8fafc',
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
interface CompleteCSSConfig {
    colors: {
        primary: { name: string; color: string };
        background: {
            name: string;
            color: string;
            lightness: { light: number; dark: number };
        };
    };
    scaling: number;
    radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

### generateColorCSS(colorConfig, options?)

Generate color variables only.

```typescript
import type { SemanticMappingConfig } from '@vapor-ui/color-generator';

const colorCSS = generateColorCSS({
    primary: { name: 'mint', color: '#6af574ff' },
    background: { 
        name: 'neutral', 
        color: '#f8fafc', 
        lightness: { light: 98, dark: 8 } 
    },
});
```

### generateScalingCSS(scaling, options?)

Generate scaling variable.

```typescript
const scalingCSS = generateScalingCSS(1.25);
// Output: :root { --vapor-scale-factor: 1.25; }
```

### generateRadiusCSS(radius, options?)

Generate radius variable.

```typescript
type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const radiusCSS = generateRadiusCSS('lg');
// Output: :root { --vapor-radius-factor: 1.5; }
```

## Options

All functions support these options:

```typescript
{
  prefix?: string;                    // Default: 'vapor'
  format?: 'compact' | 'readable';    // Default: 'readable'
  classNames?: {                      // Theme class names
    light: string;                    // Default: 'vapor-light-theme'
    dark: string;                     // Default: 'vapor-dark-theme'
  };
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

### Colors

- `--{prefix}-color-{name}-{050-900}`: Color palettes
- `--{prefix}-color-background-*`: Background colors
- `--{prefix}-color-foreground-*`: Text colors
- `--{prefix}-color-border-*`: Border colors

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
:root {
    --vapor-color-mint-500: #6af574ff;
    --vapor-color-background-canvas: #f8fafc;
    --vapor-scale-factor: 1.15;
    --vapor-radius-factor: 1.5;
}

:root.vapor-dark-theme {
    --vapor-color-mint-800: #62e96b;
    --vapor-color-background-canvas: #161717;
}
```
