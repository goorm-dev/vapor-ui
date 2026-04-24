# JSDoc Component Guide — Full Reference

## Table of Contents

1. [Where to write JSDoc](#where-to-write-jsdoc)
2. [What appears on the documentation site](#what-appears-on-the-documentation-site)
3. [Language](#language)
4. [Format](#format)
5. [Component summary](#component-summary)
6. [Prop descriptions](#prop-descriptions)
7. [Complete example](#complete-example)
8. [Checklist](#checklist)

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
         * Visual style of the button. Default: `'fill'`
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
    extends DialogVariants,
        Omit<BaseDialog.Root.Props, 'disablePointerDismissal'> {
    /**
     * Closes the dialog when the overlay is clicked. Default: `true`
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
export interface AvatarRootProps
    extends Assign<VaporUIComponentProps<typeof BaseAvatar.Root, AvatarRoot.State>, AvatarContext> {
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

**Always leave the first line of every JSDoc block empty.**

Do not write content on the line immediately after `/**`. Even single-line comments must use the multi-line form.

```tsx
// ❌ content on first line
/** Button component for user interactions. */

// ✅ first line is empty
/**
 * Button component for user interactions.
 */
```

---

## Component Summary

The JSDoc block directly above the component declaration. It's the first thing a developer reads on the documentation site.

### Rules

**1. Write the summary on a single line**

No line breaks inside the summary. Separate sentences with `.` only.

```tsx
/**
 * Button component for user interactions. Use for primary actions such as form submission, dialog triggers, and navigation.
 */
export function Button(props: ButtonProps) { ... }
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
 * Disables the button, blocking all interactions and dimming its appearance. Automatically set to `true` when `loading` is `true`. Default: `false`
 */
disabled?: boolean;

/**
 * Shows a spinner and disables the button while `true`. Default: `false`
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

---

## Complete Example

```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Text displayed on the button.
     */
    label: string;

    /**
     * Visual style of the button.
     */
    variant?: 'fill' | 'outline' | 'ghost';

    /**
     * Size of the button.
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Disables the button, blocking all interactions. Automatically set to `true` when `loading` is `true`.
     */
    disabled?: boolean;

    /**
     * Shows a spinner and disables the button while `true`.
     */
    loading?: boolean;

    /**
     * Called when the button is clicked or activated via Enter or Space key.
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button component for user interactions. Use for primary actions such as form submission, dialog triggers, and navigation. Renders a `<button>` element.
 */
export function Button({ label, variant = 'fill', size = 'md', ...props }: ButtonProps) {
    // ...
}
```

---

## Checklist

**Language**

- [ ] All JSDoc is written in English

**Format**

- [ ] Every JSDoc block has an empty first line

**Summary**

- [ ] Summary is a single line (no line breaks)
- [ ] Summary is a complete sentence describing what the component is
- [ ] No internal implementation terms (`memoized`, `wrapper`, `token`, etc.)
- [ ] Rendered HTML element is stated with backtick-wrapped tag (``Renders a `<x>` element.`` or `Doesn't render its own HTML element.`)

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

**Compound components**

- [ ] Compound Root with context (`Assign<…, Context>` pattern): JSDoc written only on custom props, not on context-provided props
