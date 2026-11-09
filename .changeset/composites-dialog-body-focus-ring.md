---
'@vapor-ui/composites': patch
---

fix focus rings in the `Dialog` and `AlertDialog` body being clipped, and keep a 20px gap between Header and Footer when there is no body

`Dialog` shows the bottom fade only while more content is below, so the fade turns off at the end of the scroll and the last focus ring shows in full. Tab scrolling stops 24px above the bottom edge so focus rings stay clear of the fade.

`Dialog` no longer renders an empty Footer below a body when neither `action` nor `assistive` is passed, so the space under the body stays at 20px.

`AlertDialog` now treats any falsy `children` (such as `''` or `false`) as no body, matching `Dialog`.
