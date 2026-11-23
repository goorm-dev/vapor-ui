---
'@vapor-ui/icons': patch
---

Give each rendered icon instance its own SVG ids. Icons with masks, clip paths, or gradients used one static id per icon, so rendering the same icon twice produced duplicate ids and failed HTML validation. These icons now derive their ids from `useId` on React 18 and later, which works in Server Components and SSR. React 17 keeps the previous static ids. These 227 icons now call a hook, so render them as elements (`<Icon />`), not as plain function calls.
