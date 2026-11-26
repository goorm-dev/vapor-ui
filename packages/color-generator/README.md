# @vapor-ui/color-generator

Generates the Vapor primitive color palette for light and dark mode, and maps it to semantic tokens.

The engine is a TypeScript port of the design team's reference script, [`reference/generate_palette.py`](./reference/generate_palette.py). With default input, the output matches the script's `palette.json` HEX for HEX. See [ADR-0003](../../docs/adr/0003-color-generator-hue-anchor-curve.md).

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

- **Hue.** Each color has three light hue anchors, at 050, 600 and 900 (`HUE_ANCHORS`). A monotone cubic (Fritsch–Carlson) joins them, with each scale placed by the lightness its light target contrast gives on white, so every step's hue stays within the anchors' range. The dark warm anchors (red 900, orange 600 and 900, yellow 900) carry the design team's corrections.
- **Lightness.** Each cell is solved to its target contrast against the background (`TARGET_CONTRAST`, one table per mode).
- **Chroma.**
    - Light 050–200 share one chroma cap per scale, computed from the 11 base colors only. Yellow-family colors (200 hue in 60–150°) use their own cap.
    - Light 400–900 use the largest chroma sRGB can express. From 500 to 900, in order, a chroma above 1.1× its neighbours' mean (900: 1.1× of 800) is solved again at that limit, so one step cannot spike. 300 sits halfway between 200 and 400.
    - Dark 400–900 take the chroma and hue of the light curve at the same lightness, with dark 400 at ×0.9.
    - Dark 050–300 use the dark 400 hue and the same cap rule as light.
- **Gray.** Chroma 0, 000–900 in both modes. Dark 000 sits darker than the background.

Palettes come out in this order: the 11 base colors, `basicColors`, the brand color, then `gray`. Colors have scales 050–900; gray has 000–900.

## Options

```ts
generatePrimitiveColorPalette({
    basicColors?: KeyColor[]; // KeyColor = { name: string; hexcode: Hexcode }
    brandColor?: KeyColor;
    hueOverrides?: HueOverrides; // { [name]: { [scale]: hue in degrees } }
}): ThemeResult;
```

### `basicColors`

Adds colors, or replaces a base color of the same name. Palettes come out in array order. Names are lowercased first, so `Teal` makes the palette `teal`. A name used twice (`Blue` and `blue` count as one), here or by `brandColor`, throws, and so does `gray`.

The HEX is read as the 500 hue. A base color shifts its own three hue anchors by the hue difference from its `BASE_COLOR_HEX`, so its corrected curve keeps its shape and its own `BASE_COLOR_HEX` rebuilds the default palette exactly. Any other name borrows the anchors of the base color with the nearest 500 hue and shifts them the same way. `BASE_COLOR_HEX` holds each base color's default light 500 HEX. A HEX below OKLCH chroma 0.005 carries no hue and throws.

The input only shapes the hue curve, so it may not appear in the palette. Other colors never change: the 050–200 chroma caps always come from the default base colors.

### `brandColor`

The brand HEX becomes a palette of its own (or replaces a base color of the same name) and is pinned into one light cell as-is. The cell is found by walking scales in order of log-contrast distance to the HEX. The first scale wins if it passes every accessibility rule for that scale and keeps the contrast order with its neighbours. `ThemeResult.brand` names the cell.

Dark derives from the pinned light curve. The brand HEX is never pinned in dark.

### `hueOverrides`

Sets the light OKLCH hue of single cells after the anchor curve, keyed by lowercase palette name (base, `basicColors` or brand) and scale: `{ blue: { '500': 270 } }`. The cell keeps its role: lightness is still solved to the target contrast and chroma still follows the scale's rule at the new hue. Dark derives from the overridden light curve as usual.

The pinned brand cell ignores its override. An unknown name, `gray`, a step outside `050`–`900`, or a non-finite hue throws. Hues wrap, so `444` means `84`.

## Semantic tokens

```ts
getSemanticDependentTokens(themeResult: ThemeResult, primaryColorName = 'blue'): SemanticResult;
```

Values are primitive token names, such as `color-blue-500`. `primaryColorName` is lowercased before the lookup, as palette names are.

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

The `chroma` check reruns the engine's rule, not an approximation of it: the yellow family is the list the engine names in `ThemeResult.yellowFamily` (without it, each palette's light 200 hue decides), and dark 400–900 are rederived from the light row at the engine's own lightness. A palette straight from `generatePrimitiveColorPalette` passes `chroma` (tested on the default palette and on seeded random brand colors); a `fail` points at cells edited afterwards.

## Exports

- `generatePrimitiveColorPalette`, `getSemanticDependentTokens`, `validatePalette`
- `BASE_TOKENS`: `color-white` and `color-black` chips
- `HUE_ANCHORS`: default light hue anchors of the 11 base colors
- `BASE_COLOR_HEX`: the default light 500 HEX of each of the 11 base colors (the Figma plugin's default input)
- Types: `ThemeOptions`, `ThemeResult`, `HueAnchors`, `HueOverrides`, `PrimitiveColorTokens`, `PrimitivePalette`, `PaletteChip`, `Scale`, `SemanticTokens`, `SemanticResult`, `PaletteCheck`, `KeyColor`, `Hexcode`

## Changing the rules

Change `reference/generate_palette.py` first, regenerate the fixtures (see [`reference/README.md`](./reference/README.md)), then update the port until `pnpm --filter @vapor-ui/color-generator test` passes.
