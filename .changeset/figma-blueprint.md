---
'@vapor-ui/figma-blueprint': patch
'@vapor-ui/core': patch
'@vapor-ui/composites': patch
'@vapor-ui/icons': patch
---

Add `@vapor-ui/figma-blueprint`, a CLI and JS API that turns a Figma design into the vapor-ui element tree its Code Connect templates write: one node per library instance, with the props the design sets, the Figma node id it came from and its box in the frame. It runs the templates of the installed packages, so the tree follows the versions you have. Next to the tree it lists what visual scoring needs from the design: the frame's size and every text line with its box. Checking code against all of this is left to the caller. The CLI reads `FIGMA_ACCESS_TOKEN` from the environment or a `.env` in the current directory.

`@vapor-ui/core`, `@vapor-ui/composites` and `@vapor-ui/icons` now ship their compiled Code Connect templates and tables in a `figma-blueprint/` folder, exported as `./figma-blueprint/*`. Nothing in the runtime bundle changes.
