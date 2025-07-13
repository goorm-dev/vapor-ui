import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils/layer-style.css';

export const gridTemplateRows = createVar({ inherits: false, syntax: '*' }, 'template-rows');
export const gridTemplateColumns = createVar({ inherits: false, syntax: '*' }, 'template-columns');

export const root = recipe({
    base: layerStyle('vapor-component', {
        gridTemplateRows: gridTemplateRows,
        gridTemplateColumns: gridTemplateColumns,
    }),

    defaultVariants: { flow: 'row' },
    variants: {
        flow: {
            row: layerStyle('vapor-component', { gridAutoFlow: 'row' }),
            column: layerStyle('vapor-component', { gridAutoFlow: 'column' }),
            'row-dense': layerStyle('vapor-component', { gridAutoFlow: 'row dense' }),
            'column-dense': layerStyle('vapor-component', { gridAutoFlow: 'column dense' }),
        },
    },
});

export const gridItemRowSpan = createVar({ inherits: false, syntax: '*' }, 'item-row-span');
export const gridItemColSpan = createVar({ inherits: false, syntax: '*' }, 'item-col-span');

export const item = layerStyle('vapor-component', {
    gridRow: gridItemRowSpan,
    gridColumn: gridItemColSpan,
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
