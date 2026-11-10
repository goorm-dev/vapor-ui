---
'@vapor-ui/composites': patch
---

fix focus rings in the `Dialog` and `AlertDialog` body being clipped, and keep the same spacing in every combination of header, body, and footer

`Dialog` shows the bottom fade only while more content is below, so the fade turns off at the end of the scroll and the last focus ring shows in full. Tab scrolling stops 24px above the bottom edge so focus rings stay clear of the fade.

`Dialog` and `AlertDialog` now take their 24px inset and 20px gaps from the popup, so a dialog without a body no longer needs extra padding above the Footer. `Dialog` renders no Footer when neither `action` nor `assistive` is passed.

`AlertDialog` now treats any falsy `children` (such as `''` or `false`) as no body, matching `Dialog`.
