---
"@vapor-ui/core": patch
---

fix: prevent passing props to Fragment in `createRender`

Fixed React warning `Invalid prop 'ref' supplied to 'React.Fragment'` by wrapping Fragment returns in a render callback to avoid `cloneElement` props merging.
