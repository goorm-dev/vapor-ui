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
    primary: { name: 'blue', hex: '#2563eb' },
    background: { 
      name: 'neutral', 
      hex: '#f8fafc', 
      lightness: { light: 98, dark: 8 }
    }
  },
  scaling: 1.15,
  radius: 8
});

console.log(css); // Add to your CSS
```

## API

### generateCompleteCSS(config, options?)

Generate complete theme CSS with colors, scaling, and radius.

```typescript
interface CompleteCSSConfig {
  colors: {
    primary: { name: string; hex: string };
    background: { 
      name: string; 
      hex: string; 
      lightness: { light: number; dark: number };
    };
  };
  scaling: number;
  radius: number;
}
```

### generateColorCSS(colorConfig, options?)

Generate color variables only.

```typescript
const colorCSS = generateColorCSS({
  primary: { name: 'blue', hex: '#2563eb' },
  background: { name: 'neutral', hex: '#f8fafc', lightness: { light: 98, dark: 8 }}
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
const radiusCSS = generateRadiusCSS(8);
// Output: :root { --vapor-radius-base: 8px; }
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

### Additional options for generateRadiusCSS:
```typescript
{
  unit?: 'px' | 'rem';               // Default: 'px'
}
```

## Examples

### Custom options
```typescript
const css = generateCompleteCSS(config, {
  prefix: 'my-theme',
  format: 'compact',
  includeColorComments: true
});
```

### Individual generators
```typescript
import { generateColorCSS, generateScalingCSS, generateRadiusCSS } from '@vapor-ui/css-generator';

const colorCSS = generateColorCSS(colorConfig);
const scalingCSS = generateScalingCSS(1.2);
const radiusCSS = generateRadiusCSS(12, { unit: 'rem' });
```

## Generated Variables

### Colors
- `--{prefix}-color-{name}-{050-900}`: Color palettes
- `--{prefix}-color-background-*`: Background colors
- `--{prefix}-color-foreground-*`: Text colors
- `--{prefix}-color-border-*`: Border colors

### Other
- `--{prefix}-scale-factor`: Typography scale
- `--{prefix}-radius-base`: Border radius

## Output Example

```css
:root {
  --vapor-color-primary-500: #2563eb;
  --vapor-color-background-canvas: #f8fafc;
  --vapor-scale-factor: 1.15;
  --vapor-radius-base: 8px;
}

:root.vapor-dark-theme {
  --vapor-color-primary-500: #417af0;
  --vapor-color-background-canvas: #161717;
}
```