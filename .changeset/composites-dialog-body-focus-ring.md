---
'@vapor-ui/composites': patch
---

fix focus rings in the `Dialog` and `AlertDialog` body being clipped, and keep a 20px gap between Header and Footer when there is no body

`Dialog` no longer renders an empty Footer below a body when neither `action` nor `assistive` is passed, so the space under the body stays at the body's 20px bottom padding.

`AlertDialog` now treats any falsy `children` (such as `''` or `false`) as no body, matching `Dialog`.
