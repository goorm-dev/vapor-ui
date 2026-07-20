---
description: Vanilla Extract styling conventions for packages/core — style, recipe, CSS variables, Sprinkles
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

Use when a component or part has visual variants. All styles are automatically placed inside `@layer vapor.components`.

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

At build time, each variant value gets its own CSS class inside `@layer vapor.components`. At runtime, `styles.root({ variant, size })` returns the matching className strings — no CSS is generated at runtime.

### `componentStyle` — static styles

Use when a component part has no variants — a single fixed className is generated at build time.

```ts
import { componentStyle } from '~/styles/mixins/layer-style.css';

export const title = componentStyle({
    fontSize: vars.typography.fontSize['200'],
    fontWeight: vars.typography.fontWeight['700'],
    color: vars.color.foreground.normal[200],
});
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

Use `createVar` to decouple color palette from visual variant within a single recipe. The palette variant sets the variable values; the visual variant consumes them.

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

This avoids N×M `compoundVariants` for every palette × variant combination.

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

## Sprinkles (`$css` prop)

`$css` accepts any CSS property with design-token–aware values. Token values produce a className; arbitrary values fall back to inline `style`.

```tsx
// ✅
<Box $css={{ padding: '150', backgroundColor: 'bg-primary-100' }} />

// ❌ (deprecated flat props)
<Box padding="150" backgroundColor="bg-primary-100" />
```

Deprecated flat sprinkle props (`padding`, `margin`, `color`, etc.) are being phased out — always use `$css={{ ... }}` instead.

## `@layer` Cascade Order

```text
@layer vapor.theme       design token CSS variables
@layer vapor.reset       browser default resets
@layer vapor.components  componentRecipe / componentStyle output  ← components live here
@layer vapor.utilities   sprinkles ($css) output
(no layer)               user-supplied className — always wins
```

Any className without a layer declaration overrides `@layer vapor.components` regardless of specificity. This is why user `className` reliably overrides component styles without needing `!important`.
