---
'@vapor-ui/figma-blueprint': minor
'@vapor-ui/core': patch
'@vapor-ui/composites': patch
'@vapor-ui/icons': patch
---

Add `@vapor-ui/figma-blueprint`, a CLI and JS API that turns a Figma design into the vapor-ui element tree its Code Connect templates write: one node per library instance, with the props the design sets and the Figma node id it came from. It runs the templates of the installed packages, so the tree follows the versions you have. Checking code against the tree is left to the caller.

`@vapor-ui/core`, `@vapor-ui/composites` and `@vapor-ui/icons` now ship their compiled Code Connect templates and tables in a `figma-blueprint/` folder, exported as `./figma-blueprint/*`. Nothing in the runtime bundle changes.
