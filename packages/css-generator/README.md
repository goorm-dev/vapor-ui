# @vapor-ui/css-generator

CSS generator for Vapor UI theme system. Generates CSS variables and theme styles from color palettes and design tokens.

## Installation

```bash
npm install @vapor-ui/css-generator
```

## Usage

### Color CSS Generation

```typescript
import { generateColorCSS } from '@vapor-ui/css-generator';
import { generateBrandColorPalette, getSemanticDependentTokens } from '@vapor-ui/color-generator';

// Generate color palettes
const brandPalette = generateBrandColorPalette(/* config */);
const semanticTokens = getSemanticDependentTokens(/* config */);

// Generate CSS
const colorCSS = generateColorCSS(brandPalette, semanticTokens, {
    prefix: 'vapor',
    format: 'readable',
    classNames: {
        light: 'vapor-light-theme',
        dark: 'vapor-dark-theme'
    }
});

console.log(colorCSS.lightTheme);
console.log(colorCSS.darkTheme);
```

### Complete Theme Generation

```typescript
import { generateCompleteTheme } from '@vapor-ui/css-generator';

const completeCSS = generateCompleteTheme(
    brandPalette,
    semanticTokens,
    {
        colors: {
            primary: { name: 'blue', hex: '#2A6FF3' },
            background: { 
                name: 'gray', 
                hex: '#F8FAFC', 
                lightness: { light: 98, dark: 8 }
            }
        },
        scaling: 1.15,
        radius: 8
    },
    {
        includeColorComments: true,
        format: 'readable'
    }
);
```

### Individual Generators

```typescript
import { generateScalingCSS, generateRadiusCSS } from '@vapor-ui/css-generator';

// Generate scaling CSS
const scalingCSS = generateScalingCSS(1.2, {
    prefix: 'vapor',
    format: 'readable'
});

// Generate radius CSS
const radiusCSS = generateRadiusCSS(8, {
    prefix: 'vapor',
    format: 'readable',
    unit: 'px'
});
```

## API

### Types

- `ColorThemeConfig` - Configuration for color themes
- `CompleteThemeConfig` - Complete theme configuration
- `GeneratedColorCSS` - Generated color CSS result
- `CSSGeneratorOptions` - Options for CSS generation

### Functions

- `generateColorCSS()` - Generate color CSS variables
- `generateScalingCSS()` - Generate scaling CSS variables
- `generateRadiusCSS()` - Generate radius CSS variables
- `generateCompleteTheme()` - Generate complete theme CSS

## Output Example

```css
:root {
    --vapor-color-blue-050: #eff6ff;
    --vapor-color-blue-500: #2a6ff3;
    --vapor-color-blue-900: #1e3a8a;
    --vapor-color-background-primary: var(--vapor-color-blue-50);
    --vapor-scale-factor: 1.15;
    --vapor-radius-base: 8px;
}

:root.vapor-dark-theme {
    --vapor-color-background-primary: var(--vapor-color-blue-900);
}
```