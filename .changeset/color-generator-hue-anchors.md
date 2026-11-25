---
'@vapor-ui/color-generator': minor
---

Build each color's light hue curve from three hue anchors (050, 600, 900) joined by a monotone cubic, and cap light 500–900 chroma at 1.1× its neighbours' mean so no single step spikes. The design team's warm corrections (red 900, orange 600 and 900, yellow 900) are now the default anchors, so **default palette HEX values change** (69 light and 83 dark cells). Add `hueAnchors` to `generatePrimitiveColorPalette` to replace any anchor of a palette, applied before `hueOverrides`, and export `HUE_ANCHORS` and the `HueAnchors` type. `basicColors` and `brandColor` HEX now shift the anchors of the nearest base color.
