---
'@vapor-ui/style-macro': minor
'@vapor-ui/composites': minor
---

**Breaking:** library builds now ship one CSS file per module instead of a single sheet. `@vapor-ui/style-macro/rolldown` emits a `<file>.vapor.css` asset for each module that uses `css()` and keeps a side-effect `import` (ESM) / `require` (CJS) to it in the output, the same way the Vanilla Extract rollup plugin does. Where the asset lands is up to `output.assetFileNames`; with `output.preserveModules` each component file imports only its own CSS. The `cssFileName` option is removed; pass `extract: true` (or `{ name }`) to merge all module CSS into one file instead (default `index.css`), as in the Vanilla Extract rollup plugin. Class name hashes now include the nearest `package.json` name and the path relative to that package.

`@vapor-ui/composites` no longer exports `./styles.css`: each component imports its own CSS, so bundles only include the CSS of the components you import. Remove `@import '@vapor-ui/composites/styles.css'` from your CSS entry. With CommonJS, import components by subpath (`@vapor-ui/composites/alert-dialog`) to keep this per-component.
