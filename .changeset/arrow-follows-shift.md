---
'@vapor-ui/core': patch
---

fix(popover, tooltip, navigation-menu): keep the arrow pointing at the trigger when the popup shifts

The arrow offset for `start`/`end` alignment is now measured from the trigger instead of the popup edge, so it follows the trigger when `collisionAvoidance={{ align: 'shift' }}` moves the popup. When the trigger is so wide that its center falls outside the popup, the arrow keeps its previous fixed position.
