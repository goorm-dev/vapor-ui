---
'@vapor-ui/core': minor
---

move `Dialog` and `AlertDialog` spacing onto the popup, and fix focus rings in the body being clipped by the scroll container

The popup now owns the spacing: `padding: space-300` (24px) on every side and `gap: space-250` (20px) between parts. Every combination of Header, Body, and Footer ends up with the same 24px inset and 20px gaps. `Dialog.Header`, `Dialog.Footer`, `AlertDialog.Header`, and `AlertDialog.Footer` no longer set padding.

`Dialog.Body` and `AlertDialog.Body` are scroll containers, so they bleed into the popup padding with negative margin and give the same amount back as padding: 8px above and below, 24px on each side. Focus rings on the first, last, and side children stay visible, the scrollbar stays at the popup edge, and while the content scrolls the clip edge stays 12px from the Header and Footer. `scrollPaddingBlock: space-250` keeps Tab-scrolled rings visible.

`AlertDialog` spacing between Header and Body, and between Body and Footer, changes from 24px to 20px. If you added padding or margin to a Header, Body, or Footer yourself, remove it, or the space doubles.
