import { foregrounds } from '~/styles/mixins/foreground.css';
import { typography } from '~/styles/mixins/typography.css';
import { layerStyle } from '~/styles/utils';
import { vars } from '~/styles/vars.css';

export const table = layerStyle('components', {
    borderCollapse: 'collapse',
});

export const row = layerStyle('components', {
    borderBottom: `1px solid`,
    borderBottomColor: vars.color.border.normal,
});

const tableData = layerStyle('components', {
    paddingBlock: vars.size.space[100],
    paddingInline: vars.size.space[300],
    textAlign: 'start',
});

export const heading = [
    typography({ style: 'subtitle1' }),
    foregrounds({ color: 'normal-100' }),
    tableData,
];

export const cell = [
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal-200' }),
    tableData,
];
