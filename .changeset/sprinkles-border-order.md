---
'@vapor-ui/core': patch
---

fix `$css` side and axis border shorthands (`borderBottom`, `borderTop`, `borderInline`, etc.) overriding `borderColor` and drawing the border in `currentColor`

When a side or axis shorthand is set under the same condition as `borderColor`, `borderStyle`, `borderWidth`, or their axis forms (`borderBlockColor`, `borderInlineStyle`, and so on), the latter now wins, even if the shorthand also sets that value.
