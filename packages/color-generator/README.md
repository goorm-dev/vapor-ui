# @vapor-ui/color-generator

Generates the Vapor primitive color palette for light and dark mode, and maps it to semantic tokens.

The engine is a TypeScript port of the design team's reference script, [`reference/generate_palette.py`](./reference/generate_palette.py). With default input, the output matches the script's `palette.json` HEX for HEX. See [ADR-0003](../../docs/adr/0003-color-generator-ports-reference-script.md).

## Installation

```bash
pnpm add @vapor-ui/color-generator
```

## Quick start

```ts
import {
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
    validatePalette,
} from '@vapor-ui/color-generator';

const theme = generatePrimitiveColorPalette({
    basicColors: [{ name: 'teal', hexcode: '#00838F' }],
    brandColor: { name: 'acme', hexcode: '#2A72E5' },
});

theme.brand; // { name: 'acme', scale: '400' }

const semantic = getSemanticDependentTokens(theme, 'acme');
semantic.lightModeTokens['color-background-primary-200']; // 'color-acme-400'
semantic.lightModeTokens['color-foreground-onPrimary']; // 'color-white'

validatePalette(theme).filter((check) => check.status === 'fail'); // []
```

## How the palette is built

Every palette is computed against fixed backgrounds: light `#FFFFFF`, dark `#232323`.

- **Hue.** Each color has three key colors. The hue of each scale is read from the white → keys → black OKLCH path at that scale's target contrast.
- **Lightness.** Each cell is solved to its target contrast against the background (`TARGET_CONTRAST`, one table per mode).
- **Chroma.**
    - Light 050–200 share one chroma cap per scale, computed from the 11 base colors only. Yellow-family colors (200 hue in 60–150°) use their own cap.
    - Light 400–900 use the largest chroma sRGB can express. 300 sits halfway between 200 and 400.
    - Dark 400–900 take the chroma and hue of the light curve at the same lightness, with dark 400 at ×0.9.
    - Dark 050–300 use the dark 400 hue and the same cap rule as light.
- **Gray.** Chroma 0, 000–900 in both modes. Dark 000 sits darker than the background.

Palettes come out in this order: the 11 base colors, `basicColors`, the brand color, then `gray`. Colors have scales 050–900; gray has 000–900.

## Options

```ts
generatePrimitiveColorPalette({
    basicColors?: KeyColor[]; // KeyColor = { name: string; hexcode: Hexcode }
    brandColor?: KeyColor;
}): ThemeResult;
```

### `basicColors`

Adds colors, or replaces a base color of the same name. Palettes come out in array order. A name used twice, here or by `brandColor`, throws.

The HEX borrows the key colors of the base color with the nearest 500 hue, rotates them to the input hue, and puts the input HEX in place of the key nearest in lightness.

The input only shapes the hue curve, so it may not appear in the palette. Other colors never change: the 050–200 chroma caps always come from the default base colors.

### `brandColor`

The brand HEX becomes a palette of its own (or replaces a base color of the same name) and is pinned into one light cell as-is. The cell is found by walking scales in order of log-contrast distance to the HEX. The first scale wins if it passes every accessibility rule for that scale and keeps the contrast order with its neighbours. `ThemeResult.brand` names the cell.

Dark derives from the pinned light curve. The brand HEX is never pinned in dark.

## Semantic tokens

```ts
getSemanticDependentTokens(themeResult: ThemeResult, primaryColorName = 'blue'): SemanticResult;
```

Values are primitive token names, such as `color-blue-500`.

| Token                                                  | Light                                                  | Dark                     |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------ |
| `color-background-primary-200`, `color-border-primary` | anchor                                                 | anchor                   |
| `color-foreground-primary-100` / `-200`                | anchor +1 / +2 (max 900)                               | anchor +1 / +2 (max 900) |
| `color-background-primary-100`                         | primary 100                                            | primary 050              |
| `color-foreground-onPrimary` (provisional name)        | white if white on the anchor reaches 4.5:1, else black | same                     |
| `color-foreground-inverse`                             | `color-white`                                          | `color-black`            |
| `color-background-canvas-100`                          | gray 000                                               | gray 025                 |
| `color-background-canvas-200`                          | gray 050                                               | gray 050                 |
| `color-background-overlay-100`                         | gray 000                                               | gray 050                 |
| `color-border-normal`                                  | gray 100                                               | gray 300                 |

The anchor is the primary palette's base scale. When the primary palette is the brand palette, light uses the brand cell and dark runs the same cell assignment on the dark palette. Otherwise light uses 500 and dark uses 400.

## Palette check

`validatePalette(themeResult)` returns one `{ id, status, details }` per rule.

| `id`              | Rule                                                                               | Status when broken |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------ |
| `hue-gap`         | Colors at the same scale differ in hue by at least 5.5° (blue and cobalt excepted) | `warn`             |
| `target-contrast` | Each cell is within ±1% of its target contrast; the brand cell is exempt           | `fail`             |
| `a11y`            | 400 and 500 pass 3:1 and 4.5:1 against the backgrounds and cards (`A11Y_RULES`)    | `fail`             |
| `chroma`          | Each cell's chroma follows its scale's chroma rule                                 | `fail`             |
| `brand-monotone`  | The brand cell keeps the contrast order with its neighbours                        | `warn`             |
| `primary-anchor`  | The primary anchor reaches 3:1 against the background in both modes                | `warn`             |

## Exports

- `generatePrimitiveColorPalette`, `getSemanticDependentTokens`, `validatePalette`
- `BASE_TOKENS`: `color-white` and `color-black` chips
- `LEONARDO_KEYS`: key colors of the 11 base colors
- Types: `ThemeOptions`, `ThemeResult`, `PrimitiveColorTokens`, `PrimitivePalette`, `PaletteChip`, `Scale`, `SemanticTokens`, `SemanticResult`, `PaletteCheck`, `KeyColor`, `Hexcode`

## Changing the rules

Change `reference/generate_palette.py` first, regenerate the fixtures (see [`reference/README.md`](./reference/README.md)), then update the port until `pnpm --filter @vapor-ui/color-generator test` passes.
