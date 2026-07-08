---
'@vapor-ui/core': major
---

Rebuild `InputGroup` as a visual box with addon slots.

`InputGroup.Root` now owns the border, background and focus ring, and groups an
input control with `InputGroup.LeadingAddon` / `InputGroup.TrailingAddon` slots
(icons, labels, icon buttons). `Root` accepts `size`, `disabled`, `invalid` and
`readOnly` — these drive the group's _visual_ state only via `data-*`; disabling
and `aria-invalid` on the inner controls stay explicit. When used inside `Field`,
the group reflects validation via `:has([aria-invalid='true'])` on `Root`.

BREAKING CHANGE: `InputGroup.Counter` and the `useInputGroup` hook are removed.
`InputGroup.Root` no longer provides a character-count context.
