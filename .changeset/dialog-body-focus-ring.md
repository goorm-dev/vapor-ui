---
'@vapor-ui/core': minor
---

fix focus rings of the first and last elements in `Dialog.Body` and `AlertDialog.Body` being clipped by the scroll container

`Dialog.Body` and `AlertDialog.Body` now set `paddingBlock` and `scrollPaddingBlock` to `space-250`, and `Dialog.Footer` and `AlertDialog.Footer` no longer set `padding-top`. `Dialog.Body` drops its `marginTop`.

`AlertDialog` spacing between Header and Body, and between Body and Footer, changes from 24px to 20px. If you added bottom padding to a Body yourself, remove it, or the space doubles.
