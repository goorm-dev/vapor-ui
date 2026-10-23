import type { StyleRule } from '@vanilla-extract/css';

const BLOCK = ':is([data-side="top"], [data-side="bottom"])';
const INLINE = ':is([data-side="left"], [data-side="right"])';

/**
 * Places a popup arrow `offset` away from the aligned edge of the anchor for `start`/`end` alignment.
 *
 * Base UI already centers the arrow on the anchor (shift included), so we only translate it from
 * the anchor center to the aligned edge. `50%` resolves against the arrow's own box.
 *
 * When Base UI cannot center the arrow (`data-uncentered`: the anchor center lies outside the popup),
 * the translate would start from a clamped position, so fall back to a fixed edge offset instead.
 */
export const arrowAlign = (offset: { block: string; inline: string }) => {
    const toEdge = (size: string, gap: string) => `calc(${gap} + 50% - var(${size}) / 2)`;
    const blockShift = toEdge('--anchor-width', offset.block);
    const inlineShift = toEdge('--anchor-height', offset.inline);

    return {
        [`&[data-align="start"]${BLOCK}`]: { translate: `${blockShift} 0` },
        [`&[data-align="end"]${BLOCK}`]: { translate: `calc(-1 * ${blockShift}) 0` },
        [`&[data-align="start"]${INLINE}`]: { translate: `0 ${inlineShift}` },
        [`&[data-align="end"]${INLINE}`]: { translate: `0 calc(-1 * ${inlineShift})` },

        // `!important` overrides the inline position Base UI writes on the arrow.
        [`&[data-uncentered][data-align="start"]${BLOCK}`]: {
            translate: 'none',
            left: `${offset.block} !important`,
        },
        [`&[data-uncentered][data-align="end"]${BLOCK}`]: {
            translate: 'none',
            left: 'auto !important',
            right: offset.block,
        },
        [`&[data-uncentered][data-align="start"]${INLINE}`]: {
            translate: 'none',
            top: `${offset.inline} !important`,
        },
        [`&[data-uncentered][data-align="end"]${INLINE}`]: {
            translate: 'none',
            top: 'auto !important',
            bottom: offset.inline,
        },
    } satisfies Record<string, StyleRule>;
};
