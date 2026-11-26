---
'@vapor-ui/color-generator': minor
---

Replace the Leonardo-based engine with a TypeScript port of the design team's reference palette script, so every cell meets its target contrast in both light and dark mode. **Default palette HEX values change.**

- `generatePrimitiveColorPalette` now takes only `basicColors`, `brandColor` and an optional `hueOverrides`. Backgrounds are fixed at `#FFFFFF` light and `#232323` dark, and `backgroundColor`, `lightness` and `contrastRatios` are removed.
- Each color's light hue curve runs through three hue anchors (050, 600, 900) joined by a monotone cubic, and light 500–900 chroma is capped at 1.1× its neighbours' mean so no single step spikes. The design team's warm corrections (red 900, orange 600 and 900, yellow 900) are the default anchors. A `basicColors` or `brandColor` HEX is read as the 500 hue: a base color of the same name shifts its own anchors, any other name shifts those of the base color with the nearest 500 hue. A HEX below OKLCH chroma 0.005 throws.
- `hueOverrides` sets the light hue of single palette steps. Each step keeps its contrast target and chroma rule, and dark follows from the overridden light curve. An unknown palette name, `gray`, a step outside 050–900 or a non-finite hue throws, and hues wrap into 0–360.
- Color names in `basicColors` and `brandColor` are lowercased before the reserved-name (`gray`) and duplicate checks, so palettes and `ThemeResult.brand.name` are lowercase.
- Gray becomes a palette with scales 000–900. `ThemeResult` loses `backgroundCanvas` and gains an optional `yellowFamily`, and `PaletteChip` loses `deltaE`.
- `getSemanticDependentTokens(themeResult, primaryColorName)` drops the canvas argument, lowercases `primaryColorName`, and adds `color-foreground-onPrimary` (provisional name).
- The new `validatePalette(themeResult)` reports hue gap (one line per cell pair), target contrast, accessibility, chroma, brand monotonicity and primary anchor checks.
- `getColorLightness`, `DEFAULT_CONTRAST_RATIOS` and `DEFAULT_KEY_COLORS` are removed. `BASE_COLOR_HEX` (each base color's default light 500 HEX), `HUE_ANCHORS` and the `HueAnchors`, `HueOverrides` and `PaletteCheck` types are added. `BASE_COLOR_HEX`, `BASE_TOKENS` and `HUE_ANCHORS` are deep-frozen.
