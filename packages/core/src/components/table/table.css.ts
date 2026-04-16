import { foregrounds } from '~/styles/mixins/foreground.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
import { typography } from '~/styles/mixins/typography.css';
import { vars } from '~/styles/themes.css';

export const table = componentStyle({
    borderCollapse: 'collapse',
});

export const row = componentStyle({
    borderBottom: `1px solid`,
    borderBottomColor: vars.color.border.normal,
});

const tableData = componentStyle({
    paddingBlock: vars.size.space[100],
    paddingInline: vars.size.space[300],
    textAlign: 'start',
});

export const heading = componentStyle([
    typography({ style: 'subtitle1' }),
    foregrounds({ color: 'normal-100' }),
    tableData,
]);

export const cell = componentStyle([
    typography({ style: 'body2' }),
    foregrounds({ color: 'normal-200' }),
    tableData,
]);
