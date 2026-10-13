---
'@vapor-ui/composites': patch
---

remove `Dialog` body `marginTop` now that `@vapor-ui/core` `Dialog.Body` provides the 16px top padding — keeps the Header→Body gap at 16px instead of doubling to 32px
