import { createVar, style } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { foregrounds } from '~/styles/mixins/foreground.css';
import { interaction } from '~/styles/mixins/interactions.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

const contentWidth = createVar(
    { inherits: false, syntax: '*', initialValue: '12.5rem' },
    'menu-content-width',
);

export const content = layerStyle('components', {
    display: 'flex',

    flexDirection: 'column',
    border: `0.0625rem solid ${vars.color.border.normal}`,

    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.normal,
    padding: vars.size.space['050'],
    width: '12.5rem',
    minWidth: contentWidth,

    overflowY: 'auto',
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

            border: 'none',

            borderRadius: vars.size.borderRadius['300'],
            cursor: 'pointer',
            paddingRight: vars.size.space['075'],
            paddingLeft: vars.size.space['250'],
            paddingBlock: vars.size.space['050'],

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
    marginBlock: vars.size.space['050'],
    backgroundColor: vars.color.border.normal,
    height: '0.0625rem',
});

export const subContents = layerStyle('components', {
    display: 'flex',
    flexDirection: 'column',

    border: `0.0625rem solid ${vars.color.border.normal}`,
    borderRadius: vars.size.borderRadius['300'],
    boxShadow: vars.shadow.md,

    backgroundColor: vars.color.background.normal,
    padding: vars.size.space['050'],

    minWidth: contentWidth,
    overflowY: 'auto',
});

export const subTrigger = item;

export const groupLabel = style([
    typography({ style: 'subtitle2' }),
    foregrounds({ color: 'hint' }),
    layerStyle('components', {
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
