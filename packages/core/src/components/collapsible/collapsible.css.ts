import { style } from '@vanilla-extract/css';

export const panel = style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',

    transition: 'height 200ms cubic-bezier(.4,0,.2,1)',

    willChange: 'height',
    height: 'var(--collapsible-panel-height)',
    overflow: 'hidden',

    selectors: {
        // 애니메이션 시작/끝 시에만 willChange 적용
        '&[data-starting-style], &[data-ending-style]': {
            height: 0,
        },
    },
});
