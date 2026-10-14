---
description: Figma Code Connect template conventions, Figma-to-code prop mapping, and shared template helpers for packages/core
paths:
    - 'packages/core/src/**/*.figma.ts'
    - 'packages/core/src/**/*.figma.batch.*'
    - 'packages/core/src/utils/figma.ts'
---

# Code Connect Rules (`packages/core`)

Templates map components in the **Vapor Design System** Figma file (`oxXA7DN1My1R4UFVmrm8Ep`) to `@vapor-ui/core` code. Only template files (`figma.selectedInstance` + `figma.code`) are supported; the legacy parser API (`figma.connect()`, `figma.enum`, `*.figma.tsx`) is not.

## File Structure

Templates sit next to the component they map:

```text
src/components/button/
  button.figma.ts              ← standalone component

src/components/dialog/
  dialog.figma.batch.ts        ← compound component, one template for all parts
  dialog.figma.batch.json      ← one entry per Figma part
```

- **Standalone** components use `<name>.figma.ts` with three header comments:

```ts
// url=https://www.figma.com/design/oxXA7DN1My1R4UFVmrm8Ep/Vapor-Design-System?node-id=44343-7629
// source=src/components/button/button.tsx
// component=Button
```

- **Compound** components use a batch pair when their sub-parts are **separately published** Figma components. Each JSON entry has `part`, `url`, `component`, `source`; the template reads `figma.batch.part`.
- When sub-parts are only inner layers of one Figma component, use a single `<name>.figma.ts` and read them with `findInstance`.
- The `url` must point to the top-level component or component set node, never a variant node.
- `*.figma.*` files are excluded from the build (`rolldown.config.ts`) and need no changeset.

## Template Shape

```ts
export default {
    example: figma.code`<Button size="${size}">${children}</Button>`,
    imports: ['import { Button } from "@vapor-ui/core"'],
    id: 'button',
    metadata: { nestable: true },
};
```

- `id`: kebab-case. `<name>` for standalone, `<name>-<part>` for batch parts (`dialog-popup`).
- `metadata.nestable`: always `true`, so parent templates can embed the snippet.
- Root parts of a batch render their children with `findConnectedInstance(<part id>)`; leaf parts render their TEXT property as children. Text that is a plain layer rather than a TEXT property becomes `{/* contents */}`; templates do not look text layers up by name.
- Interpolate snippets inside `figma.code`. Joining snippets with `+` or `.join()` renders `[object Object]`; only plain strings may be joined.
- `find*` returns a truthy `ErrorHandle` on a miss. Check `.type === 'INSTANCE'` or use `example()`.

## Shared Helpers

`src/utils/figma.ts` holds helpers used by three or more templates. Templates bundle **relative imports only**, so import it with a relative path, not the `~/` alias:

```ts
import { bool, example, flags, icon } from '../../utils/figma';
```

| Helper                       | Returns                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `bool(layer, name)`          | `true` when a `true`/`false` VARIANT property is `true`                                  |
| `flags({ disabled, ... })`   | Boolean JSX attributes for the truthy keys: `' disabled invalid'`                        |
| `example(handle)`            | The connected instance's snippet, or `''` when the layer is missing                      |
| `icon(layer, visible, swap)` | The swapped icon's snippet when its visibility toggle is on                              |
| `lines(snippets, indent?)`   | The snippets one per line at `indent` (default four spaces)                              |
| `connectedChildren(layer)`   | Connected instances directly inside `layer`, looking one level into unconnected wrappers |

A helper moves into this file once three templates repeat it verbatim. Helpers used by one or two templates stay local. Cross-package imports (e.g. `@vapor-ui/composites`' `figma-utils`) are not supported by Code Connect.

## Figma Names

Property and layer names are byte-exact and case-sensitive, including typos, emoji, a leading backspace (`\b`, U+0008), and leading or trailing spaces. Keep the Figma spelling and add a one-line comment:

```ts
// `invaild` is spelled this way in Figma.
const invalid = bool(instance, 'invaild');
```

## Mapping Figma to Code

Snippets use only real public parts and props of the code component (`index.parts.ts`, the component's `Props`).

| Figma                                                       | Snippet                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same meaning, different name                                | Code name. `invaild` → `invalid`                                                                                                                        |
| Prop with no code counterpart                               | Dropped                                                                                                                                                 |
| Required code prop with no Figma value                      | `"..."` placeholder (numbers: a sample value). `aria-label="..."`, `value="..."`, `totalPages={10}`                                                     |
| Prop on a different part than in code                       | Emitted where code accepts it. Root `side`/`align` → `positionerElement` on Popup                                                                       |
| Part required by code but missing in Figma                  | Emitted with a placeholder child. `<Tooltip.Trigger>{/* trigger */}</Tooltip.Trigger>`                                                                  |
| Trigger missing in Figma                                    | Anchored popups (Tooltip, Popover, Menu, Select) get a placeholder Trigger. Modals (Dialog, AlertDialog, Sheet) omit it, since they can open from state |
| State with an uncontrolled `default*` prop on the same part | The `default*` prop. `checked=true` → `defaultChecked`                                                                                                  |
| State that is a plain prop                                  | Emitted as is. Breadcrumb `current`                                                                                                                     |
| State with no prop on that part                             | Dropped. Radio `selected` (selection belongs to `RadioGroup.Root`)                                                                                      |
| Enum VARIANT                                                | Always emitted (`size="md"`)                                                                                                                            |
| Boolean VARIANT                                             | Emitted only when `true`, via `flags`                                                                                                                   |

TextInput precedent for a value/placeholder pair:

```ts
// value=true → defaultValue="<text>", value=false → placeholder="<text>"
const attr = slot.getEnum('value', { true: 'defaultValue', false: 'placeholder' });
```

## Verification

```bash
pnpm --filter @vapor-ui/core exec figma connect parse   # offline: templates bundle and parse
pnpm core figma:check                                    # dry-run publish, needs FIGMA_ACCESS_TOKEN
pnpm core figma:publish                                  # publish to Figma, needs FIGMA_ACCESS_TOKEN
```

The token needs the **Code Connect: Write** and **File content: Read** scopes.
