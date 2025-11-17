# @vapor-ui/color-generator

A powerful, WCAG-compliant color palette generator built on Adobe Leonardo, designed for design systems that prioritize accessibility and perceptual uniformity.

## Features

- **WCAG-Compliant**: All generated colors meet accessibility standards with guaranteed contrast ratios
- **Perceptually Uniform**: Colors use OKLCH color space for visually even distribution
- **Atomic Themes**: Ensures color consistency across entire themes to maintain accessibility
- **Leonardo Integration**: Leverages Adobe Leonardo's contrast-based color generation
- **Flexible Customization**: Support for brand colors and custom backgrounds
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
pnpm add @vapor-ui/color-generator
```

## Quick Start

```typescript
import {
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
} from '@vapor-ui/color-generator';

// Generate default palette (11 colors: red, blue, gray, etc.)
const theme = generatePrimitiveColorPalette();

// Map to semantic tokens
const semantic = getSemanticDependentTokens(theme);

console.log(semantic.lightModeTokens['color-background-primary-100']); // #d9ecff
console.log(semantic.darkModeTokens['color-background-primary-100']); // #003666
```

## Core Concepts

### Leonardo Adapter

The Leonardo Adapter wraps Adobe Leonardo's contrast-based color generation to ensure:

- **Guaranteed Contrast Ratios**: Every color step maintains precise contrast against the reference background
- **Duo-Key Generation**: Automatically generates richer color scales from single key colors
- **DeltaE Calculation**: Provides color difference metrics for brand color matching
- **Perceptual Uniformity**: Uses OKLCH color space for human-perception-aligned results

### Atomic Theme Principle

**Critical**: Themes must be treated atomically. Partial overrides are forbidden to maintain WCAG compliance.

**Why?** Leonardo generates colors relative to a specific reference background. If you change the background color but keep the original palette, the contrast ratios break and WCAG compliance is lost.

**Solution**: When customizing background or brand colors, `generatePrimitiveColorPalette` regenerates the entire theme with the new reference background, ensuring all colors maintain proper contrast ratios.

```typescript
// ❌ WRONG: Partial override breaks accessibility
const theme = generatePrimitiveColorPalette(); // White background
// Later: Override only background to beige - red-500 no longer guarantees 4.5:1 contrast

// ✅ CORRECT: Atomic theme regeneration
const theme = generatePrimitiveColorPalette({
    backgroundColor: { name: 'beige', hexcode: '#FDF7E0' },
});
// All colors recalculated for beige background - contrast ratios maintained
```

### WCAG Compliance

The default contrast ratio scale ensures accessibility:

```typescript
{
  '050': 1.07,  // Subtle backgrounds
  '100': 1.3,
  '200': 1.7,
  '300': 2.5,
  '400': 3.0,
  '500': 4.5,   // WCAG AA Normal Text
  '600': 6.5,
  '700': 8.5,   // WCAG AAA Normal Text
  '800': 11.5,
  '900': 15.0   // Maximum contrast
}
```

## API Reference

### `generatePrimitiveColorPalette(options?)`

Generates all primitive color tokens for a design system.

#### Parameters

**`options.keyColors?: Record<string, string>`**

- Override the 11 default system colors
- Default: `DEFAULT_KEY_COLORS` (red, pink, grape, violet, blue, cyan, green, lime, yellow, orange, gray)

**`options.brandColor?: { name: string, hexcode: string }`**

- Add a custom brand palette (e.g., `{ name: 'mint', hexcode: '#00BEEF' }`)
- Uses Brand Color Swap to preserve exact brand color at closest deltaE step

**`options.backgroundColor?: { name: string, hexcode: string }`**

- Customize the reference background color
- Default: `{ name: 'gray', hexcode: '#FFFFFF' }`
- Automatically generates an additional palette if name is not in default colors

**`options.contrastRatios?: Record<string, number>`**

- Override contrast ratio values for each step (050-900)
- Default: `DEFAULT_CONTRAST_RATIOS`

#### Returns

`ThemeResult` containing:

- `lightModeTokens`: Palettes for light mode (lightness: 100)
- `darkModeTokens`: Palettes for dark mode (lightness: 14)
- `baseTokens`: color-white and color-black

#### Examples

```typescript
// Default: 11 palettes (111 color chips)
const basic = generatePrimitiveColorPalette();

// With brand color: 12 palettes (121 color chips)
const branded = generatePrimitiveColorPalette({
    brandColor: { name: 'mint', hexcode: '#00BEEF' },
});

