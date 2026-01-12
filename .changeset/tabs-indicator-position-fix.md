---
'@vapor-ui/core': patch
---

fix(tabs): correct indicator position when list has padding

Fix indicator positioning issue when Tabs.List has padding-inline (horizontal) or padding-block (vertical). The indicator now correctly positions itself by explicitly setting `left: 0` (horizontal) or `top: 0` (vertical), ensuring it uses only the CSS variables for positioning regardless of padding.
