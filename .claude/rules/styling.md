---
description: Vanilla Extract styling conventions for packages/core — style, recipe, CSS variables, `css()` macro boundary
paths:
    - 'packages/core/src/**/*.css.ts'
    - 'packages/core/src/**/*.tsx'
---

# Styling Rules (`packages/core`)

All styles use **Vanilla Extract** — zero-runtime, type-safe CSS-in-JS. No inline styles or CSS modules.

## How Styling Works

Every component follows the same three-step flow at runtime:

```text
resolveStyles(props)           $css / deprecated flat props → sprinkles() → className + style
                               remaining props pass through untouched

cn(recipe className, sprinkles className + user className)
                               merge all classNames into one string

<BaseComponent className={...} {...otherProps} />
                               only standard HTML props reach the DOM element
```

`resolveStyles` normalizes Vapor-specific style props (`$css`, deprecated flat props like `padding`, `color`) into className/style, then removes them from props so they never reach `<BaseComponent>`. The `cn()` call merges the recipe className with the sprinkles className and any user-supplied `className`.

## CSS Definition — Three Primitives

### `componentRecipe` — variant styles

Use when a component or part has visual variants. All styles are automatically placed inside `@layer vapor-components`.

```ts
import { componentRecipe } from '~/styles/mixins/layer-style.css';

export const root = componentRecipe({
    base: {
        display: 'inline-flex',
        borderRadius: vars.size.borderRadius['300'],
    },
    variants: {
        variant: {
            fill: { backgroundColor: variables.background, color: variables.foreground },
            outline: { boxShadow: `inset 0 0 0 1px ${variables.borderColor}` },
            ghost: { backgroundColor: 'transparent' },
        },
        size: {
            sm: { height: vars.size.dimension['300'], paddingInline: vars.size.space['100'] },
            md: { height: vars.size.dimension['400'], paddingInline: vars.size.space['150'] },
        },
    },
    defaultVariants: { variant: 'fill', size: 'md' },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof root>>;
```

At build time, each variant value gets its own CSS class inside `@layer vapor-components`. At runtime, `styles.root({ variant, size })` returns the matching className strings — no CSS is generated at runtime.

### `componentStyle` — static styles

Use when a component part has no variants — a single fixed className is generated at build time.

```ts
import { componentStyle } from '~/styles/mixins/layer-style.css';

export const title = componentStyle({
    paddingInline: vars.size.space['150'],
    color: vars.color.foreground.normal[200],
});
```

`componentStyle` also accepts an array — pass mixin classNames alongside the style rule to compose them:

```ts
import { typography } from '~/styles/mixins/typography.css';

export const title = componentStyle([typography({ style: 'subtitle1' }), { gridColumn: '1' }]);
```

### `interaction()` mixin — interactive states

Include in `base` for any component that responds to hover / active / focus. Implements a `::before` pseudo-element overlay so interaction states work without touching background-color directly.

```ts
import { interaction } from '~/styles/mixins/interactions.css';

base: [
    interaction(), // hover · active · focus-visible
    { display: 'inline-flex', ... },
]
```

### `typography()` mixin — text styles

Never set `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` by hand, and never spread `typographyVariants`. Call the `typography()` recipe with one of the named styles (`display1`–`display4`, `heading1`–`heading6`, `subtitle1`–`subtitle2`, `body1`–`body4`, `code1`–`code2`) so every component picks the same four tokens together.

```ts
import { typography } from '~/styles/mixins/typography.css';

// ✅ static part
export const label = componentStyle([typography({ style: 'subtitle1' }), { gridColumn: '1' }]);

// ✅ inside a recipe — base or a variant value
export const button = componentRecipe({
    base: [typography({ style: 'subtitle1' }), { display: 'inline-flex' }],
    variants: {
        size: {
            sm: [typography({ style: 'subtitle2' }), { height: vars.size.space['300'] }],
            md: [typography({ style: 'subtitle1' }), { height: vars.size.space['400'] }],
        },
    },
});
```

```ts
// ❌ raw typography tokens — drifts from the scale
export const label = componentStyle({
    fontSize: vars.typography.fontSize['075'],
    fontWeight: vars.typography.fontWeight[500],
});

// ❌ spreading the variant map — it exists to feed `variants`, not to style with
export const label = componentStyle({ ...typographyVariants.subtitle1 });
```

