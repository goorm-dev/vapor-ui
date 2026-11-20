import { contrast } from '../../domain/color-math';
import type { ColorScale, Mode, Scale } from '../../domain/models/scale';
import { COLOR_SCALES } from '../../domain/models/scale';
import { A11Y_RULES, BG, TARGET_CONTRAST } from '../constants/palette-rules';

/** Every `A11Y_RULES` row for this mode and scale, with `self` read as `hex`. */
export const passesA11y = (hex: string, mode: Mode, scale: ColorScale) =>
    A11Y_RULES.filter((r) => r.mode === mode && r.scale === scale).every(
        (r) => contrast(r.fg === 'self' ? hex : r.fg, r.bg === 'self' ? hex : r.bg) >= r.min,
    );

/** `hex` placed at `scale` keeps contrast against the background strictly between its neighbours. */
export const isMonotone = (
    hex: string,
    mode: Mode,
    scale: ColorScale,
    row: Partial<Record<Scale, string>>,
) => {
    const i = COLOR_SCALES.indexOf(scale);
    const own = contrast(hex, BG[mode]);
    const prev = COLOR_SCALES[i - 1];
    const next = COLOR_SCALES[i + 1];
    return (
        (!prev || contrast(row[prev]!, BG[mode]) < own) &&
        (!next || own < contrast(row[next]!, BG[mode]))
    );
};

/**
 * The scale a brand HEX belongs to in `row`: walk scales nearest first by log-contrast distance
 * to the target, and take the first that passes the mode's accessibility rules and keeps the
 * contrast order with its neighbours. Undefined when no scale fits.
 */
export const assignCell = (hex: string, mode: Mode, row: Partial<Record<Scale, string>>) => {
    const own = Math.log(contrast(hex, BG[mode]));
    const distance = (s: ColorScale) => Math.abs(own - Math.log(TARGET_CONTRAST[mode][s]));
    return [...COLOR_SCALES]
        .sort((a, b) => distance(a) - distance(b))
        .find((s) => passesA11y(hex, mode, s) && isMonotone(hex, mode, s, row));
};
