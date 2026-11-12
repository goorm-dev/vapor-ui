---
'@vapor-ui/style-macro': minor
---

`css()` now returns a plain string (RSC-safe) and merges compositions with the Compiled-style `_ax` group encoding. CSS is no longer emitted per file: every `css()` rule in the project is collected into one globally sorted sheet at `@vapor-utilities;`, so `@media` / pseudo / longhand overrides from one file always beat base rules from another regardless of bundler chunk order. The `@vapor-utilities;` at-rule is now required in your CSS entry. `include` is now a glob `string[]` (plus `exclude`, `root`). Adds `@vapor-ui/style-macro/css-loader` and `@vapor-ui/style-macro/postcss`.
