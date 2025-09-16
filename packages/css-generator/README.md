# @vapor-ui/css-generator

Generate CSS variables and theme styles for Vapor UI design system.

## Installation

```bash
npm install @vapor-ui/css-generator @vapor-ui/color-generator
```

## Quick Start

```typescript
import { generateBrandColorPalette, getSemanticDependentTokens } from '@vapor-ui/color-generator';
import { generateCompleteCSS } from '@vapor-ui/css-generator';

// 1. Generate color data
const brandPalette = generateBrandColorPalette({
    colors: { primary: '#2A6FF3' },
    background: {
        name: 'neutral',
        color: '#F8FAFC',
        lightness: { light: 98, dark: 8 }
    }
});

const semanticTokens = getSemanticDependentTokens({
    primary: { name: 'primary', hex: '#2A6FF3' },
    background: {
        name: 'neutral',
        color: '#F8FAFC',
        lightness: { light: 98, dark: 8 }
    }
});

// 2. Generate complete CSS
const css = generateCompleteCSS(brandPalette, semanticTokens, {
    colors: {
        primary: { name: 'primary', hex: '#2A6FF3' },
        background: { 
            name: 'neutral', 
            hex: '#F8FAFC', 
            lightness: { light: 98, dark: 8 }
        }
    },
    scaling: 1.15,
    radius: 8
});

// 3. Use in your app
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
```

## API Reference

### Individual Generators

```typescript
import { generateColorCSS, generateRadiusCSS, generateScalingCSS } from '@vapor-ui/css-generator';

// Color variables
const colorCSS = generateColorCSS(brandPalette, semanticTokens);

// Scaling variables  
const scalingCSS = generateScalingCSS(1.2);

// Radius variables
const radiusCSS = generateRadiusCSS(8);
```

### Options

```typescript
const css = generateCompleteCSS(brandPalette, semanticTokens, config, {
    prefix: 'custom',           // Default: 'vapor'
    format: 'compact',          // Default: 'readable'
    includeColorComments: true, // Default: false
    classNames: {
        light: 'light-mode',
        dark: 'dark-mode'
    }
});
```

## Output Example

```css
:root {
    --vapor-color-primary-050: #eff6ff;
    --vapor-color-primary-500: #2a6ff3;
    --vapor-color-primary-900: #1e3a8a;
    --vapor-color-background-primary: var(--vapor-color-primary-050);
    --vapor-scale-factor: 1.15;
    --vapor-radius-base: 8px;
}

:root.vapor-dark-theme {
    --vapor-color-background-primary: var(--vapor-color-primary-900);
}
```

## Types

```typescript
import type { 
    CompleteCSSConfig,
    ColorThemeConfig,
    CSSGeneratorOptions,
    ThemeClassNames 
} from '@vapor-ui/css-generator';
```