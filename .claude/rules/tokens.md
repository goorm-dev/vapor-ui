---
description: Design token definition, naming grammar, and component-scoped CSS variables for packages/core
paths:
    - 'packages/core/src/styles/**'
    - 'packages/core/src/**/*.css.ts'
---

# Token Rules (`packages/core`)

Tokens live in three layers, and the rules below are ordered the same way:

```text
foundation    src/styles/tokens/**        the palette and scales every component draws from
component     createGlobalVar in *.css.ts a public, overridable knob on one component
internal      createVar in *.css.ts       private plumbing inside one recipe — not a token
```

How styles consume these — recipes, sprinkles, layers — is in [`styling.md`](./styling.md).

## Referencing Tokens

Always reference design tokens via the `vars` object from `~/styles/themes.css`. Never use hard-coded values.

```ts
// ✅
color: vars.color.foreground.normal[200];
padding: vars.size.space['150'];

// ❌
color: '#1a1a1a';
padding: '12px';
```

## Token Naming Grammar

Every token name — foundation and component alike — follows one grammar. Foundation tokens are the
same shape with the component slots empty, so there is never a second form to choose between.

```text
--vapor-{type}-[component]-[part]-{property}-[specialty]-[variant]-[modifier]-[scale]
```

| Slot        | Required                                | What goes in it                                                        |
| ----------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `type`      | yes                                     | Foundation property: `color`, `size`, `typography`, `shadow`           |
| `component` | component tokens only                   | The component the token belongs to, one lowercase word (`progressbar`) |
| `part`      | when the part is separately addressable | The exported sub-part, spelled as it is exported (`Track` → `track`)   |
| `property`  | yes                                     | `background`, `foreground`, `border`, `interaction` — a closed list    |
| `specialty` | rarely                                  | A subject that is not a library component (`canvas`, `link`, `logo`)   |
| `variant`   | when not default                        | The meaning of the color (`primary`, `success`, `error`)               |
| `modifier`  | rarely                                  | A qualifier on the value's shape (`gradientFrom`, `gradientTo`)        |
| `scale`     | when not default                        | Intensity: `bold`, _(omitted)_, `subtle`, `subtlest`                   |

```text
--vapor-color-background-primary-bold                                 foundation
--vapor-color-background-canvas-base                                  foundation, specialty
--vapor-color-foreground-staticWhite                                  foundation
--vapor-color-progressbar-indicator-background                        component, default variant
--vapor-color-progressbar-indicator-background-error                  component, error variant
--vapor-color-progressbar-indicator-background-gradientFrom           component, modifier
--vapor-size-progressbar-track-height                                 component, non-color
```

Foundation token names are generated mechanically from the object path in
`src/styles/tokens/` — `themes.css.ts` maps `path.join('-')` onto `--vapor-…`. Renaming a
foundation token therefore means restructuring that object, and every consumer moves with it.
Component token names are written by hand in `createGlobalVar`, so this grammar is what keeps them
aligned.

### Rules

- **Omit a slot rather than filling it with a default.** `type="default"` produces no variant
  segment; a token with no intensity variation produces no scale segment.
- **A multi-word slot value is camelCase**, never hyphenated — `staticWhite`, `gradientFrom`. The
  hyphen separates slots and nothing else, so a value that eats it destroys the slot boundaries.
- **A component name may not collide with a `property` word** (`background`, `foreground`, `border`,
  `interaction`). This keeps the second segment enough to tell a component token from a foundation one.
- **`variant` uses the prop value that selects it**, letter for letter — not the name of the
  foundation token it happens to reference. `type="error"` yields `…-error` even though the value
  behind it is `background.danger`. The consumer overriding the token should not need a translation table.
- **`part` is about addressability, not about where the paint lands.** A part gets a slot when it is
  separately overridable — it is exported, or it exists as its own CSS address. A component with a
  single painted surface has no part slot.
- **One token per distinct decision, not per usage site.** A five-stop gradient built from two
  alternating colors is two tokens, not five.
- **A sequence uses one vocabulary.** Two ends are named (`from` / `to`); three or more genuinely
  independent values are numbered from `1`. Never mix the two (`start` / `mid-1` / `end`).

### `createVar` vs `createGlobalVar`

```ts
// Internal plumbing — the name is hashed and private. No grammar applies.
const boxShadowColor = createVar('box-shadow-color');

// Public, overridable component token — the name is stable and documented. Grammar applies.
const tokens = {
    background: createGlobalVar('vapor-color-progressbar-indicator-background'),
};
```

Use `createVar` to decouple values inside one recipe, as in the palette pattern below. Reach for
`createGlobalVar` only when a consumer is meant to override the value from outside the component —
that makes the name public API, and it must follow the grammar.

## Component-scoped CSS Variables

Use `createVar` to decouple color palette from visual variant within a single recipe. The palette variant sets the variable values; the visual variant consumes them — this avoids N×M `compoundVariants` for every palette × variant combination.

```ts
const variables = {
    foreground: createVar('foreground'),
    background: createVar('background'),
    borderColor: createVar('border-color'),
};

variants: {
    colorPalette: {
        primary: { vars: { [variables.background]: vars.color.background.primary[200] } },
        danger:  { vars: { [variables.background]: vars.color.background.danger[200] } },
    },
    variant: {
        fill:  { backgroundColor: variables.background },   // consumes the var
        ghost: { backgroundColor: 'transparent' },
    },
}
```
