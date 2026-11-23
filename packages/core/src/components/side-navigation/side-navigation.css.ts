import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const list = componentStyle({
    display: 'flex',
    flexDirection: 'column',
});

const row = componentStyle([
    interaction(),

    {
        display: 'flex',
        alignItems: 'center',
        gap: vars.size.space[100],

        borderRadius: vars.size.borderRadius[300],
        backgroundColor: 'transparent',

        width: '100%',
        height: vars.size.dimension[500],

        textWrap: 'nowrap',
        color: vars.color.foreground['normal'],

        selectors: {
            [when.current()]: { backgroundColor: vars.color.background['secondary'] },
            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },
    },
]);

export const topLevel = componentStyle([
    row,
    typography({ style: 'subtitle1' }),
    { paddingInline: vars.size.space[200] },
]);

export const indicator = componentStyle({
    display: 'flex',
    flexShrink: 0,

    transition: 'transform 200ms cubic-bezier(.4,0,.2,1)',
    marginInlineStart: 'auto',

    selectors: {
        '[data-panel-open] &': { transform: 'rotate(180deg)' },
    },
});

export const panel = componentStyle({
    display: 'flex',
    flexDirection: 'column',

    transition: 'height 200ms cubic-bezier(.4,0,.2,1)',

    willChange: 'height',
    height: 'var(--collapsible-panel-height)',
    overflow: 'hidden',

    selectors: {
        '&[data-starting-style], &[data-ending-style]': { height: 0 },
    },
});

export const subLink = componentRecipe({
    base: [
        row,
        {
            paddingInlineStart: vars.size.space[500],
            paddingInlineEnd: vars.size.space[200],

            color: vars.color.foreground['secondary'],

            selectors: {
                [when.current()]: { color: vars.color.foreground['normal'] },
                // NOTE: The panel clips overflow, so the focus ring is drawn inside the link.
                '&:focus-visible': { outlineOffset: '-2px' },
            },
        },
    ],

    defaultVariants: { current: false },
    variants: {
        /**
         * Whether the link is the current page, which makes the label medium weight like the other links.
         */
        current: {
            false: typography({ style: 'body2' }),
            true: typography({ style: 'subtitle1' }),
        },
    },
});
