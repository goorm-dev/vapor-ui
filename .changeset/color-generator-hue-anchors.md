---
'@vapor-ui/color-generator': minor
---

Build each color's light hue curve from three hue anchors (050, 600, 900) joined by a monotone cubic, and cap light 500–900 chroma at 1.1× its neighbours' mean so no single step spikes. The design team's warm corrections (red 900, orange 600 and 900, yellow 900) are now the default anchors, so **default palette HEX values change** (69 light and 83 dark cells). Export `HUE_ANCHORS` and the `HueAnchors` type. The `basicColors` and `brandColor` HEX is read as the 500 hue: a base color of the same name shifts its own anchors, any other name shifts those of the base color with the nearest 500 hue. A HEX below OKLCH chroma 0.005 throws.

`hueOverrides` now validates: an unknown palette name (including inherited keys such as `constructor`), `gray`, a step outside 050–900 or a non-finite hue throws, and hues wrap into 0–360. `HUE_ANCHORS`, `BASE_TOKENS` and `BASE_COLOR_HEX` (now each base color's default light 500 HEX) are deep-frozen.

`ThemeResult` gains an optional `yellowFamily` listing the palettes the engine capped as yellow family; `validatePalette` reads it and falls back to each palette's light 200 hue when absent.
