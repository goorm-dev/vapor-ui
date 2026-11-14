---
'@vapor-ui/style-macro': minor
'@vapor-ui/composites': patch
---

**Breaking:** `css()` now compiles each call to a single class and CSS block instead of one atomic class per declaration. Class names are `v<hash>` (prod) / `<name>_<hash>` (dev), hashed from the file path relative to the project root and the block's declarations. Composition: arguments resolvable in the same file (object literals, top-level `const x = css(...)` constants and `&&` / `?:` between them) are merged at compile time so later arguments win; other arguments are joined by the new `_cx` runtime helper (replaces `_ax`), and which class wins then follows CSS load order. Within a block, declarations keep source order. The collected sheet now concatenates each module's blocks in path order.
