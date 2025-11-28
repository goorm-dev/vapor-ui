import { createVar } from '@vanilla-extract/css';
import type { RecipeVariants } from '@vanilla-extract/recipes';
import { recipe } from '@vanilla-extract/recipes';

import { layerStyle } from '~/styles/mixins/layer-style.css';

export const gridTemplateRows = createVar({ inherits: false, syntax: '*' }, 'template-rows');
export const gridTemplateColumns = createVar({ inherits: false, syntax: '*' }, 'template-columns');

export const root = recipe({
    base: layerStyle('components', {
        gridTemplateRows: gridTemplateRows,
        gridTemplateColumns: gridTemplateColumns,
    }),

    defaultVariants: { flow: 'row' },
    variants: {
        /**
         * 그리드 아이템 배치 방향
         * @default 'row'
         */
        flow: {
            row: layerStyle('components', { gridAutoFlow: 'row' }),
            column: layerStyle('components', { gridAutoFlow: 'column' }),
            'row-dense': layerStyle('components', { gridAutoFlow: 'row dense' }),
            'column-dense': layerStyle('components', { gridAutoFlow: 'column dense' }),
        },
    },
});

export const gridItemRowSpan = createVar({ inherits: false, syntax: '*' }, 'item-row-span');
export const gridItemColSpan = createVar({ inherits: false, syntax: '*' }, 'item-col-span');

export const item = layerStyle('components', {
    gridRow: gridItemRowSpan,
    gridColumn: gridItemColSpan,
});

export type RootVariants = NonNullable<RecipeVariants<typeof root>>;
