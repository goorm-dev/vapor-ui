---
'@vapor-ui/style-macro': patch
'@vapor-ui/core': patch
'@vapor-ui/composites': patch
---

Add `@vapor-ui/style-macro`, a zero-runtime CSS-in-JS macro. `css({...})` compiles at build time to a class name.

- `@vapor-ui/core`: add the `@vapor-ui/core/layers.css` entry, which declares the cascade layer order `vapor-theme, vapor-reset, vapor-components, vapor-composites, vapor-utilities`.
- `@vapor-ui/composites`: component styles are compiled at build time into `@layer vapor-composites`.
