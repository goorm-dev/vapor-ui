---
'@vapor-ui/figma-eval': minor
'@vapor-ui/core': patch
'@vapor-ui/composites': patch
'@vapor-ui/icons': patch
---

Add `@vapor-ui/figma-eval`, a CLI and JS API that grades vapor-ui code generated from a Figma design against the components and props the design draws. It runs the Code Connect templates of the installed packages, so the expected set follows the versions you have.

`@vapor-ui/core`, `@vapor-ui/composites` and `@vapor-ui/icons` now ship their compiled Code Connect templates and tables in a `figma-eval/` folder, exported as `./figma-eval/*`. Nothing in the runtime bundle changes.
