---
'@vapor-ui/core': patch
---

Mark vanilla-extract bundler output (`*.css.vanilla.mjs`, `*.css.vanilla.cjs`) as side-effectful so consumer bundlers keep the CSS imports that back `ThemeProvider` and the component layer declarations instead of tree-shaking them away.
