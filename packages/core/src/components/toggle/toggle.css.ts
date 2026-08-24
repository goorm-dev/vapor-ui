import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { interaction } from '~/styles/mixins/interactions.css';
import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { vars } from '~/styles/themes.css';

const variables = {
    backgroundColor: createVar('background-color'),
};

export const root = componentRecipe({
    base: [
        interaction({ scale: 'light' }),
        {
            aspectRatio: '1 / 1',
            display: 'inline-flex',
            alignItems: 'center',

            justifyContent: 'center',

            borderRadius: vars.size.borderRadius['300'],
            backgroundColor: vars.color.background['canvas-base'],

            selectors: {
                [when.pressed()]: { backgroundColor: variables.backgroundColor },
                [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
            },
        },
    ],

    defaultVariants: { size: 'md', variant: 'default' },
    variants: {
        size: {
            sm: { gap: vars.size.space['075'], height: vars.size.dimension['300'] },
            md: { gap: vars.size.space['075'], height: vars.size.dimension['400'] },
            lg: { gap: vars.size.space['075'], height: vars.size.dimension['500'] },
            xl: { gap: vars.size.space['100'], height: vars.size.dimension['600'] },
        },
        variant: {
            default: {
                color: vars.color.foreground['secondary'],

                vars: {
                    [variables.backgroundColor]: vars.color.background['hint-weak'],
                },
            },
            accent: {
                color: vars.color.foreground['primary'],

                vars: {
                    [variables.backgroundColor]: vars.color.background['primary-weak'],
                },
            },
        },
    },
});

export const icon = componentStyle({
    selectors: {
        [`${root.classNames.base} > &:is(svg)`]: {
            width: 'max(16px, 50%)',
            height: 'max(16px, 50%)',
        },
    },
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
