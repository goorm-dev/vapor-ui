---
'@vapor-ui/color-generator': minor
'@vapor-ui/css-generator': minor
'figma-plugin': minor
'website': minor
---

**BREAKING CHANGE**: rename `color-background-canvas` token to `color-canvas`

The canvas background token has been renamed for better semantic clarity and consistency:

- Token name: `color-background-canvas` → `color-canvas`
- CSS variable: `--vapor-color-background-canvas` → `--vapor-color-canvas`

**Migration required:**

- Update all references from `color-background-canvas` to `color-canvas`
- Replace CSS variables from `--vapor-color-background-canvas` to `--vapor-color-canvas`