// With custom background: 12 palettes (121 color chips)
const themed = generatePrimitiveColorPalette({
    backgroundColor: { name: 'beige', hexcode: '#FDF7E0' },
});

// With both: 13 palettes (131 color chips)
const full = generatePrimitiveColorPalette({
    brandColor: { name: 'mint', hexcode: '#00BEEF' },
    backgroundColor: { name: 'beige', hexcode: '#FDF7E0' },
});

// Access palette data
console.log(full.lightModeTokens.palettes.find((p) => p.name === 'mint'));
console.log(full.lightModeTokens.backgroundCanvas); // { name: 'color-background-canvas', hex: '#fcf6df', ... }
console.log(full.baseTokens['color-white']); // { name: 'color-white', hex: '#ffffff', ... }
```

### `getSemanticDependentTokens(themeResult, primaryColorName?, canvasColorName?)`

Maps primitive palettes to semantic tokens used in applications.

#### Parameters

- **`themeResult`**: Output from `generatePrimitiveColorPalette`
- **`primaryColorName`**: Color to use for primary semantic tokens (default: `'blue'`)
- **`canvasColorName`**: Color to use for canvas semantic tokens (default: `'gray'`)

#### Returns

`SemanticResult` containing `lightModeTokens` and `darkModeTokens` with semantic token mappings:

```typescript
{
  'color-background-primary-100': string;   // Subtle primary background
  'color-background-primary-200': string;   // Strong primary background
  'color-border-primary': string;           // Primary border color
  'color-foreground-100': string;           // Primary text (AA)
  'color-foreground-200': string;           // Primary text (AAA)
  'color-background-canvas-100': string;    // Main canvas background
  'color-background-canvas-200': string;    // Elevated canvas background
  'color-background-overlay-100': string;   // Overlay/modal background
}
```

#### Examples

```typescript
// Use default blue as primary
const semantic = getSemanticDependentTokens(theme);

// Use brand color as primary
const brandedTheme = generatePrimitiveColorPalette({
    brandColor: { name: 'mint', hexcode: '#00BEEF' },
});
const brandedSemantic = getSemanticDependentTokens(brandedTheme, 'mint');

// Use custom background and brand primary
const fullTheme = generatePrimitiveColorPalette({
    brandColor: { name: 'mint', hexcode: '#00BEEF' },
    backgroundColor: { name: 'beige', hexcode: '#FDF7E0' },
});
const fullSemantic = getSemanticDependentTokens(fullTheme, 'mint', 'beige');

// Use tokens in application
const Button = styled.button`
    background-color: ${fullSemantic.lightModeTokens['color-background-primary-200']};
    color: ${fullSemantic.lightModeTokens['color-foreground-100']};
`;
```

### `getColorLightness(colorHex)`

Helper utility to extract LCH lightness from a hex color. Useful when you want to preserve the exact background color by matching the lightness value.

#### Parameters

- **`colorHex`**: HEX color string (e.g., `'#dbe0ea'`)

#### Returns

Integer lightness value (0-100) or `null` if invalid

#### Example

```typescript
import { getColorLightness, generatePrimitiveColorPalette } from '@vapor-ui/color-generator';

const userBg = '#dbe0ea';
const lightness = getColorLightness(userBg); // 89

const theme = generatePrimitiveColorPalette({
    backgroundColor: {
        name: 'custom',
        hexcode: userBg,
        lightness: { light: lightness, dark: 14 },
    },
});
// Result: #dbe0ea is used exactly as-is
```

## Architecture Overview

The package follows a clean 3-layer architecture:

### Domain Layer (`src/domain/`)

Pure TypeScript types and interfaces defining core business models and contracts. No external dependencies.

- **Models**: `Color`, `Palette`, `Theme`, `PaletteChip` types
- **Ports**: `ColorGeneratorPort` interface (contract between application and infrastructure)

### Application Layer (`src/application/`)

Business logic and use cases. Depends only on domain layer. No external library imports (except culori for color space conversions).

- **Use Cases**: `generatePrimitivePalette`, `getSemanticTokens`
- **Constants**: `DEFAULT_KEY_COLORS`, `DEFAULT_CONTRAST_RATIOS`, `DEFAULT_THEME_OPTIONS`
- **Utils**: Palette utilities, validation helpers

### Infrastructure Layer (`src/infrastructure/`)

External integrations and technical implementations. Only layer that imports external libraries.

- **Adapters**: Leonardo adapter implementing `ColorGeneratorPort`
- **Entrypoints**: Public API and dependency injection

### Dependency Flow

```
Infrastructure → Application → Domain
     ↑                            ↑
   (implements)              (defines contracts)
