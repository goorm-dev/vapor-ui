import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

import { componentRecipe, componentStyle } from '~/styles/mixins/layer-style.css';

export const gridTemplateRows = createVar({ inherits: false, syntax: '*' }, 'template-rows');
export const gridTemplateColumns = createVar({ inherits: false, syntax: '*' }, 'template-columns');

export const root = componentRecipe({
    base: {
        gridTemplateRows: gridTemplateRows,
        gridTemplateColumns: gridTemplateColumns,
    },

    defaultVariants: { flow: 'row', inline: false },
    variants: {
        /**
         * Displays the container as `inline-grid` instead of `grid`, so it sits inline with surrounding content.
         */
        inline: {
            true: { display: 'inline-grid' },
            false: { display: 'grid' },
        },
        /**
         * Direction in which items without an explicit position are placed, set as the `grid-auto-flow` value. The `-dense` values fill earlier gaps with later items.
         */
        flow: {
            row: { gridAutoFlow: 'row' },
            column: { gridAutoFlow: 'column' },
            'row-dense': { gridAutoFlow: 'row dense' },
            'column-dense': { gridAutoFlow: 'column dense' },
        },
    },
});

export const gridItemRowSpan = createVar({ inherits: false, syntax: '*' }, 'item-row-span');
export const gridItemColSpan = createVar({ inherits: false, syntax: '*' }, 'item-col-span');

export const item = componentStyle({
    gridRow: gridItemRowSpan,
    gridColumn: gridItemColSpan,
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
