---
name: write-component-jsdocs
description: Guide for writing JSDoc comments on vapor-ui components and their props. Use when adding, reviewing, or fixing JSDoc on component tsx files or css.ts variant files. Covers where to place comments based on component pattern — standalone, compound root, compound sub-part, primitive vs combined part — language and format rules, and a checklist for review. Triggers on requests like add jsdocs, write component docs, document props, jsdoc 작성, or when reviewing a component documentation completeness.
argument-hint: ComponentName — the PascalCase component name to document (e.g. Button, Dialog, Avatar). Required. When provided, locate the component under packages/core/src/components/{kebab-case-name}/ and apply this guide to those files only.
---

# JSDoc Component Guide

JSDoc in vapor-ui is **user-facing UI**, not internal code comments. Write it for developers who encounter the component for the first time via documentation sites (Storybook Autodocs, etc.).

## Core rules

- **Language**: English only. No Korean in JSDoc blocks.
- **Format**: Put `/**` on its own line and start the text on the next line. Never write a one-line `/** ... */` block, and don't add an empty ` *` line before the text.
- **Placement**: Write the component summary directly above the `export const X = forwardRef(...)` statement — the extractor reads the JSDoc on that statement. Write individual prop descriptions inside the Props interface/type, not on the component.

## Where to write

Placement depends on the component pattern. See [references/guide.md](references/guide.md) for detailed patterns and examples.

| Target            | File                 | Location                                              |
| ----------------- | -------------------- | ----------------------------------------------------- |
| Component summary | `{component}.tsx`    | Above `export const X = forwardRef(...)`              |
| Individual props  | `{component}.tsx`    | Inside the `interface` or namespace `Props`           |
| Variant groups    | `{component}.css.ts` | On each variant key object inside `componentRecipe()` |

**Do NOT write JSDoc on:**

- Individual variant values (`sm`, `md`, `primary`, `fill`, etc.) — the variant key description is sufficient
- `export type XxxVariants` — tooling derives this from the recipe automatically

### Pattern quick-reference

- **Standalone** — no JSDoc on namespace `Props` itself; write variant group docs in `componentRecipe()` in `.css.ts`
- **Compound Root** (custom props via `interface`) — write on the `interface`, namespace wraps it
- **Compound Root with context** (`Assign<…, Context>` pattern) — write only on custom props
- **Compound sub-part** (`Omit<…, keyof Context>` pattern) — write only on remaining props

## Component summary rules

1. One single line — no line breaks inside the summary
2. User perspective: what it is → when to use it
3. No internal terms (`memoized`, `wrapper`, `token-based`, etc.)
4. End with the rendered HTML element using backticks around the tag: "Renders a `<button>` element." or "Doesn't render its own HTML element.".
5. **Primitive vs combined part** — a `XxxPrimitive` part describes the part itself. A part that assembles primitives (e.g. `Tooltip.Popup` over `PortalPrimitive`, `PositionerPrimitive`, `PopupPrimitive`) starts with "Combines `A`, `B`, and `C` into a single part.", then names the `xxxElement` props that replace each piece (if it has any), then the rendered element. See [references/guide.md](references/guide.md#primitive-vs-combined-parts).

## Prop description rules

1. Don't repeat the prop name or its type
2. Describe side effects and interactions with other props
3. For numeric props: include unit and valid range
4. For event handlers: specify the exact trigger condition, not just "handler"
5. Never document default values in JSDoc — neither the `@default` tag nor inline `Default:` text. The extractor (`scripts/docs-extractor`) does not parse the `@default` tag at all; it reads `defaultValue` from code — the component function's destructuring defaults, then the `defaultVariants` of the recipe the component calls. Remove any `@default` tag you find.
6. `children` — say what goes in the slot, with an example ("Content shown inside the badge, such as a label or count."). For a function child, describe its arguments. Never write just "Children of the component" or restate `ReactNode`.
7. Inherited Base UI props with no description (e.g. `children`, `onClick`) — re-declare the prop in the part's Props `interface` with the Base UI type (`children?: BaseMenu.Trigger.Props['children']`) and write the JSDoc there. The extractor prefers vapor-ui's own declaration. Turn `export type Props = …` into `export interface Props extends … {}` when needed.
8. Repeated props (`size`, `invalid`, `portalElement`, …) — start from the shared phrase in [references/guide.md](references/guide.md#shared-phrases) and add only what differs for that component.

## Review checklist

See the full checklist in [references/guide.md](references/guide.md#checklist).

**Quick checklist:**

- [ ] All JSDoc in English
- [ ] `/**` on its own line, text starts on the next line, no one-line `/** */` blocks
- [ ] Summary is one line, complete sentence, HTML element in backticks (e.g. `` `<button>` ``)
- [ ] Combined parts start with "Combines …" and name their `xxxElement` props
- [ ] No prop name repetition in descriptions
- [ ] `children` says what goes in the slot
- [ ] Event handlers describe exact trigger condition
- [ ] Numeric props include unit and range
- [ ] Shared props (`size`, `invalid`, …) follow the shared phrases
- [ ] No JSDoc on individual variant values (`sm`, `md`, `fill`, `primary`, etc.)
- [ ] No JSDoc on `export type XxxVariants`
- [ ] No default values in descriptions — neither `@default` tags nor inline `Default:` text
