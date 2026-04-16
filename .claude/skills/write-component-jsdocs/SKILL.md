---
name: write-component-jsdocs
description: Guide for writing JSDoc comments on vapor-ui components and their props. Use when adding, reviewing, or fixing JSDoc on component tsx files or css.ts variant files. Covers where to place comments based on component pattern — standalone, compound root, compound sub-part — language and format rules, and a checklist for review. Triggers on requests like add jsdocs, write component docs, document props, jsdoc 작성, or when reviewing a component documentation completeness.
argument-hint: ComponentName — the PascalCase component name to document (e.g. Button, Dialog, Avatar). Required. When provided, locate the component under packages/core/src/components/{kebab-case-name}/ and apply this guide to those files only.
---

# JSDoc Component Guide

JSDoc in vapor-ui is **user-facing UI**, not internal code comments. Write it for developers who encounter the component for the first time via documentation sites (Storybook Autodocs, etc.).

## Core rules

- **Language**: English only. No Korean in JSDoc blocks.
- **Format**: Always leave the first line of every `/** ... */` block empty.
- **Placement**: Write the component summary above the component function. Write individual prop descriptions inside the Props interface/type, not on the component function.

## Where to write

Placement depends on the component pattern. See [references/guide.md](references/guide.md) for detailed patterns and examples.

| Target            | File                 | Location                                              |
| ----------------- | -------------------- | ----------------------------------------------------- |
| Component summary | `{component}.tsx`    | Above the component function                          |
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

## Prop description rules

1. Don't repeat the prop name or its type
2. Describe side effects and interactions with other props
3. For numeric props: include unit and valid range
4. For event handlers: specify the exact trigger condition, not just "handler"
5. Include the default value when relevant: `Default: \`false\``

## Review checklist

See the full checklist in [references/guide.md](references/guide.md#checklist).

**Quick checklist:**

- [ ] All JSDoc in English
- [ ] First line of every block is empty
- [ ] Summary is one line, complete sentence, HTML element in backticks (e.g. `` `<button>` ``)
- [ ] No prop name repetition in descriptions
- [ ] Event handlers describe exact trigger condition
- [ ] Numeric props include unit and range
- [ ] No JSDoc on individual variant values (`sm`, `md`, `fill`, `primary`, etc.)
- [ ] No JSDoc on `export type XxxVariants`
