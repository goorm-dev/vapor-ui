---
'@vapor-ui/composites': minor
'@vapor-ui/style-macro': minor
---

`@vapor-ui/composites` now compiles its `css()` macro calls at build time and ships the generated rules as `@vapor-ui/composites/styles.css` (`@layer vapor-utilities`). Consumers import that file once; no style-macro bundler plugin is required.

`@vapor-ui/style-macro/rolldown` gains a `cssFileName` option for library builds: it collects the `css()` rules of every bundled module into one sorted sheet and emits it as an asset.
