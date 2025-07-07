import { createVar } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/utils';

export const gridTemplateRows = createVar({ inherits: false, syntax: '*' }, 'template-rows');
export const gridTemplateColumns = createVar({ inherits: false, syntax: '*' }, 'template-columns');

export const root = recipe({
    base: layerStyle('component', {
        gridTemplateRows: gridTemplateRows,
        gridTemplateColumns: gridTemplateColumns,
    }),

    defaultVariants: { flow: 'row' },
    variants: {
        flow: {
            row: layerStyle('component', { gridAutoFlow: 'row' }),
            column: layerStyle('component', { gridAutoFlow: 'column' }),
            'row-dense': layerStyle('component', { gridAutoFlow: 'row dense' }),
            'column-dense': layerStyle('component', { gridAutoFlow: 'column dense' }),
        },
    },
});

export const gridItemRowSpan = createVar({ inherits: false, syntax: '*' }, 'item-row-span');
export const gridItemColSpan = createVar({ inherits: false, syntax: '*' }, 'item-col-span');

export const item = layerStyle('component', {
    gridRow: gridItemRowSpan,
    gridColumn: gridItemColSpan,
});
