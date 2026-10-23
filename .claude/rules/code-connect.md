---
description: Figma Code Connect template conventions, Figma-to-code mapping rules, shared template helpers, and verify/publish commands for packages/core
paths:
    - 'packages/core/src/**/*.figma.ts'
    - 'packages/core/src/**/*.figma.batch.*'
    - 'packages/core/src/utils/figma.ts'
    - 'packages/core/figma.config.json'
---

# Code Connect Rules (`packages/core`)

Templates map components in the **Vapor Design System** Figma file (`oxXA7DN1My1R4UFVmrm8Ep`) to `@vapor-ui/core` code. Only template files (`figma.selectedInstance` + `figma.code`) are supported; the legacy parser API (`figma.connect()`, `figma.enum`, `*.figma.tsx`) is not.

A snippet shows the code as it exists today. When Figma and code define a component differently (a **Mismatch**: prop names, meanings, defaults or parts), the snippet follows the code. Report the Mismatch to the user so it can become a VAPOR Jira ticket for a Figma or code fix; create the ticket only when the user asks.

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

- **Compound** components use a batch pair when their sub-parts are **separately published** Figma components. The JSON holds `templateFile` and a `components` array whose entries have `part`, `url`, `component`, `source`; the template reads `figma.batch.part`.
- When sub-parts are only inner layers of one Figma component, use a single `<name>.figma.ts` and read them with `findInstance`.
- The `url` must point to the top-level component or component set node, never a variant node.
- `*.figma.*` files are excluded from the build (`rolldown.config.ts`) and need no changeset.
- **Parked** templates stay in the repo, unpublished, and listed under `exclude` in `figma.config.json`: the component isn't final, or an open Mismatch makes every snippet wrong. Unpublish a template before parking it.

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
- Interpolate snippets inside `figma.code`. Joining snippets with `+` or `.join()` renders `[object Object]`; only plain strings may be joined.

## Content

- **Concrete content** is read from the instance: TEXT properties, swapped icons, connected child instances. Root parts render their connected child parts; leaf parts render their TEXT property as children.
- **Placeholder content** stands in for content Figma doesn't define: a `{/* … */}` child, or a `"..."` string attribute value (numbers take a sample value: `totalPages={10}`). Attribute placeholders are always `"..."`: inside quotes `{/* … */}` is a literal string, and unquoted it is an empty-expression compile error.
    - Text in a plain layer rather than a TEXT property → `{/* contents */}`. Read text only through TEXT properties.
    - A container or SLOT with no connected parts → `{/* contents */}`.
- A part the code requires but Figma lacks is emitted anyway: around the concrete children it should hold (`<Tabs.List>` around the buttons), or with a child named after it (`{/* trigger */}`, `{/* panel */}`).
- **SLOT** properties: render the connected parts inside the slot, including those wrapped in unconnected instances (RadioGroup radios sit inside 💙Field.label). A whole-slot render emits Figma's auto-generated `<div className=…>` code for plain layers and `{/* Missing snippet … */}` for unconnected instances.
- A part whose content the code renders itself is self-closing: separators, `Meter.Track`, `InputGroup.Counter`, `Select.Trigger`.

## Mapping Figma to Code