`typographyVariants` is the raw style map that backs the recipe. Its only job is to be handed to a `variants` group so a component can expose a `typography` prop (see `Text`, `Field`):

```ts
export const root = componentRecipe({
    variants: { typography: typographyVariants },
});
```

## Passing Variants to `recipe` — Two Patterns

### Direct — standalone components or parts that own their variants

```tsx
// *.tsx
const { className, ...componentProps } = resolveStyles(props);
const [variantsProps, otherProps] = createSplitProps<ButtonVariants>()(componentProps, [
    'colorPalette',
    'size',
    'variant',
]);

<BaseButton className={cn(styles.root(variantsProps), className)} {...otherProps} />;
```

`createSplitProps` extracts variant keys from props so they never reach the DOM element.

### Via Context — compound components where Root owns the variants

```tsx
// Root: extract variants + shared props, store in Context
const [contextProps, otherProps] = createSplitProps<TabsContext>()(componentProps, [
    'variant', 'size', 'orientation', ...
]);
<TabsProvider value={contextProps}>
    <BaseTabs.Root className={cn(styles.root({ orientation }), className)} {...otherProps} />
</TabsProvider>

// Sub-part: read from Context, pass to its own recipe
const { variant, size, orientation } = useTabsContext();
<BaseTabs.Tab className={cn(styles.button({ variant, size, orientation }), className)} />
```

Context is used when the same variant value must style multiple sub-parts simultaneously. The sub-part's Props type uses `Omit` to remove Context-managed props, preventing users from passing them directly.

## CSS Variables — Component-scoped Tokens

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

## State Selectors

Use `when` helpers from `~/styles/mixins/logical-states` for Base UI data-attribute states. Do not use CSS pseudo-classes like `:disabled` or `:checked` directly.

```ts
import { when } from '~/styles/mixins/logical-states';

selectors: {
    [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
    [when.invalid()]:  { boxShadow: `inset 0 0 0 1px ${vars.color.border.danger}` },
}
```

## Design Tokens

Always reference design tokens via the `vars` object from `~/styles/themes.css`. Never use hard-coded values.

```ts
// ✅
color: vars.color.foreground.normal[200];
padding: vars.size.space['150'];

// ❌
color: '#1a1a1a';
padding: '12px';
```

## `css()` macro (consumer-facing styling)

New call sites — docs, demos, product code that composes vapor components — use the `css({...})` macro from `@vapor-ui/style-macro`. It compiles to atomic classnames at build time with no runtime style dictionary. Dynamic values are hoisted to CSS vars and injected into the element's `style` prop automatically.

```tsx
import { css } from '@vapor-ui/style-macro';

<div
    className={css({
        padding: '$space-400',
        color: accent, // dynamic → hoisted to a CSS var
        ':hover': { color: '$foreground-accent' },
        '@media (min-width: 768px)': { padding: '$space-600' },
    })}
/>;
```

- Internal `packages/core` component implementations stay on Vanilla Extract — do NOT replace `componentRecipe` / `componentStyle` with `css()` inside a component.
- Any new code that previously would have reached for `$css` on a vapor component — e.g. a layout wrapper in docs or an ad-hoc style on a leaf div — reaches for `css()` instead.

## Sprinkles (`$css` prop) — deprecated

The `$css` prop still accepts any CSS property with design-token–aware values. It is kept for migration only; do not add new call sites. Prefer the `css()` macro above.

```tsx
// ✅ migrated to css()
<div className={css({ padding: '$space-400', backgroundColor: '$background-primary' })} />

// ⚠️ legacy — remains working but should not be used in new code
<Box $css={{ padding: '150', backgroundColor: 'bg-primary-100' }} />

// ❌ (deprecated flat props)
<Box padding="150" backgroundColor="bg-primary-100" />
```

Deprecated flat sprinkle props (`padding`, `margin`, `color`, etc.) are also being phased out.

## `@layer` Cascade Order

```text
@layer vapor-theme       design token CSS variables
@layer vapor-reset       browser default resets
@layer vapor-components  componentRecipe / componentStyle output  ← core components live here
@layer vapor-utilities   `css()` macro output and deprecated sprinkles ($css)
(no layer)               user-supplied className — always wins
```

Any className without a layer declaration overrides `@layer vapor-components` regardless of specificity. This is why user `className` reliably overrides component styles without needing `!important`.