```

## Advanced Usage

### Custom Contrast Ratios

```typescript
import { DEFAULT_CONTRAST_RATIOS, generatePrimitiveColorPalette } from '@vapor-ui/color-generator';

const theme = generatePrimitiveColorPalette({
    contrastRatios: {
        ...DEFAULT_CONTRAST_RATIOS,
        '500': 5.0, // Increase AA text contrast
        '700': 10.0, // Increase AAA text contrast
    },
});
```

### Brand Color Swap

When providing a `brandColor`, the generator finds the closest matching color chip by deltaE and replaces it with your exact brand color (deltaE = 0). This preserves your brand identity while maintaining overall accessibility.

```typescript
const theme = generatePrimitiveColorPalette({
    brandColor: { name: 'company', hexcode: '#FF6B35' }, // Exact brand color
});

// The chip with lowest deltaE to #FF6B35 is replaced with exact value
// e.g., if closest is blue-400, blue-400 becomes exactly #FF6B35
```

### Gamut Clipping Prevention

The lightness values are constrained to prevent color clipping:

- **Light mode**: 88-100 (prevents 900 step from clipping to #000)
- **Dark mode**: 0-15 (prevents 900 step from clipping to #FFF)

```typescript
const theme = generatePrimitiveColorPalette({
    backgroundColor: {
        name: 'gray',
        hexcode: '#FFFFFF',
        lightness: {
            light: 95, // Valid: 88-100
            dark: 10, // Valid: 0-15
        },
    },
});
```

### Accessing Raw Palette Data

```typescript
const theme = generatePrimitiveColorPalette({
    brandColor: { name: 'mint', hexcode: '#00BEEF' },
});

// Find specific palette
const mintPalette = theme.lightModeTokens.palettes.find((p) => p.name === 'mint');

// Access specific color chip
const mint500 = mintPalette.chips['500'];
console.log(mint500.hex); // '#00a0d4'
console.log(mint500.oklch); // 'oklch(65.58% 0.128 231.79)'
console.log(mint500.deltaE); // 0 (exact brand color)
console.log(mint500.codeSyntax); // 'color-mint-500'

// Iterate all colors
theme.lightModeTokens.palettes.forEach((palette) => {
    Object.entries(palette.chips).forEach(([step, chip]) => {
        console.log(`${palette.name}-${step}: ${chip.hex} (Contrast: ${chip.deltaE})`);
    });
});
```

## Constants

```typescript
import {
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_KEY_COLORS,
    DEFAULT_THEME_OPTIONS,
} from '@vapor-ui/color-generator';

// 11 system colors
console.log(DEFAULT_KEY_COLORS.blue); // '#2A72E5'

// 10 contrast ratio steps
console.log(DEFAULT_CONTRAST_RATIOS['500']); // 4.5 (WCAG AA)

// Default options
console.log(DEFAULT_THEME_OPTIONS.backgroundColor); // { name: 'gray', hexcode: '#FFFFFF', lightness: { light: 100, dark: 14 } }
```

## Type Exports

```typescript
import type {
    BackgroundCanvas,
    BackgroundColor,
    BackgroundLightness,
    ContrastRatios,
    KeyColor,
    OklchColor,
    PaletteChip,
    PrimitiveColorTokens,
    PrimitivePalette,
    SemanticResult,
    SemanticTokens,
    ThemeOptions,
    ThemeResult,
} from '@vapor-ui/color-generator';
```

## Important Notes

### Accessibility First

This generator prioritizes WCAG compliance over visual preferences. If a generated color doesn't match your expectation, it's likely because the contrast requirement takes precedence.

### Atomic Theme Enforcement

The architecture prevents partial theme overrides by design. This is not a limitation but a feature that guarantees accessibility across your entire design system.

### Performance

Color generation is computationally intensive. Generate palettes at build time rather than runtime for production applications.

### Color Space

All calculations use OKLCH for perceptual uniformity. Output includes both hex (for web) and OKLCH (for advanced use cases).

## Related Resources

- [Adobe Leonardo Documentation](https://leonardocolor.io/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [OKLCH Color Space](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [Vapor UI Documentation](https://vapor-ui.goorm.io/)

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.
