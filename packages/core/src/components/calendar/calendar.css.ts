import { interaction } from '~/styles/mixins/interactions.css';
import { componentStyle } from '~/styles/mixins/layer-style.css';
import { when } from '~/styles/mixins/logical-states';
import { typography } from '~/styles/mixins/typography.css';
import { visuallyHidden } from '~/styles/mixins/visually-hidden.css';
import { vars } from '~/styles/themes.css';

export const root = componentStyle({
    display: 'inline-flex',
    flexDirection: 'column',
});

export const header = componentStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});

export const title = componentStyle([
    typography({ style: 'subtitle1' }),
    { color: vars.color.foreground.normal },
]);

export const grid = componentStyle({
    borderCollapse: 'collapse',
    borderSpacing: 0,
});

export const weekdays = componentStyle({
    boxShadow: `inset 0 -1px 0 ${vars.color.border.normal}`,
});

export const weekday = componentStyle([
    typography({ style: 'body2' }),
    {
        padding: 0,
        height: vars.size.dimension[500],
        color: vars.color.foreground.hint,
    },
]);

export const cell = componentStyle({ padding: 0 });

export const status = visuallyHidden;

export const day = componentStyle([
    interaction({ scale: 'light' }),
    typography({ style: 'body2' }),
    {
        aspectRatio: '1 / 1',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: vars.size.borderRadius[300],
        backgroundColor: 'transparent',
        cursor: 'pointer',
        padding: 0,
        height: vars.size.dimension[500],
        color: vars.color.foreground.normal,

        selectors: {
            '&[data-current]': { color: vars.color.foreground.primary },

            '&[data-selected]': {
                borderRadius: 0,
                backgroundColor: vars.color.background['primary-weak'],
                color: vars.color.foreground['primary-strong'],
            },
            '&[data-selection-start], &[data-selection-end]': {
                backgroundColor: vars.color.background.primary,
                color: vars.color.foreground.staticWhite,
            },
            '&[data-selection-start]': {
                borderStartStartRadius: vars.size.borderRadius[300],
                borderEndStartRadius: vars.size.borderRadius[300],
            },
            '&[data-selection-end]': {
                borderStartEndRadius: vars.size.borderRadius[300],
                borderEndEndRadius: vars.size.borderRadius[300],
            },

            '&[data-outside-month]': {
                cursor: 'default',
                pointerEvents: 'none',
                color: vars.color.foreground.hint,
            },

            [when.disabled()]: { opacity: 0.32, pointerEvents: 'none' },
        },

        // Forced colors drop the background, so mark selected days with a line instead.
        '@media': {
            '(forced-colors: active)': {
                selectors: {
                    '&[data-selected]': { outline: '1px solid CanvasText', outlineOffset: '-1px' },
                    '&[data-selection-start], &[data-selection-end]': {
                        outline: '2px solid Highlight',
                        outlineOffset: '-2px',
                    },
                },
            },

            '(prefers-reduced-motion: no-preference)': {
                selectors: {
                    'td[aria-selected="true"] > &[data-selection-start]': {
                        transitionDuration: '100ms',
                        transitionProperty: 'background-color, color',
                        transitionTimingFunction: 'ease-out',
                    },
                },
            },
        },
    },
]);
