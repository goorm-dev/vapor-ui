# JSDoc Component Guide — Full Reference

## Table of Contents

1. [Where to write JSDoc](#where-to-write-jsdoc)
2. [What appears on the documentation site](#what-appears-on-the-documentation-site)
3. [Language](#language)
4. [Format](#format)
5. [Component summary](#component-summary)
6. [Primitive vs combined parts](#primitive-vs-combined-parts)
7. [Prop descriptions](#prop-descriptions)
8. [Shared phrases](#shared-phrases)
9. [Complete example](#complete-example)
10. [Checklist](#checklist)

---

## Where to write JSDoc

Placement depends on which component pattern is used.

| Target                      | File                 | Location                                             |
| --------------------------- | -------------------- | ---------------------------------------------------- |
| Component Props             | `{component}.tsx`    | namespace `Props` type or the `interface` above it   |
| Individual prop description | `{component}.tsx`    | Each property inside `interface` / namespace `Props` |
| Variant groups              | `{component}.css.ts` | Each variant key object inside `componentRecipe()`   |

**Do NOT write JSDoc on:**

- Individual variant values (`sm`, `md`, `primary`, `fill`, etc.) — the group-level description is sufficient
- `export type XxxVariants` — tooling derives this automatically from the recipe

### Case 1 — Standalone: no JSDoc on namespace Props

When the Props type is defined inline inside the namespace, do not write JSDoc on namespace `Props` itself. Write individual variant descriptions inside `componentRecipe()` in the `.css.ts` file.

```ts
// button.tsx — no JSDoc on Props
export namespace Button {
    export type State = BaseButton.State;
    export type Props = VaporUIComponentProps<typeof BaseButton, State> & ButtonVariants;
}

// button.css.ts — write variant JSDoc here
export const root = componentRecipe({
    variants: {
        /**
         * Visual style of the button.
         */
        variant: { fill: {}, outline: {}, ghost: {} },
    },
});
```

### Case 2 — Compound Root: write on the interface

When custom props are defined via an `interface`, write JSDoc on the **interface**. The namespace wraps it.

```ts
// dialog.tsx
export interface DialogRootProps
    extends DialogVariants, Omit<BaseDialog.Root.Props, 'disablePointerDismissal'> {
    /**
     * Closes the dialog when the overlay is clicked.
     */
    closeOnClickOverlay?: boolean;
}

export namespace DialogRoot {
    export type State = {};
    export type Props = DialogRootProps; // namespace wraps the interface
    export type Actions = BaseDialog.Root.Actions;
}
```

### Case 3 — Compound Root with Context: Assign pattern

`Assign<VaporUIComponentProps, Context>` pattern. Write JSDoc only on custom props.

```ts
// avatar.tsx
export interface AvatarRootProps extends Assign<
    VaporUIComponentProps<typeof BaseAvatar.Root, AvatarRoot.State>,
    AvatarContext
> {
    /**
     * Custom image element to render inside the avatar.
     */
    imageElement?: ReactElement<AvatarImagePrimitive.Props>;
}
```

### Case 4 — Compound sub-part: Omit pattern

Props received from Context are excluded. Write JSDoc only on the remaining props.

```ts
// avatar.tsx
export namespace AvatarImagePrimitive {
    export type State = BaseAvatar.Image.State;
    export type Props = Omit<
        VaporUIComponentProps<typeof BaseAvatar.Image, State>,
        keyof AvatarContext // context-provided props are excluded
    >;
}
```

---

## What appears on the documentation site

Tools differ in parsing scope but all expose these two:

| Item              | Where it appears                          |
| ----------------- | ----------------------------------------- |
| Component Summary | Description text below the component name |
| Prop descriptions | `description` column of the Props table   |

**Not exposed**: implementation intent, algorithm comments, TODOs, internal team context. Put those in inline comments (`//`).

---

## Language

**All JSDoc must be written in English.**

The documentation site supports Korean and English, but the source is English. Korean translation is handled by a separate pipeline. Do not write Korean inside JSDoc blocks.

```tsx
// ❌ Korean
/**
 * 사용자 인터랙션을 위한 버튼 컴포넌트.
 */

// ✅ English
/**
 * Button component for user interactions.
 */
```

---

## Format

**Put `/**` on its own line and start the text on the next line.**

Never write a one-line `/** ... */` block, even for a short description — this applies to internal types too. Don't add an empty ` *` line between `/**` and the text.

```tsx
// ❌ one-line block
/** Button component for user interactions. */

// ❌ empty line before the text
/**
 *
 * Button component for user interactions.
 */

// ✅
/**
 * Button component for user interactions.
 */
```

---

## Component Summary

The JSDoc block directly above `export const X = forwardRef(...)`. The extractor reads the JSDoc attached to that statement, so a block anywhere else (e.g. on the namespace) is not picked up. It's the first thing a developer reads on the documentation site.

### Rules

**1. Write the summary on a single line**

No line breaks inside the summary. Separate sentences with `.` only.

```tsx
/**
 * Button component for user interactions. Use for primary actions such as form submission, dialog triggers, and navigation.
 */
export const Button = forwardRef<HTMLButtonElement, Button.Props>((props, ref) => { ... });
```

**2. Write for a developer who has never seen this component**

- No internal system names, team slang, or implementation details.
- Order: "what it is" → "when to use it".

```tsx
// ❌ implementation detail leaks
/**
 * Vapor UI token-based memoized button wrapper.
 */

// ✅ user perspective
/**
 * Button component for user interactions.
 */
```

**3. Write complete sentences**

Fragments read poorly when rendered as-is on the documentation site.

```tsx
// ❌ fragment
/**
 * Button
 */

// ✅ complete sentence
/**
 * Button component for user interactions.
 */
```

**4. State the rendered HTML element**

End the summary with the element the component renders by default. Wrap the HTML tag in backticks. For components that don't render their own HTML element (Providers, Context wrappers), say so explicitly.

```tsx
// renders a specific element
/**
 * Button component for user interactions. Renders a `<button>` element.
 */

// renders no HTML element of its own
/**
 * Provides theme context to its children. Doesn't render its own HTML element.
 */
```

---

## Primitive vs Combined Parts

Compound components often ship both a `XxxPrimitive` part and a part that assembles several primitives (e.g. `Tooltip.Popup` renders `Tooltip.PortalPrimitive` → `Tooltip.PositionerPrimitive` → `Tooltip.PopupPrimitive`). The two summaries must let a reader tell them apart at a glance.

**Primitive** — describe the part itself: what it is, what it does, then the rendered element.

```tsx
/**
 * Positions the tooltip popup relative to its trigger. Renders a `<div>` element.
 */
export const TooltipPositionerPrimitive = forwardRef(...);
```

**Combined part** — start with "Combines …", list the primitives it assembles, name the `xxxElement` props that replace each piece (if it has any), then the rendered element. Don't call it a "wrapper".

```tsx
/**
 * Combines `Tooltip.PortalPrimitive`, `Tooltip.PositionerPrimitive`, and `Tooltip.PopupPrimitive` into a single part. Use `portalElement` or `positionerElement` to replace the portal or positioner. Renders a `<div>` element.
 */
export const TooltipPopup = forwardRef(...);
```

A styled part that doesn't assemble other primitives (it only adds Vapor styles to one Base UI part) is not a combined part — describe it like any other part.

---

## Prop Descriptions

Write on each property inside the Props interface or type declaration. In TypeScript projects, write on the Props interface — not on the component function — for better tool compatibility.

```tsx
interface ButtonProps {
    /**
     * Text displayed on the button.
     */
    label: string;
    /**
     * Visual style of the button.
     */
    variant?: 'fill' | 'outline' | 'ghost';
}
```

### Rules

**1. Don't repeat the prop name**

The type system already shows the name and type. Descriptions fill in what the type system cannot say.

```tsx
// ❌ repeats the name
/**
 * The label prop. String type.
 */
label: string;

// ✅ adds information the type doesn't
/**
 * Text displayed on the button.
 */
label: string;
```

**2. Describe conditions and side effects**

Explain what happens when the prop is set — especially when it interacts with other props.

```tsx
/**
 * Disables the button, blocking all interactions and dimming its appearance. Automatically set to `true` when `loading` is `true`.
 */
disabled?: boolean;

/**
 * Shows a spinner and disables the button while `true`.
 */
loading?: boolean;
```

**3. Include unit, range, and allowed values for numeric props**

```tsx
/**
 * Delay before auto-dismissing, in milliseconds. Set to `0` to disable auto-dismiss.
 */
autoCloseMs?: number;
```

**4. Specify the exact trigger condition for event handlers**

Don't stop at "click handler" — say precisely when it fires.

```tsx
// ❌ vague
/**
 * Click handler.
 */
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

// ✅ exact trigger
/**
 * Called when the button is clicked or activated via Enter or Space key.
 */
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
```

**5. Never document default values**

Don't write the `@default` tag and don't write `Default:` inline. The extractor (`scripts/docs-extractor`) does not parse the `@default` tag; it reads `defaultValue` from code — the component function's destructuring defaults, then the `defaultVariants` of the recipe the component calls — so a default written in JSDoc is either ignored (`@default`) or rendered twice in the docs table (inline text). Remove any `@default` tag you find.

```tsx
// ❌ default duplicated in the docs table
/**
 * Disables the button, blocking all interactions.
 * @default false
 */
disabled?: boolean;

// ✅ extractor picks the default up from `disabled = false` in the component
//    (a variant's default comes from the recipe's `defaultVariants` the same way)
/**
 * Disables the button, blocking all interactions.
 */
disabled?: boolean;
```

**6. Say what goes in `children`**

Describe what the slot is for, with an example. For a function child, describe the arguments it receives.

```tsx
// ❌ restates the type
/**
 * Children of the component.
 */
children?: ReactNode;

// ✅
/**
 * Content shown inside the badge, such as a label or count.
 */
children?: ReactNode;

// ✅ function child
/**
 * Text shown for the selected value. As a function, receives the selected value and returns the label to display.
 */
children?: ReactNode | ((value: string) => ReactNode);
```

**7. Re-declare inherited props that have no description**

Some Base UI parts declare a prop (often `children` or an event handler) without JSDoc. You can't edit Base UI, so re-declare the prop in the part's Props with the Base UI type and document it there — the extractor prefers vapor-ui's own declaration. Keep the type identical by indexing into the Base UI props.

```tsx
// before
export namespace MenuTrigger {
    export type State = BaseMenu.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseMenu.Trigger, State>;
}

// after
export namespace MenuTrigger {
    export type State = BaseMenu.Trigger.State;
    export interface Props extends VaporUIComponentProps<typeof BaseMenu.Trigger, State> {
        /**
         * Content shown inside the trigger, such as a label or an icon.
         */
        children?: BaseMenu.Trigger.Props['children'];
    }
}
```

---

## Shared Phrases

Props that repeat across components start from the same sentence so readers (and agents) see the same meaning everywhere. Replace `{part}` with the part's name in plain words ("button", "checkbox", "text input"), then append only what differs for that component.

| Prop                | Phrase                                                                                                       | Add when                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `size`              | `Size of the {part}, controlling height, padding, and typography.`                                           | Drop the items the size doesn't change (e.g. an icon-only part)                         |
| `invalid`           | `Marks the {part} as invalid, applying error styles.`                                                        | Append "Sets `aria-invalid` on the {element}." when the code sets it                    |
| `disabled`          | `Disables the {part}, blocking all interactions.`                                                            | Mention props that force it (e.g. `loading`)                                            |
| `children`          | `Content shown inside the {part}, such as …`                                                                 | Always give the example; see rule 6                                                     |
| `portalElement`     | ``Replaces the default `X.PortalPrimitive`. Use to change the portal container.``                            | —                                                                                       |
| `overlayElement`    | ``Replaces the default `X.OverlayPrimitive`. Use to change the backdrop.``                                   | —                                                                                       |
| `positionerElement` | ``Replaces the default `X.PositionerPrimitive`. Use to change the side, alignment, or offset of the popup.`` | Say what the positioner controls for that part (e.g. Sheet: the side it slides in from) |

---

## Complete Example

```ts
// badge.css.ts
export const root = componentRecipe({
    defaultVariants: { colorPalette: 'primary', size: 'md', shape: 'square' },
    variants: {
        /**
         * Color palette of the badge, applied to its background and text.
         */
        colorPalette: { primary: {}, hint: {}, danger: {}, success: {}, warning: {}, contrast: {} },

        /**
         * Size of the badge, controlling height, padding, and typography.
         */
        size: { sm: {}, md: {}, lg: {} },

        /**
         * Corner style of the badge.
         */
        shape: { square: {}, pill: {} },
    },
});
```

```tsx
// badge.tsx
/**
 * Small label that shows a status, category, or count next to other content. Renders a `<span>` element.
 */
export const Badge = forwardRef<HTMLSpanElement, Badge.Props>((props, ref) => {
    // ...
});

export namespace Badge {
    export type State = {};
    // Standalone: no JSDoc on Props — variant docs live in badge.css.ts
    export type Props = VaporUIComponentProps<'span', State> & BadgeVariants;
}
```

---

## Checklist

**Language**

- [ ] All JSDoc is written in English

**Format**

- [ ] `/**` is on its own line and the text starts on the next line
- [ ] No one-line `/** ... */` blocks, including on internal types

**Summary**

- [ ] Summary is a single line (no line breaks)
- [ ] Summary is a complete sentence describing what the component is
- [ ] No internal implementation terms (`memoized`, `wrapper`, `token`, etc.)
- [ ] Rendered HTML element is stated with backtick-wrapped tag (``Renders a `<x>` element.`` or `Doesn't render its own HTML element.`)
- [ ] Combined parts start with "Combines …" and name their `xxxElement` props; primitives describe the part itself

**Placement**

- [ ] Standalone: no JSDoc on namespace `Props` itself (variant group docs go in `componentRecipe()` in `.css.ts`)
- [ ] Compound Root (`interface extends …` pattern): JSDoc is on the interface, not the namespace
- [ ] Variant groups: JSDoc is on the variant key object (e.g. `size: { … }`) in `{component}.css.ts`
- [ ] No JSDoc on individual variant values (`sm`, `md`, `fill`, `primary`, etc.)
- [ ] No JSDoc on `export type XxxVariants`

**Props**

- [ ] No prop description simply repeats the prop name or type
- [ ] Numeric props include unit and valid range
- [ ] Props that interact with other props describe that interaction
- [ ] Event handlers describe the exact trigger condition
- [ ] `children` says what goes in the slot, with an example
- [ ] Shared props (`size`, `invalid`, `disabled`, `children`) start from the shared phrase
- [ ] No default values in descriptions — neither `@default` tags nor inline `Default:` text

**Compound components**

- [ ] Compound Root with context (`Assign<…, Context>` pattern): JSDoc written only on custom props, not on context-provided props
