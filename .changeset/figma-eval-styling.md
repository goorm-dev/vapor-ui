---
'@vapor-ui/figma-eval': minor
---

Add `figma-eval styling <files...> [--json]` and `checkStyling()`, which fail hand-written code that positions with `absolute` or hardcodes a color or a px value that has a token. Five exemptions (assets, visually hidden boxes, 1px borders, px off the token scale, input icons) stay out of the gate and are counted on every run. It exits 0 on pass, 1 on fail, 2 when a file cannot be read.
