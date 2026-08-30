import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';
import { typographyVariants } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    rowGap: vars.size.space['100'],
    width: '100%',
});

export const track = componentRecipe({
    base: {
        gridColumn: '1 / 3',
        borderRadius: vars.size.borderRadius['900'],
        backgroundColor: vars.color.background['secondary'],
        overflow: 'hidden',
    },

    defaultVariants: { size: 'md' },
    variants: {
        /**
         * Size of the meter. Controls the height of the track.
         */
        size: {
            sm: { height: vars.size.dimension['050'] },
            md: { height: vars.size.dimension['075'] },
            lg: { height: vars.size.dimension['150'] },
        },
    },
});

export const indicator = componentRecipe({
    base: {
        display: 'block',
        borderRadius: 'inherit',
    },

    defaultVariants: { type: 'default' },
    variants: {
        /**
         * Color of the filled portion of the meter.
         */
        type: {
            default: { backgroundColor: vars.color.background['primary'] },
            warning: { backgroundColor: vars.color.background['warning'] },
        },
    },
});

export const label = componentStyle({
    gridColumn: '1',
    color: vars.color.foreground['normal'],
    ...typographyVariants.subtitle1,
});

export const value = componentStyle({
    gridColumn: '2',
    textAlign: 'end',
    color: vars.color.foreground['secondary'],
    ...typographyVariants.subtitle1,
});

export type TrackVariants = NonNullable<RecipeVariants<typeof track>>;
export type IndicatorVariants = NonNullable<RecipeVariants<typeof indicator>>;
