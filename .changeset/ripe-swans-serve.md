---
'@vapor-ui/core': patch
'website': patch
---

### Features

* **Enabled CSS Tree-shaking:** Component CSS is now imported by its corresponding JS file instead of being in the global `styles.css`. This significantly reduces your production bundle size by only including the CSS for components you actually use.

### Bug Fixes

* Fixed a CSS dependency order issue where `IconButton` styles loaded before `Button` styles, causing incorrect style inheritance.