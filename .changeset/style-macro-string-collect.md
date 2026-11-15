---
'@vapor-ui/style-macro': minor
---

`css()` now returns a plain string (RSC-safe). `include` is now a glob `string[]` (plus `exclude`, `root`); globs resolve against the bundler project root and may use `../` or absolute paths. Adds `@vapor-ui/style-macro/css-loader`, the CSS loader the webpack and Next.js plugins use to compile a source module to its CSS. Supported bundlers are Vite, webpack and Next.js (webpack and Turbopack) for apps and Rolldown for libraries; there is no PostCSS adapter.
