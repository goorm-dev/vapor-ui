---
'@vapor-ui/style-macro': minor
'@vapor-ui/composites': patch
---

**Breaking:** the Vite plugin now emits CSS per module instead of injecting one collected sheet into the CSS entry. Each module that uses `css()` imports a virtual `<file>.vapor.css` module (the Vanilla Extract model), so CSS of modules that are never imported stays out of the bundle, and in dev only the edited module's CSS is hot-reloaded instead of a full page reload. Works with Vite 7 and Vite 8. `@import '@vapor-ui/core/layers.css'` / `@vapor-utilities;` are no longer insertion points for Vite; keep importing `layers.css` first in your CSS entry, before any `@vapor-ui/*` import, so the layer order is registered first. Module CSS file names now keep the source extension (`button.tsx.vapor.css`) in both the Vite and Rolldown plugins, so library builds ship `<file>.tsx.vapor.css` instead of `<file>.vapor.css`.
