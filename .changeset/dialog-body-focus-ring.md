---
'@vapor-ui/core': minor
---

fix focus rings in `Dialog.Body` and `AlertDialog.Body` being clipped by the scroll container

`Dialog.Body` and `AlertDialog.Body` now split their spacing around the scroll container: `marginBlock: space-150` (12px) outside, `paddingBlock: space-100` (8px) inside, and `scrollPaddingBlock: space-250`. The inside padding keeps the first and last rings visible, `scroll-padding` keeps Tab-scrolled rings visible, and the outside margin keeps a 12px gap to the Header and Footer while the content scrolls. `Dialog.Footer` and `AlertDialog.Footer` no longer set `padding-top`.

`AlertDialog` spacing between Header and Body, and between Body and Footer, changes from 24px to 20px. If you added padding or margin to a Body yourself, remove it, or the space doubles.
