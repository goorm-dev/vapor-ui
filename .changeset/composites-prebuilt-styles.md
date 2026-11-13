---
'@vapor-ui/composites': minor
'@vapor-ui/style-macro': minor
'@vapor-ui/core': minor
---

`@vapor-ui/composites` now compiles its `css()` macro calls at build time and ships the generated rules as `@vapor-ui/composites/styles.css` in a dedicated `@layer composites`. Consumers import that file once; no style-macro bundler plugin is required.

`@vapor-ui/core/layers.css` now declares the `composites` layer between `vapor-components` and `vapor-utilities` (`vapor-theme, vapor-reset, vapor-components, composites, vapor-utilities`), so composites styles override core components while app `css()` styles and unlayered `className`s always override composites, regardless of CSS load order. If you declare the layer order yourself instead of importing `layers.css`, add `composites` in the same position.

`@vapor-ui/style-macro` gains a `layer` option (default `vapor-utilities`) that sets the cascade layer for the generated rules. `@vapor-ui/style-macro/rolldown` gains a `cssFileName` option for library builds: it collects the `css()` rules of every bundled module into one sorted sheet and emits it as an asset.
