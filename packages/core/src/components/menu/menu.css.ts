import { createVar, style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

const contentWidth = createVar({ inherits: false, syntax: '*' }, 'menu-content-width');
const contentHeight = createVar({ inherits: false, syntax: '*' }, 'menu-content-height');

export const contents = layerStyle('components', {
    display: 'flex',

    flexDirection: 'column',
    border: `0.0625rem solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.color.shadow.md,

    backgroundColor: vars.color.background.normal,
    paddingBlock: vars.size.space['050'],
    paddingInline: 0,
    width: '12.5rem',
    minWidth: contentWidth,

    overflowY: 'auto',
    vars: {
        [contentWidth]: 'var(--radix-dropdown-menu-trigger-width)',
    },
});

export const item = recipe({
    base: [
        interaction({ type: 'roving' }),
        typography({ style: 'body2' }),
        foregrounds({ color: 'normal' }),
        layerStyle('components', {
            position: 'relative',

            display: 'flex',
            alignItems: 'center',
            alignSelf: 'stretch',
            justifyContent: 'space-between',
            gap: vars.size.space['100'],

            margin: `0 ${vars.size.space['050']}`,
            border: 'none',

            borderRadius: vars.size.borderRadius['300'],
            cursor: 'pointer',
            paddingRight: vars.size.space['050'],
            paddingLeft: vars.size.space['250'],
            paddingBlock: vars.size.space['050'],

            width: `calc(100% - ${vars.size.space['050']} * 2)`,
            height: vars.size.dimension['400'],
        }),
    ],

    variants: {
        disabled: {
            true: layerStyle('components', { opacity: 0.32, pointerEvents: 'none' }),
        },
    },
});

export const separator = layerStyle('components', {
    flexShrink: 0,
    margin: `${vars.size.space['050']} 0`,
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const subContents = layerStyle('components', {
    display: 'flex',
    flexDirection: 'column',

    border: `0.0625rem solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.color.shadow.md,

    backgroundColor: vars.color.background.normal,
    paddingBlock: vars.size.space['050'],
    paddingInline: 0,

    minWidth: contentWidth,
    maxHeight: contentHeight,
    overflowY: 'auto',

    vars: {
        [contentWidth]: 'var(--radix-dropdown-menu-trigger-width)',
        [contentHeight]: 'var(--radix-dropdown-menu-content-available-height)',
    },
});

export const subTrigger = item;

export const groupLabel = style([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint' }),
    layerStyle('components', {
        marginBlock: 0,
        marginInline: vars.size.space['050'],
        paddingTop: vars.size.space['100'],
        paddingRight: vars.size.space['050'],
        paddingBottom: vars.size.space['050'],
        paddingLeft: vars.size.space['250'],
    }),
]);

export const indicator = style([
    foregrounds({ color: 'normal' }),
    layerStyle('components', {
        position: 'absolute',
        top: '50%',
        left: vars.size.space['050'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
        width: vars.size.dimension['150'],
        height: vars.size.dimension['150'],
    }),
]);

export type MenuItemVariants = NonNullable<RecipeVariants<typeof item>>;
