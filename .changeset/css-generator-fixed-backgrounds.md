---
'@vapor-ui/css-generator': minor
---

Follow the new `@vapor-ui/color-generator` engine. `ColorThemeConfig` drops `background` (backgrounds are now fixed at `#FFFFFF` light and `#232323` dark) and renames `keyColors` to `basicColors`, an array of `{ name, hexcode }`. The generated CSS keeps every semantic variable name, and `--{prefix}-color-canvas` stays, now valued from gray 000 in light and gray 025 in dark. Palette values change, a `gray` palette with scales 000–900 and a `cobalt` palette are emitted, `--{prefix}-color-white` and `--{prefix}-color-black` are now defined in both theme blocks (the semantic tokens already pointed at them), the palette named after the old background input is gone, and a new `--{prefix}-color-foreground-onPrimary` token (provisional name) carries the text color for the primary fill.