Every snippet type-checks against the code: it uses only real public parts and props (`index.parts.ts`, the component's `Props`), and its placeholder values are `"..."` strings or sample numbers.

| Figma                                                                                        | Snippet                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same meaning, different name or form                                                         | The code's form. ProgressBar `type=indeterminate` → `value={null}`                                                                                                                                       |
| Prop on a different part than in code                                                        | Emitted where code accepts it. Root `side`/`align` → `positionerElement` on Popup; Select Trigger `size`/`invalid`/`readOnly` → `Select.Root`                                                            |
| Prop with no code counterpart                                                                | Dropped, unless a [Workaround mapping](#workaround-mapping) applies. Sheet.ResizeHandle `align`, Table heading `isSortable`                                                                              |
| Code prop that is type-required or gives an accessible name, with no Figma value             | `"..."` (numbers: a sample value). `value="..."` on Radio, Tabs and SegmentedControl items, `totalPages={10}`, `aria-label="..."` on icon-only controls, Avatar `alt="..."`                              |
| Accessible name when no visible label renders                                                | `aria-label="..."` only in that case (Meter, ProgressBar without a Label part)                                                                                                                           |
| **Configuration**: `disabled`, `invalid`, `readOnly`, `required`, Breadcrumb `current`       | Emitted                                                                                                                                                                                                  |
| **Interaction state**: checked, pressed, selected, a chosen or typed value, indeterminate    | Dropped: no `default*` prop and no `defaultValue`/`value` wiring on the parent. Checkbox `checked`, Toggle `pressed`, Radio `selected`, the Select Trigger's chosen value, TextInput's typed text        |
| Text shown as a placeholder (slot `value=false` on TextInput, Textarea, Select, MultiSelect) | `placeholder="<text>"` (on `Select.Root`/`MultiSelect.Root` for the selects). With `value=true` the text is Interaction state and is dropped                                                             |
| Trigger missing in Figma                                                                     | Anchored popups still render a Trigger: with `{/* trigger */}` for Tooltip and Popover, self-closing for Select and MultiSelect. Modals (Dialog, AlertDialog, Sheet) omit it, since they open from state |
| Enum VARIANT                                                                                 | Always emitted (`size="md"`)                                                                                                                                                                             |
| Boolean VARIANT                                                                              | Emitted only when `true`, via `flags`                                                                                                                                                                    |
| BOOLEAN property that shows a layer (icon toggle, `showHandle`, `hasCheckBox`)               | That layer's snippet only when `true` (`icon()` for icon swaps)                                                                                                                                          |
| Property named `deprecated(...)`                                                             | Ignored                                                                                                                                                                                                  |

### Workaround mapping

The one workaround form: a Figma prop with no code counterpart becomes a `$css` override on the **same part**, when that override reproduces the design exactly.

- Values are `$`-prefixed tokens or CSS keywords: `$css={{ padding: '$000' }}`. A bare `'000'` skips the token.
- Comment that the code has no prop yet, and switch to the real prop once the code adds one.
- When `$css` on that part can't reproduce the design, drop the prop. RadioGroup `orientation` is dropped: Root is a flex column that also holds the Label, so `flexDirection: 'row'` pulls the Label into the row.
- Children functions and props the code lacks stay out of the snippet: Meter and ProgressBar render `<Meter.Value />` / `<ProgressBar.Value />` whatever their `maxValue` toggle says.
- Reference case: Card.Body `hasPadding=false` → `$css={{ padding: '$000' }}`.

## Figma Names

Property and layer names are byte-exact and case-sensitive, including typos, a leading backspace (`\b`, U+0008), and leading or trailing spaces. Keep the Figma spelling and add a one-line comment for those anomalies:

```ts
// `item` is lowercase in Figma.
const slot = instance.findInstance('🟨MultiSelect.item/SlotLayer');
```

- The `💙` (component) and `🟨` (slot layer) prefixes are the standard naming and need no comment.
- When Figma renames a property, option or layer, read the new name only and delete the old name with its comment.

## Drift

**Drift** is a Figma rename or restructure that leaves a template reading names that no longer exist. Templates fail loudly on it:

- `getEnum`, `getBoolean` and `getString` on a missing property return a truthy value that prints as `''`: a boolean read then comes out `true` and the flag lands on every variant (Switch `invalid` after Figma renamed `invaild`). Property reads throw on a missing property or an unmapped enum option, so Drift surfaces as an error instead of a wrong snippet: `figma:preview` marks the template failed and names the missing property.
- Read every property through the throwing helpers (`pick`, `bool`, `toggle`, `text`, `swap`); never call `getEnum`, `getBoolean`, `getString` or `getInstanceSwap` directly. Enum maps list every Figma option.
- Optional layers stay soft. `find*` returns a truthy `ErrorHandle` on a miss: check `.type === 'INSTANCE'` or use `example()`, which renders `''`.

## Shared Helpers

`src/utils/figma.ts` holds helpers used by three or more templates. Templates bundle **relative imports only**, so import it with a relative path, not the `~/` alias:

```ts
import { bool, example, flags, icon } from '../../utils/figma';
```

| Helper                           | Returns                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pick(layer, name, options)`     | The mapped value of an enum VARIANT; throws when the property or its option is missing                     |
| `bool(layer, name)`              | `true`/`false` from a `true`/`false` VARIANT property; throws when it is missing                           |
| `toggle(layer, name)`            | A BOOLEAN property; throws when it is missing                                                              |
| `text(layer, name)`              | A TEXT property; throws when it is missing                                                                 |
| `swap(layer, name)`              | The snippet of the instance in an INSTANCE_SWAP property; throws when it is missing                        |
| `placeholder(slot)`              | `' placeholder="<Text>"'` from a slot's `value`/`Text` pair, or `''` when `value=true` (Interaction state) |
| `flags({ disabled, ... })`       | Boolean JSX attributes for the truthy keys: `' disabled invalid'`                                          |
| `example(handle)`                | The connected instance's snippet, or `''` when the layer is missing                                        |
| `icon(layer, visible, swapName)` | The swapped icon's snippet when its visibility toggle is on                                                |
| `lines(snippets, indent?)`       | The snippets one per line at `indent` (default four spaces)                                                |
| `connectedChildren(layer)`       | Connected instances directly inside `layer`, looking one level into unconnected wrappers                   |

A helper moves into this file once three templates repeat it verbatim. Helpers used by one or two templates stay local. Cross-package imports (e.g. `@vapor-ui/composites`' `figma-utils`) are not supported by Code Connect.

## Verification

Paths are relative to `packages/core`; a `.figma.batch.json` covers all its parts.

```bash
pnpm --filter @vapor-ui/core exec figma connect parse                          # offline: templates bundle and parse
pnpm core figma:preview <file> -f <file> --unique                               # every variant; --unique needs the positional <file>
pnpm core figma:check -f <file>                                                 # dry-run publish: the target is that one component
pnpm core figma:publish -f <file>
pnpm --filter @vapor-ui/core exec figma connect unpublish -f <file> --dry-run
pnpm --filter @vapor-ui/core exec figma connect unpublish -f <file>
```

- Always target publish and unpublish with `-f <file>`. A positional path is ignored, so the command acts on every template in `figma.config.json`.
- Unpublish a Parked template part by part with `figma connect unpublish --node <part url> --label React`. `--dry-run` is ignored with `--node`: the mapping is deleted right away.
- Bursts of publish or unpublish calls hit the Figma API rate limit (`429`). Wait and retry the failed ones.
- Preview resolves only the given file's templates: nested parts and icons come out empty or as "no Code Connect template found". Check composite parents in Dev Mode after publishing.
- Preview surfaces Drift only when templates throw on it (see [Drift](#drift)).
- Publish leaf components (Button, Badge, Toggle) before parents that embed them.

The token needs the **Code Connect: Write** and **File content: Read** scopes. The CLI reads `FIGMA_ACCESS_TOKEN` only, from the environment or `packages/core/.env`.
